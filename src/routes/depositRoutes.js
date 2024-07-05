const express = require("express");
const router = express.Router();
const { getProfile } = require("../middleware/getProfile");
const { makeDeposit } = require("../controllers/depositController");

router.post("/balances/deposit/:userId", getProfile, makeDeposit);

module.exports = router;
