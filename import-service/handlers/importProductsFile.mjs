import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: "eu-west-1" });

export const importProductsFile = async (event) => {
  console.log("eventINFO", event);

  const { name } = event.queryStringParameters;
  const bucketName = "import-product-bucket";
  const key = `uploaded/${name}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: "text/csv",
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    console.error("Error creating signed URL", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error creating signed URL" }),
    };
  }
};
