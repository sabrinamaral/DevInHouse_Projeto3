const fileSystem = require("fs");

function getUsersFunc() {
  const allUsers = JSON.parse(
    fileSystem.readFileSync("src/database/user.json", "utf8")
  );
  return allUsers;
}

function createUpdateUser(fileName, data) {
  fileSystem.writeFileSync("src/database/" + fileName, JSON.stringify(data));
}

module.exports = {
  getUsersFunc,
  createUpdateUser,
};
