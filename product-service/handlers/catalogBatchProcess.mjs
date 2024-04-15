import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "eu-west-1" });

export async function catalogBatchProcess(event) {
  console.log("eventINFO", event);
  try {
    for (const { body } of event.Records) {
      const product = JSON.parse(body);
      const message = `New product created: ${JSON.stringify(product)}`;
      console.log(`New product created: ${JSON.stringify(product)}`);

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
