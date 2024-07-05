const express = require("express");
const bodyParser = require("body-parser");
const models = require("./models/associations");
const contractRoutes = require("./routes/contractRoutes");
const jobRoutes = require("./routes/jobRoutes");
const depositRoutes = require("./routes/depositRoutes");
const adminRoutes = require("./routes/adminRoutes");
const sequelize = require("./database");

const app = express();

app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", models);

app.use("/contracts", contractRoutes);
app.use("/jobs", jobRoutes);
app.use("/balances", depositRoutes);
app.use("/admin", adminRoutes);

module.exports = app;
