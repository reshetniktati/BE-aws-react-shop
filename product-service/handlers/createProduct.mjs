import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const isValidProduct = (title, description, price, count) => {
  if (!title || !description || !price || price <= 0 || count < 0) {
    return false;
  }
  return true;
};

export const createProduct = async (event) => {
  const { title, description, price, count } = JSON.parse(event.body);
  console.log("ProductINFO", title, description, price, count); // info about product to be created
  const id = randomUUID();

  if (!isValidProduct(title, description, price, count)) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Invalid product data",
      }),
    };
  }

  const productParams = {
    TableName: "Products",
    Item: {
      id,
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
  } catch (error) {
    console.error("Error adding product to ProductsTable:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to add product to ProductsTable",
        error: error.toString(),
      }),
    };
  }

  try {
    await docClient.send(new PutCommand(stockParams));
  } catch (error) {
    console.error("Error adding stock info to StocksTable:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to add stock information to StocksTable",
        error: error.toString(),
        productId: id,
      }),
    };
  }

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      message: "Product created successfully",
      productId: id,
    }),
  };
};
