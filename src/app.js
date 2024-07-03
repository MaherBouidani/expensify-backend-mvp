const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require("./model");
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


module.exports = app;
