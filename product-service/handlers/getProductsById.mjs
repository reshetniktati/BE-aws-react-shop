import { generateBookMockData } from "../mocks/productsMock.mjs";
const mockBooks = generateBookMockData();

export const getProductsById = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const product = mockBooks.find(
      (product) => product.id === Number(productId)
    );

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
