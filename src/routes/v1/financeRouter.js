const express = require("express");
const financeRouter = express.Router();

const multer = require("multer");
const upload = multer();

const financeController = require("../../controllers/financeController");

financeRouter.post(
  "/finance/:id",
  upload.single("file"),
  financeController.importFromXLS
);

module.exports = financeRouter;
