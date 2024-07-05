const { executeDeposit } = require("../services/depositService");

const makeDeposit = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  const { status, response } = await executeDeposit(userId, amount);

  res.status(status).json(response);
};

module.exports = { makeDeposit };
