import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "eu-west-1" });

// export async function catalogBatchProcess(event) {
//   console.log("eventINFO", event);
//   try {
//     for (const { body } of event.Records) {
//       const product = JSON.parse(body);
//       console.log("productINFO", product);
//       const message = `New product created: ${JSON.stringify(product)}`;
//       console.log(`New product created: ${JSON.stringify(product)}`);

//       const params = {
//         Message: message,
//         TopicArn: process.env.SNS_TOPIC_ARN,
//         MessageAttributes: {
//           price: {
//             DataType: "Number",
//             StringValue: product.price.toString(),
//           },
//         },
//       };

//       // Create a PublishCommand and send it using the SNS client
//       const command = new PublishCommand(params);
//       await snsClient.send(command);
//       console.log("Product event published to SNS:", product);
//     }
//   } catch (error) {
//     console.error("Error in processing or notifying:", error);
//     throw new Error("Error processing products or sending notifications");
//   }
// }

// Import AWS SDK clients and commands
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

// Initialize DynamoDB Client
const dbClient = new DynamoDBClient({ region: "eu-west-1" });

export async function catalogBatchProcess(event) {
  console.log("EVENT", event);
  console.log("Received EVEnt:", JSON.stringify(event, null, 2));
  if (!event.Records || event.Records.length === 0) {
    console.error("No records found in the event");
    return;
  }
  try {
    const records = event.Records.map((record) => JSON.parse(record.body));
    console.log("RECORSdInfo", records);

    for (const record of records) {
      const id = record.id || randomUUID();
      const productParams = {
        TableName: "Products",
        Item: {
          id: { S: id },
          title: { S: record.title },
          description: { S: record.description || "No description" },
          price: { N: String(record.price) },
        },
      };
      console.log("dbClient", dbClient);
      console.log("productParams", productParams);
      await dbClient.send(new PutItemCommand(productParams));

      const stockParams = {
        TableName: "Stocks",
        Item: {
          product_id: { S: id },
          count: { N: String(record.count) },
        },
      };
      console.log("stockParams", stockParams);
      await dbClient.send(new PutItemCommand(stockParams));

      console.log("Successfully processed product:", record.id);

      const publishParams = {
        // TopicArn: process.env.SNS_TOPIC_ARN, // Make sure to set this in your environment variables
        TopicArn: "arn:aws:sns:eu-west-1:533267006565:createProductTopic",
        Message: `New product created: ${JSON.stringify(record)}`,
        Subject: "New Product Notification",
      };
      console.log("publishParams", publishParams);
      await snsClient.send(new PublishCommand(publishParams));
      console.log("SNS notification sent for product:", record.id);
    }
  } catch (error) {
    console.error("Error processing products:", error);
    throw error;
  }
}
