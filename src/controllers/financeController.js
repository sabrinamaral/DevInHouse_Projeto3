const xlsxPopulate = require("xlsx-populate");

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
    return res
      .status(200)
      .send({ message: "POST finance endpoint working..." });
  },
};
