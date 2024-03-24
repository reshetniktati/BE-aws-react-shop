export const generateBookMockData = (numBooks = 10) => {
  const bookTitles = [
    "The Great Gatsby",
    "To Kill a Mockingbird",
    "1984",
    "The Catcher in the Rye",
    "The Hobbit",
    "Pride and Prejudice",
    "Moby-Dick",
    "The Lord of the Rings",
    "The Adventures of Huckleberry Finn",
    "Harry Potter and the Sorcerer's Stone",
    "The Lion, the Witch and the Wardrobe",
  ];

  const books = [];

  for (let i = 0; i < numBooks; i++) {
    const title = bookTitles[i];
    const id = i + 1;
    const price = (Math.random() * 20 + 10).toFixed(2); // Price between 10 to 30 dollars
    const description = `description is about ${bookTitles[i]} book`;

    books.push({
      title,
      id,
      price,
      description,
    });
  }

  return books;
};
