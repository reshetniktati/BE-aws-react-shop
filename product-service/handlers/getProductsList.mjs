import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const getProductsList = async (event) => {
  try {
    const productsCommand = new ScanCommand({ TableName: "Products" });
    const productsData = await docClient.send(productsCommand);
    const products = productsData.Items;

    const stocksCommand = new ScanCommand({ TableName: "Stocks" });
    const stocksData = await docClient.send(stocksCommand);
    const stocks = stocksData.Items;

    // Consolidating products with their stock counts
    const consolidatedProducts = products.map((product) => {
      const stock = stocks.find((stock) => stock.product_id === product.id);
      return {
        ...product,
        stock: stock ? stock.count : 0, // Default to 0 if no stock info is found
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(consolidatedProducts),
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.toString(),
      }),
    };
  }
};
