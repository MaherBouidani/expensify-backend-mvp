const express = require("express");
const router = express.Router();
const { getProfile } = require("../middleware/getProfile");
const {getUnpaidJobs, payForJob} = require('../controllers/jobControllers');


router.get('/jobs/unpaid', getProfile, getUnpaidJobs);
router.post('/jobs/:job_id/pay', getProfile, payForJob);

module.exports = router;