const express = require("express");
const router = express.Router();
const { getProfile } = require("../middleware/getProfile");
const { makeDeposit } = require("../controllers/depositController");

router.get("/balances/deposit/:userId", getProfile, makeDeposit);

module.exports = router;
