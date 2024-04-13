# for creating a new book item using terminal command on testing tables:

run npm create-product

# for POST/GET a new book item using Postman:

go to Postman, choose:

## POST:

- insert url https://4wubb2g7mj.execute-api.eu-west-1.amazonaws.com/products
- add body:
  {
  "id": "test1",
  "title": "A New Book",
  "description": "Description of the book",
  "price": 20,
  "count": 100
  }

## GET

- insert url https://4wubb2g7mj.execute-api.eu-west-1.amazonaws.com/products
- body: none
