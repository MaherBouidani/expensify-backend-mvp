const { getUnpaidJobsByProfile, pay } = require('../services/jobService');

const getUnpaidJobs = async (req, res) => {
  const { profile } = req;

  const { status, response } = await getUnpaidJobsByProfile(profile.id);

  res.status(status).json(response);
};

const payForJob = async (req, res) => {
  const { profile } = req;
  const { job_id } = req.params;


  const { status, response } = await pay(job_id, profile);

  res.status(status).json(response);
};


module.exports = { getUnpaidJobs, payForJob };