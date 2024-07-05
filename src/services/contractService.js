const Contract = require("../models/Contract");
const { ContractStatuses } = require("../constants/contractStatuses");
const { Op } = require("sequelize");

const getContractById = async (contractId, profileId) => {
  const contract = await Contract.findOne({
    where: {
      id: contractId,
      [Op.or]: [{ clientId: profileId }, { contractorId: profileId }],
    },
  });

  if (!contract) {
    return { status: 404, response: "Contract not found" };
  }

  return { status: 200, response: contract };
};

const getContractsByProfile = async (profileId) => {
  const listOfContracts = await Contract.findAll({
    where: {
      [Op.and]: [
        { [Op.or]: [{ clientId: profileId }, { contractorId: profileId }] },
        { status: { [Op.ne]: ContractStatuses.TERMINATED } },
      ],
    },
  });

  if (listOfContracts.length == 0) {
    return { status: 404, response: "No contracts found" };
  }

  return { status: 200, response: listOfContracts };
};

module.exports = { getContractById, getContractsByProfile };
