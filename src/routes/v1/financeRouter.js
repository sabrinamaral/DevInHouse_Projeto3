const express = require("express");
const financeRouter = express.Router();

const multer = require("multer");
const upload = multer();

const financeController = require("../../controllers/financeController");

financeRouter.post(
  "/finance/:userID",
  upload.single("file"),
  financeController.importFromXLS
);
financeRouter.delete(
  "/finance/:userID/:entryID",
  financeController.deleteTransaction
);

module.exports = financeRouter;
