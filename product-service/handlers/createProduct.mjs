import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const createProduct = async (event) => {
  const { id, title, author, description, price, stock } = JSON.parse(
    event.body
  );

  const productParams = {
    TableName: "Products",
    Item: {
      id,
      title,
      author,
      description,
      price,
    },
  };

  const stockParams = {
    TableName: "Stocks",
    Item: {
      product_id: id,
      count: stock,
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
