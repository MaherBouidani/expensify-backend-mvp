const { Job } = require("../models/associations");
const { Contract } = require("../models/associations");
const { Profile } = require("../models/associations");
const { DEPOSIT_RATIO } = require("../constants/otherConstants");
const sequelize = require("../database");
const { profileTypes } = require("../constants/profileTypes");

const executeDeposit = async (userId, amount) => {
  const MAX_RETRIES = 3;

  let retries = 0;

  async function attemptDeposit() {
    const t = await sequelize.transaction();

    try {
      const transactionOptions = { transaction: t, lock: t.LOCK.UPDATE };

      const profile = await Profile.findOne({
        where: { id: userId },
        ...transactionOptions,
      });

      if (!profile) {
        return { status: 404, response: "Profile not found" };
      }

      if (profile.type !== profileTypes.CLIENT) {
        return {
          status: 403,
          response: "Unauthorized, Profile is not of client type",
        };
      }

      if (amount <= 0) {
        return { status: 400, response: "Invalid amount" };
      }

      const totalJobsToPay = await Job.sum("price", {
        where: { paid: null },
        include: {
          model: Contract,
          where: { clientId: profile.id },
        },
        ...transactionOptions,
      });

      const maxAllowedDeposit = totalJobsToPay * DEPOSIT_RATIO;

      if (maxAllowedDeposit < amount) {
        return {
          status: 400,
          response: `Deposit amount exceeds the allowable limit of ${maxAllowedDeposit}`,
        };
      }

      profile.balance += amount;
      await profile.save(transactionOptions);

      await t.commit();
      return { status: 201, response: result };
    } catch (error) {
      await t.rollback();
      if (
        error.name === "SequelizeTimeoutError" &&
        error.parent.code === "SQLITE_BUSY" &&
        retries < MAX_RETRIES
      ) {
        retries++;
        const delayMs = Math.pow(2, retries) * 100;
        console.log(`Retrying deposit attempt (${retries}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return attemptDeposit();
      }

      console.log(error);

      return { status: 500, response: "Internal Server Error" };
    }
  }

  return attemptDeposit();
};

module.exports = { executeDeposit };
