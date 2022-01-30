# Conta365_DEVinBank

API developed to meet the third DevInHouse Project course requirements.
It is a first version of a backend API that manage finance information.

## Installation

For a first usage, you must install the package.json.
Then, use the comand npm start to run the server.
The port is 3333.

```bash
npm install

npm start
```

## Usage

The API has six endpoints. Three for users ans three for deal with the user's transactions.

```bash
USERS

# post
endpoint: /api/user
"Endpoint to create user's information."
Must be provided a JSON in the body with name and email.

# patch
endpoint: /api/user/:id
"Endpoint to update user's information."
Must be provided a JSON in the body with name and email.

# get
endpoint: /api/user/:id
"Endpoint to fetch the user's information."

TRANSACTIONS

# post 'transactions'
endpoint: /api/finance/:userID
"The endpoint posts user's information by importing an excel worksheet."
Must be provided a xls file with the columns: price, typeOfExpenses, date, name, in this exactly order.

# get 'users'
endpoint: /api/finance/:userID
"Endpoint to get the user's transactions and their total."
It is also possible to filter by the year and typeOfExpenses through query.

# get 'users'
endpoint: /api/finance/:userID/:entryID
"Endpoint to delete a transaction from a specific user."
"Must be provided the user's ID and the transaction's ID.
```

## Languages

Node.JS

## Framework

Express

## Tools

excel-date-to-js
multer
nodemon
swagger
swagger-autogen
xlsx-populate

## License

[MIT](https://choosealicense.com/licenses/mit/)
