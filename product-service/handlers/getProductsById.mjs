import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const getProductsById = async (event) => {
  const productId = event.pathParameters.productId;
  console.log("Product INFO GET ID", productId);

  const productParams = {
    TableName: "Products",
    Key: { id: productId },
  };

  const stockParams = {
    TableName: "Stocks",
    Key: { product_id: productId },
  };

  try {
    const productResult = await docClient.send(new GetCommand(productParams));
    const product = productResult.Item;

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    const stockResult = await docClient.send(new GetCommand(stockParams));
    const stock = stockResult.Item;

    // Consolidate product details with stock information
    const consolidatedProduct = {
      ...product,
      count: stock ? stock.count : 0, // Default stock count to 0 if no stock information is found
    };

    return {
      statusCode: 200,
      body: JSON.stringify(consolidatedProduct),
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Could not retrieve product information",
        error: error.toString(),
      }),
    };
  }
};
