const {
  queryBestProfession,
  queryBestClients,
} = require("../services/adminService");

const getBestProfession = async (req, res) => {
  const { start, end } = req.query;
  const queryStartTime = new Date(start);
  const queryEndTime = new Date(end);
  const { status, response } = await queryBestProfession(
    queryStartTime,
    queryEndTime
  );

  res.status(status).json(response);
};

const getBestClients = async (req, res) => {
  const { start, end } = req.query;
  const queryStartTime = new Date(start);
  const queryEndTime = new Date(end);

  const { status, response } = await queryBestClients(
    queryStartTime,
    queryEndTime
  );

  res.status(status).json(response);
};

module.exports = { getBestProfession, getBestClients };
