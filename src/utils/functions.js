const fileSystem = require("fs");

function getJsonData(fileName) {
  const allData = JSON.parse(
    fileSystem.readFileSync("src/database/" + fileName, "utf8")
  );
  return allData;
}

function createUpdateUser(fileName, data) {
  fileSystem.writeFileSync("src/database/" + fileName, JSON.stringify(data));
}

module.exports = {
  getJsonData,
  createUpdateUser,
};
