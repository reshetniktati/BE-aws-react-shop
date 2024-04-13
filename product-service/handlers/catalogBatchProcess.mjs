// Import AWS SDK for JavaScript v3 modules
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// Initialize SNS Client
const snsClient = new SNSClient({ region: "us-east-1" });

export async function catalogBatchProcess(event) {
  try {
    for (const { body } of event.Records) {
      const product = JSON.parse(body);
      const message = `New product created: ${JSON.stringify(product)}`;

      const params = {
        Message: message,
        TopicArn: process.env.SNS_TOPIC_ARN,
        MessageAttributes: {
          price: {
            DataType: "Number",
            StringValue: product.price.toString(),
          },
        },
      };

      // Create a PublishCommand and send it using the SNS client
      const command = new PublishCommand(params);
      await snsClient.send(command);
      console.log("Product event published to SNS:", product);
    }
  } catch (error) {
    console.error("Error in processing or notifying:", error);
    throw new Error("Error processing products or sending notifications");
  }
}
