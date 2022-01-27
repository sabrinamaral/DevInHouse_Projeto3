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
#swagger.summary = 'Endpoint to import transactions from a xml file.'
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
    // otherwise get the buffer data from the file in req
    const xlsxBuffer = req.file.buffer;

    // transform these buffer in row data and then (line below) into rows
    const bufferToData = await xlsxPopulate.fromDataAsync(xlsxBuffer);
    const rows = bufferToData.sheet(0).usedRange().value();

    // save the first row into a variable and get rid of it at the same time
    const firstRow = rows.shift();
    const keys = ["price", "typeOfExpenses", "date", "name"];

    // make sure if the worksheet has the right columns with .every()
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
        (single) => single.userID === existUser.userID
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

    const idUserTransaction = transactions.map(
      (transaction) => transaction.userID
    );

    const userFound = idUserTransaction.find(
      (item) => item === existUser.userID
    );

    if (!userFound) {
      return res.status(404).send({
        success: "false",
        message: "there is no transaction for this user.",
      });
    }

    let transaction = transactions.find((t) => t.userID === userFound);

    const toBeDeleted = transaction.financialData.find(
      (i) => i.entryID === Number(entryID)
    );

    const positionToDelete = transaction.financialData.findIndex(
      (transaction) => transaction.entryID === Number(entryID)
    );

    transaction = transaction.financialData.splice(positionToDelete, 1);

    if (positionToDelete === -1) {
      return res
        .status(404)
        .send({ success: false, message: `This transaction doesn't exist.` });
    }
    createUpdateData("finance.json", transactions);

    return res.status(200).send({ data: transactions });
  },
};
