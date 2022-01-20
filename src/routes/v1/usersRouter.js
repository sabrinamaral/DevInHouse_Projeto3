const express = require("express");
const usersRouter = express.Router();
const userController = require("../../controllers/userController");

usersRouter.post("/user", userController.createUser);

usersRouter.patch("/user/:id", userController.updateUser);

usersRouter.get("/user/:id", userController.getUser);

module.exports = usersRouter;
