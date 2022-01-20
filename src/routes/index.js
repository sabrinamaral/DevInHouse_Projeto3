const express = require("express");
const routes = express.Router();
const usersRouter = require("./v1/usersRouter");
const financeRouter = require("./v1/financeRouter");

routes.use("/api", [usersRouter, financeRouter]);

module.exports = routes;
