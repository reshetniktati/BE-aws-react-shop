import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import csvParser from "csv-parser";
import { promisify } from "util";
import { pipeline, Writable } from "stream";

const s3Client = new S3Client({ region: "eu-west-1" });
const sqsClient = new SQSClient({ region: "eu-west-1" });
const pipelineAsync = promisify(pipeline);

async function moveFile(bucketName, objectKey, destinationKey) {
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${objectKey}`,
      Key: destinationKey,
    })
  );
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    })
  );
}

const sendRecordToSQS = async (record, queueUrl) => {
  const params = {
    MessageBody: JSON.stringify(record),
    QueueUrl: queueUrl,
  };
  console.log("paramsImpportParsMessage", params);
  await sqsClient.send(new SendMessageCommand(params));
};

const processCsv = async (bucketName, objectKey, queueUrl) => {
  const getObjectParams = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(getObjectParams));

    await pipelineAsync(
      data.Body,
      csvParser(),
      new Writable({
        objectMode: true,
        write: async (chunk, encoding, callback) => {
          try {
            await sendRecordToSQS(chunk, queueUrl);
            callback();
          } catch (error) {
            callback(error);
          }
        },
      })
    );

    console.log(`Successfully processed ${objectKey}`);
  } catch (err) {
    console.error("Error processing file:", err);
    throw err;
  }
};

export const importFileParser = async (event) => {
  const queueUrl =
    "https://sqs.eu-west-1.amazonaws.com/533267006565/catalogItemsQueue";

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " ")
    );

    try {
      await processCsv(bucketName, objectKey, queueUrl);

      const destinationKey = objectKey.replace("uploaded/", "parsed/");
      await moveFile(bucketName, objectKey, destinationKey);
      console.log(`File moved from ${objectKey} to ${destinationKey}`);
    } catch (error) {
      console.error("Error processing/moving file:", error);
      console.log(`Bucket: ${bucketName}, Key: ${objectKey}`);
      throw error;
    }
  }
};
