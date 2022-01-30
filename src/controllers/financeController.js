const xlsxPopulate = require("xlsx-populate");
const { getJsDateFromExcel } = require("excel-date-to-js");
const { getJsonData, createUpdateData } = require("../utils/functions");

module.exports = {
  async importFromXLS(req, res) {
    // getting info from JSON
    const transactions = await getJsonData("finance.json");
    const users = await getJsonData("user.json");

    /* 
#swagger.tags = ['Transactions']
#swagger.summary = 'Endpoint to import transactions from a xls file.'
#swagger.consumes = ['multipart/form-data']  
    #swagger.parameters['file'] = {
        in: 'formData',
        type: 'file',
        required: 'true',
        description: 'Upload your file here.'}
*/

    // verifying if there is the user
    const existUser = users.find(
      (user) => user.userID === Number(req.params.userID)
    );

    // if there is no user, send a 404
    if (!existUser) {
      return res
        .status(404)
        .send({ success: false, message: `User doesn't exist.` });
    }
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: `You must provide a xls file to import.`,
      });
    }
    // verifying the file type
    const excelFile =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const mimeType = req.file.mimetype;
    const rightType = excelFile === mimeType;

    // if it's not the correct type, send a 400
    if (!rightType) {
      return res.status(400).send({
        success: false,
        message: `Please provide a xls file type to import.`,
      });
    }

    // otherwise get the buffer data from the file in req
    const xlsxBuffer = req.file.buffer;

    // transform these buffer in row data and then (line below) into rows
    const bufferToData = await xlsxPopulate.fromDataAsync(xlsxBuffer);
    const rows = bufferToData.sheet(0).usedRange().value();

    // save the first row into a variable and get rid of it at the same time
    const firstRow = rows.shift();
    const keys = ["price", "typeOfExpenses", "date", "name"];

    // make sure the worksheet has the right columns with .every()
    const allKeys = firstRow.every((item, index) => {
      return keys[index] === item;
    });

    // if the columns are wrong send a response 400
    if (!allKeys || keys.length !== 4) {
      return res.status(400).send({
        success: false,
        message: `Please, make your woksheet with these specific columns: price, typeOfExpenses, date, name, in this exactly order.`,
      });
    }

    // if the columns are right, change the date format
    const newData = rows.map((row) => {
      const result = row.map((cell, index) => {
        if (index === 2) {
          cell = getJsDateFromExcel(cell);
        }
        // if there is data in cell, return cell; otherwise return an empty string
        return {
          [firstRow[index]]: cell ? cell : "",
        };
      });
      // create an object with the newData from the worksheet
      return Object.assign({}, ...result);
    });
    // verifying if the JSON has anything, if its length is bigger than zero
    // compare the userID from the list of transactions with the userID from existUser (list of users x params)
    if (transactions.length > 0) {
      let userTransactions = transactions.find(
        (t) => t.userID === existUser.userID
      );
      // if there is NO user in transactions, create the template
      // take the userID from the users list and the financialData from the newData (worksheet) created above

      if (!userTransactions) {
        userTransactions = {
          id: transactions.length + 1,
          userID: existUser.userID,
          financialData: newData.map((item, index) => {
            return {
              entryID: index + 1,
              ...item,
            };
          }),
        };

        // insert the userTransactions object above into the transactions array and then in the finance JSON
        transactions.push(userTransactions);
        await createUpdateData("finance.json", transactions);
        // if there is the user searched, copy all the information in the financialData/JSON,
        // and iterate the newData to give it an entryID
      } else {
        userTransactions.financialData = [
          ...userTransactions.financialData,
          ...newData.map((item, index) => {
            return {
              entryID: userTransactions.financialData.length + index + 1,
              ...item,
            };
          }),
        ];
        // take the rigth position in the transactions array,
        //overwrite it with the userTransactions info created above and register it in the JSON
        transactions[userTransactions.id - 1] = userTransactions;
        await createUpdateData("finance.json", transactions);
      }
      return res.status(200).send({
        success: true,
        message: `Success! Entry registered.`,
        data: transactions,
      });
    }
    // if transactions is empty, create an object and add the newData from the worksheet
    if (transactions.length === 0) {
      userTransactions = {
        id: 1,
        userID: existUser.userID,
        financialData: [
          ...newData.map((item, index) => {
            return {
              entryID: index + 1,
              ...item,
            };
          }),
        ],
      };
      // update JSON
      transactions.push(userTransactions);
      await createUpdateData("finance.json", transactions);
    }

    return res.status(200).send({
      success: true,
      message: `Success! Entry registered.`,
      data: transactions,
    });
  },

  async deleteTransaction(req, res) {
    // get data from JSON
    const transactions = await getJsonData("finance.json");
    const users = await getJsonData("user.json");

    // get info from params
    const { userID, entryID } = req.params;

    /* 
    #swagger.tags = ['Transactions']
    #swagger.summary = 'Endpoint to delete a transaction from a specific user.'
    */

    // verifying if there is the user
    const existUser = users.find((user) => user.userID === Number(userID));
    // if there is no user, send a 404 error
    if (!existUser) {
      return res
        .status(404)
        .send({ success: false, message: `User not found.` });
    }
    // check if there is transactions for the user
    const transactionFound = transactions.find(
      (item) => item.userID === existUser.userID
    );
    //  if there is no transaction, send a 404
    if (!transactionFound) {
      return res.status(404).send({
        success: "false",
        message: "There is no transaction for this user.",
      });
    }
    // get the position of the transaction to be deleted
    const positionToDelete = transactionFound.financialData.findIndex(
      (t) => t.entryID === Number(entryID)
    );

    // delete the transaction
    transactionFound.financialData.splice(positionToDelete, 1);

    // if the transaction doesn't exist, send a 404
    if (positionToDelete === -1) {
      return res
        .status(404)
        .send({ success: false, message: `This transaction doesn't exist.` });
    }

    // update JSON
    createUpdateData("finance.json", transactions);

    return res.status(200).send({
      success: true,
      message: `Transaction deleted.`,
      data: transactions,
    });
  },

  async totalTransactions(req, res) {
    // get params and queries
    const { userID } = req.params;
    const { year, type } = req.query;

    // get data from JSON
    const users = await getJsonData("user.json");
    const transactions = await getJsonData("finance.json");

    /* 
    #swagger.tags = ['Transactions']
    #swagger.summary = 'Endpoint to look up the user\'s transactions.'
    #swagger.description = 'Endpoint to get the user\'s transactions and their total. It is also possible to filter by the year and typeOfExpenses through query.'
    **/

    // verify if there is the user
    const existUser = users.find((u) => u.userID === Number(userID));
    if (!existUser) {
      return res
        .status(404)
        .send({ success: false, message: `No user found with id ${userID}.` });
    }

    // verify if there is any transaction for the user
    const existTransaction = transactions.find(
      (t) => t.userID === existUser.userID && t.financialData.length > 0
    );

    // if there is no transaction, send a 404
    if (!existTransaction) {
      return res.status(404).send({
        success: false,
        message: `This user doesn't have any transactions.`,
      });
    }
    // look up for all the amounts for the user
    const priceUser = existTransaction.financialData.map((t) => t.price);

    // sum all the amounts for the user, despite the period
    const sumUser = priceUser.reduce(
      (prevValue, currValue) => prevValue + currValue
    );

    // filter by year
    const dateFromUser = existTransaction.financialData.map((t) => t.date);
    const transactYear = dateFromUser.map((d) => new Date(d).getFullYear());
    const yearQueryFound = transactYear.find((y) => y === Number(year));
    const yearMatch = transactYear.find((y) => y === yearQueryFound);

    // if there is no transactions for the year searched, return a 404
    if (year && !yearMatch) {
      return res.status(404).send({
        success: false,
        message: `There is no transaction for the year ${year}`,
      });
    }

    // if there is only a typeOfExpense in the query, ask for the year
    if (!year && type) {
      return res.status(404).send({
        success: false,
        message: `Please provide a year.`,
      });
    }
    //  get only user transactions for the year
    const userTransactYear = existTransaction.financialData.filter((t) => {
      if (new Date(t.date).getFullYear() === Number(year)) {
        return t;
      }
    });
    // find the type
    const typeMatch = userTransactYear.find((t) => t.typeOfExpenses === type);

    // if the type doesn't match, send a 404
    if (year && type && !typeMatch) {
      return res.status(404).send({
        success: false,
        message: `Please, provide an existing category. For example: groceries, eating out, petrol, rent, utilities.`,
      });
    }

    // if year and typeOfExpense are provided,
    if (year && yearMatch && typeMatch) {
      // get the transactions only for the year
      const userTransactYear = existTransaction.financialData.filter((t) => {
        if (new Date(t.date).getFullYear() === Number(year)) {
          return t;
        }
      });

      // return the transactions by type
      const typeExpenses = userTransactYear.filter((t) => {
        if (t.typeOfExpenses === type) {
          return t;
        }
      });
      // return the sum by type
      const typePrice = typeExpenses.map((t) => t.price);
      const priceSum = typePrice.reduce(
        (prevValue, currValue) => prevValue + currValue
      );

      return res.status(200).send({
        success: true,
        message: `The total for ${type} is $${priceSum} dollars`,
        data: typeExpenses,
      });
    }
    if (yearMatch) {
      //  get only user transactions for the year
      const userTransactYear = existTransaction.financialData.filter((t) => {
        if (new Date(t.date).getFullYear() === Number(year)) {
          return t;
        }
      });
      // sum all the amounts for the year
      const amountArr = userTransactYear.map((t) => t.price);
      const sumForYear = amountArr.reduce(
        (prevValue, currValue) => prevValue + currValue
      );
      return res.status(200).send({
        success: true,
        message: `The total for ${year} is $${sumForYear} dollars`,
        data: userTransactYear,
      });
    }

    return res.status(200).send({
      success: true,
      message: `This user so far has a total of $${sumUser} dollars.`,
      data: existTransaction.financialData,
    });
  },
};
