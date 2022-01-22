const fileSystem = require("fs");

const getJsonData = async (fileName) => {
  const allData = JSON.parse(
    await fileSystem.readFileSync("src/database/" + fileName, "utf8")
  );
  return allData;
};

const createUpdateData = async (fileName, data) => {
  await fileSystem.writeFileSync(
    "src/database/" + fileName,
    JSON.stringify(data)
  );
};

module.exports = {
  getJsonData,
  createUpdateData,
};
