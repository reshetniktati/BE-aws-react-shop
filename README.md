# for creating a new book item using terminal command on testing tables:

here change 'id' to something else (ex: \"id\":\"test111111\"),

curl -X "PUT" -H "Content-Type: application/json" -d "{\"id\":\"test11\",\"title\":\"A New Test Book\",\"author\":\"Author Name\",\"description\":\"Description of the TEST book\",\"price\":20,\"stock\":100}" https://0768vir59a.execute-api.eu-west-1.amazonaws.com/items

# for POST/GET a new book item using Postman:

go to Postman, choose:

## POST:

- insert url https://t37zz0xgq4.execute-api.eu-west-1.amazonaws.com/products
- add body:
  {
  "id": "test1",
  "title": "A New Book",
  "author": "Author Name",
  "description": "Description of the book",
  "price": 20,
  "stock": 100
  }

## GET

- insert url https://t37zz0xgq4.execute-api.eu-west-1.amazonaws.com/products
- body: none
