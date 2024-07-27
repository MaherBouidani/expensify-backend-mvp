## Expensify - Employees Management

Welcome to Expensify's backend MVP documentation. This project provides the foundational backend services for managing employees, clients, contracts, and jobs. It supports essential operations such as creating contracts, recording jobs, and processing payments.

## Data Models

 **All models are defined in src/models**

### Profile

A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract

A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job

contractor get paid for jobs by clients under a certain contract.

## Getting Set Up

It requires [Node.js](https://nodejs.org/en/) to be installed. I recommend using the LTS version.

1. In the repo root directory, run `npm install` to gather all dependencies.

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

1. Then run `npm start` which should start both the server and the React client.

## Technical Notes

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.
- The server is running on port 3001.

## APIs

Below is a list of API':

1. **_GET_** `/contracts/:id` - Returns the contract if it belongs to the authenticated profile.

1. **_GET_** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. **_GET_** `/jobs/unpaid` - Retrieves unpaid jobs for the user under **_active contracts only_**.

1. **_POST_** `/jobs/:job_id/pay` - Allows clients to pay for a job if their balance is sufficient. The payment transfers from the client's balance to the contractor's balance.

1. **_POST_** `/balances/deposit/:userId` - Deposits money into a client's balance, capped at 25% of the total jobs payable.

1. **_GET_** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession with the highest total earnings for contractors within the specified date range.

1. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - Lists the top clients by job payments within the specified date range, with an optional limit parameter. Default limit is 2.
