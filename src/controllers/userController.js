const req = require("express/lib/request");
const fileSystem = require("fs");
const { createUpdateData, getJsonData } = require("../utils/functions");

module.exports = {
  async createUser(req, res) {
    const { name, email } = req.body;
    const users = await getJsonData("user.json");

    // #swagger.tags = ['User']
    // #swagger.summary = 'Endpoint to create an user.'

    if (!name || !email) {
      return res.status(400).send({
        success: false,
        message: "Please, fill all the information required.",
      });
    }

    const userID = users.length + 1;
    const newUsers = [];
    newUsers.push(...users, { userID, name, email });
    createUpdateData("user.json", newUsers);
    return res
      .status(200)
      .send({ success: true, message: "Success! Users updated." });
  },

  async getUser(req, res) {
    const { id } = req.params;
    const users = await getJsonData("user.json");

    // #swagger.tags = ['User']
    // #swagger.summary = 'Endpoint to look up an user.'

    const singleUser = users.find((user) => user.userID === Number(id));
    if (!singleUser) {
      return res
        .status(404)
        .send({ success: false, message: `No user with id ${id}` });
    }
    return res.status(200).send({ success: true, users: singleUser });
  },

  async updateUser(req, res) {
    const { id } = req.params;
    const { name, email } = req.body;
    const users = await getJsonData("user.json");

    // #swagger.tags = ['User']
    // #swagger.summary = 'Endpoint to update an user.'

    if (!name || !email) {
      return res.status(400).send({
        success: false,
        message: "Please, fill all the information required.",
      });
    }

    const singleUser = await users.find((user) => user.userID === Number(id));
    if (!singleUser) {
      return res.status(404).send({
        success: false,
        message: `This user does not exist.`,
        data: users,
      });
    }

    const userUpdated = users.map((user) => {
      if (user.userID === Number(id)) {
        user.name = name;
        user.email = email;
      }
      return user;
    });

    createUpdateData("user.json", userUpdated);

    return res.status(200).send({
      success: true,
      message: `Success! User updated.`,
      dataUpdated: userUpdated,
    });
  },
};
