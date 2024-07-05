const express = require("express");
const router = express.Router();
const { getProfile } = require("../middleware/getProfile");
const {
  getContract,
  getNonTerminatedContracts,
} = require("../controllers/contractControllers");

router.get("/contracts/:id", getProfile, getContract);
router.get("/contracts", getProfile, getNonTerminatedContracts);

module.exports = router;
