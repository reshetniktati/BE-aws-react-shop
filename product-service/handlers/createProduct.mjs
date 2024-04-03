import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
const uuid = uuidv4();

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const createProduct = async (event) => {
  const { title, description, price, count } = JSON.parse(event.body);

  const productParams = {
    TableName: "Products",
    Item: {
      id: uuid(),
      title,
      description,
      price,
    },
  };

  const stockParams = {
    TableName: "Stocks",
    Item: {
      product_id: id,
      count: count,
    },
  };

  try {
    await docClient.send(new PutCommand(productParams));

    await docClient.send(new PutCommand(stockParams));

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Product created successfully",
        productId: id,
      }),
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to create product",
        error: error.toString(),
      }),
    };
  }
};
