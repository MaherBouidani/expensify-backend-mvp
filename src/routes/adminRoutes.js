const express = require("express");
const router = express.Router();
const {
  getBestProfession,
  getBestClients,
} = require("../controllers/adminControllers");

router.get("/admin/best-profession", getBestProfession);
router.get("/admin/best-clients", getBestClients);

module.exports = router;
