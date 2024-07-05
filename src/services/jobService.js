const { Job } = require("../models/associations");
const { Contract } = require("../models/associations");
const { ContractStatuses } = require("../constants/contractStatuses");
const sequelize = require("../database");
const { profileTypes } = require("../constants/profileTypes");
const { Op } = require("sequelize");

const getUnpaidJobsByProfile = async (profileId) => {
  try {
    const unpaidJobs = await Job.findAll({
      include: [
        {
          model: Contract,
          where: {
            status: ContractStatuses.IN_PROGRESS,
            [Op.or]: [{ contractorId: profileId }, { clientId: profileId }],
          },
        },
      ],
      where: {
        paid: null,
      },
    });

    if (unpaidJobs.length === 0) {
      return { status: 404, response: "No unpaid jobs found" };
    }

    return { status: 200, response: unpaidJobs };
  } catch (error) {
    return { status: 500, response: "Internal Server Error" };
  }
};

const pay = async (job_id, profile) => {
  const t = await sequelize.transaction();
  try {
    const transactionOptions = { transaction: t, lock: t.LOCK.UPDATE };

    const job = await Job.findOne({
      where: {
        id: job_id,
      },
      include: [Contract],
      ...transactionOptions,
    });

    if (!job) {
      return { status: 404, response: "Job not found" };
    }

    if (profile.type != profileTypes.CLIENT) {
      return {
        status: 403,
        response: "Unauthorized, Profile is not of client type",
      };
    }

    if (profile.id !== job.Contract.ClientId) {
      return {
        status: 403,
        response: "Unauthorized, Job does not belong to profile",
      };
    }

    if (job.paid) {
      return { status: 400, response: "Job already paid" };
    }

    const client = await Profile.findOne({
      where: { id: job.Contract.ClientId },
      ...transactionOptions,
    });
    const contractor = await Profile.findOne({
      where: { id: job.Contract.ContractorId },
      ...transactionOptions,
    });

    if (!client || !contractor) {
      return { status: 404, response: "Profile not found" };
    }

    if (client.balance < job.price) {
      return { status: 400, response: "Insufficient funds" };
    }

    client.balance -= job.price;
    contractor.balance += job.price;

    await client.save(transactionOptions);
    await contractor.save(transactionOptions);

    job.paid = true;
    job.paymentDate = new Date();
    await job.save(transactionOptions);

    await t.commit();
    return { status: 200, response: "Job paid successfully" };
  } catch (error) {
    await t.rollback();
    return { status: 500, response: "Internal Server Error" };
  }
};

module.exports = { getUnpaidJobsByProfile, pay };
