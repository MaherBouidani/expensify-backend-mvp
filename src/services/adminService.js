const { Profile } = require("../models/associations");
const { Job } = require("../models/associations");
const { Contract } = require("../models/associations");
const sequelize = require("../database");
const { profileTypes } = require("../constants/profileTypes");
const { Op, col, fn } = require("sequelize");

const queryBestProfession = async (startTime, endTime) => {
  try {
    const bestProfession = await Profile.findAll({
      attributes: [
        "profession",
        [sequelize.fn("SUM", col("Contractor.Jobs.price")), "total"],
      ],
      group: ["profession"],
      where: { type: profileTypes.CONTRACTOR },
      include: [
        {
          model: Contract,
          attributes: [],
          as: "Contractor",
          include: [
            {
              model: Job,
              attributes: [],
              as: "Jobs",
              where: {
                paid: true,
                paymentDate: { [Op.between]: [startTime, endTime] },
              },
            },
          ],
        },
      ],
      having: sequelize.literal(`total > 0`),
      order: [["total", "DESC"]],
    });

    if (bestProfession.length == 0) {
      return { status: 404, response: "No results found" };
    }

    return { status: 200, response: bestProfession };
  } catch (error) {
    return { status: 500, response: "Internal Server Error" };
  }
};

const queryBestClients = async (startTime, endTime) => {
  try {
    const bestClients = await Profile.findAll({
      subQuery: false,
      attributes: [
        "id",
        "firstName",
        "lastName",
        [sequelize.fn("SUM", col("Client.Jobs.price")), "total"],
      ],
      group: ["Profile.id"],
      where: { type: profileTypes.CLIENT },
      include: [
        {
          model: Contract,
          attributes: [],
          as: "Client",
          include: [
            {
              model: Job,
              attributes: [],
              as: "Jobs",
              where: {
                paid: true,
                paymentDate: { [Op.between]: [startTime, endTime] },
              },
            },
          ],
        },
      ],
      having: sequelize.literal(`total > 0`),
      order: [[sequelize.literal("total"), "DESC"]],
      limit: 2,
    });

    if (bestClients.length == 0) {
      return { status: 404, response: "No results found" };
    }

    return { status: 200, response: bestClients };
  } catch (error) {
    return { status: 500, response: "Internal Server Error" };
  }
};

module.exports = { queryBestProfession, queryBestClients };
