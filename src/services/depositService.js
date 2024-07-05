const { Job } = require("../models/associations");
const { Contract } = require("../models/associations");
const { Profile } = require("../models/associations");
const { DEPOSIT_RATIO } = require("../constants/otherConstants");
const sequelize = require("../database");
const { profileTypes } = require("../constants/profileTypes");

const executeDeposit = async (userId, amount) => {
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

    if (profile.type != profileTypes.CLIENT) {
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
    const result = await profile.reload();
    return { status: 201, response: result };
  } catch (error) {
    await t.rollback();
    return { status: 500, response: "Internal Server Error" };
  }
};

module.exports = { executeDeposit };
