import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import stream from "stream";
import { promisify } from "util";

const s3Client = new S3Client({ region: "eu-west-1" });
const pipeline = promisify(stream.pipeline);

async function moveFile(bucketName, sourceKey, destinationKey) {
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${sourceKey}`,
      Key: destinationKey,
    })
  );
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: sourceKey,
    })
  );
}

export const importFileParser = async (event) => {
  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const sourceKey = decodeURIComponent(
      record.s3.object.key.replace(/\+/g, " ")
    );

    try {
      const getObjectParams = {
        Bucket: bucketName,
        Key: sourceKey,
      };

      const readStream = s3Client
        .send(new GetObjectCommand(getObjectParams))
        .createReadStream();

      // Parsing the CSV file
      await pipeline(
        readStream,
        csvParser(),
        new stream.Writable({
          objectMode: true,
          write(record, encoding, callback) {
            console.log(record);
            callback();
          },
        })
      );

      console.log(`CSV file ${sourceKey} has been processed`);

      const destinationKey = sourceKey.replace("uploaded/", "parsed/");
      await moveFile(bucketName, sourceKey, destinationKey);
      console.log(`File moved from ${sourceKey} to ${destinationKey}`);
    } catch (error) {
      console.error("Error processing/moving file:", error);
      throw error;
    }
  }
};
