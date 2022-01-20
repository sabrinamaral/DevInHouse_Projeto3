const req = require("express/lib/request");
const fileSystem = require("fs");
const { getUsersFunc, createUpdateUser } = require("../utils/functions");

const users = getUsersFunc();

module.exports = {
  async createUser(req, res) {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).send({
        success: false,
        message: "Please, fill all the information required.",
      });
    }
    const id = users.length + 1;
    const newUsers = [];
    newUsers.push(...users, { id, name, email });

    createUpdateUser("user.json", newUsers);

    return res
      .status(200)
      .send({ success: true, message: "Success! User created." });
  },

  async getUser(req, res) {
    const { id } = req.params;

    const singleUser = users.find((user) => user.id === Number(id));
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

    const singleUser = await users.find((user) => user.id === Number(id));
    if (!singleUser) {
      return res.status(404).send({
        success: false,
        message: `This user does not exist.`,
        data: users,
      });
    }

    const userUpdated = users.map((user) => {
      if (user.id === Number(id)) {
        user.name = name;
        user.email = email;
      }
      return user;
    });

    createUpdateUser("user.json", userUpdated);

    return res.status(200).send({
      success: true,
      message: `Success! User updated.`,
      dataUpdated: userUpdated,
    });
  },
};
