import { generateBookMockData } from "../mocks/productsMock.mjs";
const mockBooks = generateBookMockData();

export const getProductsList = async (event) => {
  const products = mockBooks;
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
