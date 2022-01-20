const xlsxPopulate = require("xlsx-populate");
const { getJsDateFromExcel } = require("excel-date-to-js");
const { getJsonData, createUpdateUser } = require("../utils/functions");

const transactions = getJsonData("finance.json");

module.exports = {
  async importFromXLS(req, res) {
    const { idSheet } = req.params;
    const xlsxBuffer = req.file.buffer;
    const bufferToData = await xlsxPopulate.fromDataAsync(xlsxBuffer);
    const rows = bufferToData.sheet(0).usedRange().value();

    const [firstRow] = rows;
    const keys = ["price", "typeOfExpenses", "date", "name"];
    const allKeys = firstRow.every((item, index) => {
      return keys[index] === item;
    });
    if (!allKeys) {
      return res.status(400).send({
        success: false,
        message: `Please, make your woksheet with these specific columns: price, typeOfExpenses, date, name, in this exactly order.`,
      });
    }
    rows.shift();
    rows.map((row) => {
      if ([row[2]]) {
        row[2] = getJsDateFromExcel(row[2]);
      }
      const result = row.map((cell, index) => {
        return {
          [firstRow[index]]: cell ? cell : "",
        };
      });
      const idEntry = new Date().getTime();
      const financeObj = Object.assign({}, { idEntry }, ...result);
      transactions.push(financeObj);
      createUpdateUser("finance.json", transactions);
    });

    return res
      .status(200)
      .send({ success: true, message: `Success! Entry registered.` });
  },
};
