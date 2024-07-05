const express = require("express");
const bodyParser = require("body-parser");
const models = require("./models/associations");
const contractRoutes = require("./routes/contractRoutes");
const jobRoutes = require("./routes/jobRoutes");
const depositRoutes = require("./routes/depositRoutes");
const adminRoutes = require("./routes/adminRoutes");
const  sequelize  = require("./database")

const app = express();

app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", models);

app.use("/contracts", contractRoutes);
app.use("/jobs", jobRoutes);
app.use("/balances", depositRoutes);
app.use("/admin", adminRoutes);




// /**
//  * FIX ME!
//  * @returns contract by id
//  */
// app.get("/contracts/:id", getProfile, async (req, res) => {
//   const { Contract } = req.app.get("models");
//   const { id } = req.params;
//   const { profile } = req;
//   const contract = await Contract.findOne({
//     where: {
//       id,
//       [Op.or]: [{ clientId: profile.id }, { contractorId: profile.id }],
//     },
//   });
//   if (!contract) return res.status(404).end();
//   res.json(contract);
// });

// app.get("/contracts", getProfile, async (req, res) => {
//   const { Contract } = req.app.get("models");
//   const { profile } = req;
//   const listOfContracts = await Contract.findAll({
//     where: {
//       [Op.and]: [
//         { [Op.or]: [{ clientId: profile.id }, { contractorId: profile.id }] },
//         { status: { [Op.ne]: "terminated" } },
//       ],
//     },
//   });

//   if (listOfContracts.length == 0) return res.status(404).end();
//   res.json(listOfContracts);
// });

// app.get("/jobs/unpaid", getProfile, async (req, res) => {
//   const { Contract, Job } = req.app.get("models");
//   const { profile } = req;

//   try {
//     const unpaidJobs = await Job.findAll({
//       include: [
//         {
//           model: Contract,
//           where: {
//             status: "in_progress",
//             [Op.or]: [{ contractorId: profile.id }, { clientId: profile.id }],
//           },
//         },
//       ],
//       where: {
//         paid: null,
//       },
//     });

//     if (unpaidJobs.length === 0) {
//       return res.status(404).end();
//     }

//     res.json(unpaidJobs);
//   } catch (error) {
//     console.error("Error retrieving unpaid jobs:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
//   const { Job, Profile } = req.app.get("models");
//   const { profile } = req;
//   const { job_id } = req.params;
//   const t = await sequelize.transaction();

//   try {
//     const transactionOptions = { transaction: t, lock: t.LOCK.UPDATE };

//     // const balance = profile.balance;
//     const job = await Job.findOne({
//       where: {
//         id: job_id,
//       },
//       include: [Contract],
//       ...transactionOptions,
//     });

//     if (!job) {
//       return res.status(404).json({ error: "Job not found" });
//     }

//     if (profile.type != "client") {
//       return res
//         .status(403)
//         .json({ error: "Unauthorized, Profile is not of client type" });
//     }

//     if (profile.id !== job.Contract.ClientId) {
//       return res
//         .status(403)
//         .json({ error: "Unauthorized, Job does not belong to profile" });
//     }

//     if (job.paid) {
//       return res.status(400).json({ error: "Job already paid" });
//     }

//     const client = await Profile.findOne({
//       where: { id: job.Contract.ClientId },
//       ...transactionOptions,
//     });
//     const contractor = await Profile.findOne({
//       where: { id: job.Contract.ContractorId },
//       ...transactionOptions,
//     });

//     if (!client || !contractor) {
//       return res.status(404).json({ error: "Profile not found" });
//     }

//     if (client.balance < job.price) {
//       return res.status(400).json({ error: "Insufficient funds" });
//     }

//     client.balance -= job.price;
//     contractor.balance += job.price;

//     await client.save(transactionOptions);
//     await contractor.save(transactionOptions);

//     job.paid = true;
//     job.paymentDate = new Date();
//     await job.save(transactionOptions);

//     await t.commit();
//     res.json({ message: "Job paid successfully" });
//   } catch (error) {
//     await t.rollback();
//     console.error("Error paying job:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/balances/deposit/:userId", async (req, res) => {
//   const { Profile, Job } = req.app.get("models");
//   const { userId } = req.params;
//   const { amount } = req.body;
//   const t = await sequelize.transaction();

//   try {
//     const transactionOptions = { transaction: t, lock: t.LOCK.UPDATE };

//     const profile = await Profile.findOne({
//       where: { id: userId },
//       ...transactionOptions,
//     });

//     if (!profile) {
//       return res.status(404).json({ error: "Profile not found" });
//     }

//     if (profile.type != "client") {
//       return res
//         .status(403)
//         .json({ error: "Unauthorized, Profile is not of client type" });
//     }

//     if (amount <= 0) {
//       return res.status(400).json({ error: "Invalid amount" });
//     }

//     const totalJobsToPay = await Job.sum("price", {
//       where: { paid: null },
//       include: {
//         model: Contract,
//         where: { clientId: profile.id },
//       },
//       ...transactionOptions,
//     });

//     const maxDeposit = totalJobsToPay * 0.25;

//     if (maxDeposit < amount) {
//       return res.status(400).json({
//         error: `Deposit amount exceeds the allowable limit of ${maxDeposit}`,
//       });
//     }

//     profile.balance += amount;
//     await profile.save(transactionOptions);

//     await t.commit();
//     const result = await profile.reload();
//     res.status(201).json({ message: result });
//   } catch (error) {
//     await t.rollback();
//     console.error("Error depositing funds:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.get("/admin/best-profession", async (req, res) => {
//   const { Profile, Job, Contract } = req.app.get("models");
//   const { start, end } = req.query;
//   const startTime = new Date(start);
//   const endTime = new Date(end);
//   console.log(startTime, ".........", endTime);

//   try {
//     const bestProfession = await Profile.findAll({
//       attributes: [
//         "profession",
//         [sequelize.fn("SUM", col("Contractor.Jobs.price")), "total"],
//       ],
//       group: ["profession"],
//       where: { type: "contractor" },
//       include: [
//         {
//           model: Contract,
//           attributes: [],
//           as: "Contractor",
//           include: [
//             {
//               model: Job,
//               attributes: [],
//               as: "Jobs",
//               where: {
//                 paid: true,
//                 paymentDate: { [Op.between]: [startTime, endTime] },
//               },
//             },
//           ],
//         },
//       ],
//       having: sequelize.literal(`total > 0`),
//       order: [["total", "DESC"]],
//     });

//     console.log("bestProfessions", bestProfession);

//     if (bestProfession.length == 0) {
//       return res.status(404).json({ error: "No results found" });
//     }

//     res.status(200).json(bestProfession);
//   } catch (error) {
//     console.error("Error retrieving best profession:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.get("/admin/best-clients", async (req, res) => {
//   const { Profile, Job, Contract } = req.app.get("models");
//   const { start, end } = req.query;
//   const startTime = new Date(start);
//   const endTime = new Date(end);

//   try {
//     const bestClients = await Profile.findAll({
//       subQuery: false,
//       attributes: [
//         "id",
//         "firstName",
//         "lastName",
//         [sequelize.fn("SUM", col("Client.Jobs.price")), "total"],
//       ],
//       group: ["Profile.id"],
//       where: { type: "client" },
//       include: [
//         {
//           model: Contract,
//           attributes: [],
//           as: "Client",
//           include: [
//             {
//               model: Job,
//               attributes: [],
//               as: "Jobs",
//               where: {
//                 paid: true,
//                 paymentDate: { [Op.between]: [startTime, endTime] },
//               },
//             },
//           ],
//         },
//       ],
//       having: sequelize.literal(`total > 0`),
//       order: [[sequelize.literal("total"), "DESC"]],
//       limit: 2,
//     });

//     if (bestClients.length == 0) {
//       return res.status(404).json({ error: "No results found" });
//     }

//     res.status(200).json(bestClients);
//   } catch (error) {
//     console.error("Error retrieving best clients:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

module.exports = app;
