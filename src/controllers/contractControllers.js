const {
  getContractById,
  getContractsByProfile,
} = require("../services/contractService");

const getContract = async (req, res) => {
  const { id } = req.params;
  const { profile } = req;

  const { status, response } = await getContractById(id, profile.id);

  res.status(status).json(response);
};

const getNonTerminatedContracts = async (req, res) => {
  const { profile } = req;

  const { status, response } = await getContractsByProfile(profile.id);

  res.status(status).json(response);
};

module.exports = { getContract, getNonTerminatedContracts };
