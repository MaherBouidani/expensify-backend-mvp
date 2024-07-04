const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, Contract } = require("./model");
const { Op } = require("sequelize");
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)



/**
 * FIX ME!
 * @returns contract by id
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const { profile } = req;
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [{ clientId: profile.id }, { contractorId: profile.id }],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

app.get("/contracts", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { profile } = req;
  const listOfContracts = await Contract.findAll({
    where: {
      [Op.and]: [
        { [Op.or]: [{ clientId: profile.id }, { contractorId: profile.id }] },
        { status: { [Op.ne]: "terminated" } },
      ],
    },
  });
  console.log(listOfContracts);
  if (listOfContracts.length == 0) return res.status(404).end();
  res.json(listOfContracts);
});

app.get("/jobs/unpaid", getProfile, async (req, res) => {
  const { Contract, Job } = req.app.get("models");
  const { profile } = req;

  try {
    const unpaidJobs = await Job.findAll({
      include: [
        {
          model: Contract,
          where: {
            status: "in_progress",
            [Op.or]: [{ contractorId: profile.id }, { clientId: profile.id }],
          },
        },
      ],
      where: {
        paid: null,
      },
    });

    if (unpaidJobs.length === 0) {
      return res.status(404).end();
    }

    res.json(unpaidJobs);
  } catch (error) {
    console.error("Error retrieving unpaid jobs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
  const { Job, Profile } = req.app.get("models");
  const { profile } = req;
  const { job_id } = req.params;
  const t = await sequelize.transaction();

  try {
    const transactionOptions = {transaction: t, lock: t.LOCK.UPDATE};

    // const balance = profile.balance;
    const job = await Job.findOne({
      where: {
        id: job_id
      }, include: [Contract], ...transactionOptions
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (profile.type != "client"){
        return res.status(403).json({ error: "Unauthorized, Profile is not of client type" });
    } 

    if (profile.id !== job.Contract.ClientId){
        return res.status(403).json({ error: "Unauthorized, Job does not belong to profile" });
    }

    if (job.paid) { 
        return res.status(400).json({ error: "Job already paid" });
    }

    const client = await Profile.findOne({where: {id: job.Contract.ClientId}, ...transactionOptions});
    const contractor = await Profile.findOne({where: {id: job.Contract.ContractorId}, ...transactionOptions});

    if (!client || !contractor){
        return res.status(404).json({ error: "Profile not found" });
    }

    if (client.balance < job.price) {
        return res.status(400).json({ error: "Insufficient funds" });
    }

    client.balance -= job.price;
    contractor.balance += job.price;

    await client.save(transactionOptions);
    await contractor.save(transactionOptions);

    job.paid = true;
    job.paymentDate = new Date();
    await job.save(transactionOptions);

    await t.commit();
    res.json({ message: 'Job paid successfully' });

  } catch (error) {
    await t.rollback();
    console.error("Error paying job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = app;
