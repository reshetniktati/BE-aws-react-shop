import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

async function populateTables() {
  const productsData = [
    {
      title: "Example Book 1",
      description: "This is an example description 1",
      price: 100,
    },
    {
      title: "Example Book 2",
      description: "This is an example description 2",
      price: 200,
    },
  ];

  for (const product of productsData) {
    const productId = randomUUID();

    // Insert into products table
    await docClient.send(
      new PutCommand({
        TableName: "Products",
        Item: {
          id: productId,
          title: product.title,
          description: product.description,
          price: product.price,
        },
      })
    );

    const stockCount = 20; //for instance

    await docClient.send(
      new PutCommand({
        TableName: "Stocks",
        Item: {
          product_id: productId,
          count: stockCount,
        },
      })
    );
  }

  console.log("Data inserted successfully.");
}

populateTables().catch((error) => {
  console.error("Error populating tables:", error);
});
