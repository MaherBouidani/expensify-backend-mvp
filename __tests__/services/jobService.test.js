const { getUnpaidJobsByProfile, pay } = require("../../src/services/jobService");
const sequelize = require("../../src/database");
const { Job } = require("../../src/models/associations");

jest.mock("../../src/models/associations", () => ({
    Job: {
        findAll: jest.fn(),
    },
}));

jest.mock("../../src/database", () => ({
    transaction: jest.fn(),
}));


describe('getUnpaidJobsByProfile', () => {
  beforeEach(() => {
    Job.findAll.mockClear();
    sequelize.transaction.mockClear();
  });

  it('should return unpaid jobs for a given profile Id', async () => {
    Job.findAll.mockResolvedValue([{ id: 1, description: 'Test Job', paid: null }]);
    const result = await getUnpaidJobsByProfile(1);
    expect(result.status).toEqual(200);
    expect(result.response.length).toBeGreaterThan(0);
  });

  it('should return 404 if no unpaid jobs found', async () => {
    Job.findAll.mockResolvedValue([]);
    const result = await getUnpaidJobsByProfile(1);
    expect(result.status).toEqual(404);
    expect(result.response).toEqual("No unpaid jobs found");
  });

  it('should handle internal server errors', async () => {
    Job.findAll.mockRejectedValue(new Error("Internal Server Error"));
    const result = await getUnpaidJobsByProfile(1);
    expect(result.status).toEqual(500);
    expect(result.response).toEqual("Internal Server Error");
  });
});

describe('pay', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Job.findOne = jest.fn();
        sequelize.transaction.mockImplementation(() => ({
            commit: jest.fn(),
            rollback: jest.fn(),
            LOCK: { UPDATE: 'update' }
        }));
    });

    it('should return 404 if job not found', async () => {
        Job.findOne.mockResolvedValue(null);
        const profile = { id: 1, type: 'client' };
        const result = await pay(999, profile);
        expect(result.status).toEqual(404);
        expect(result.response).toEqual("Job not found");
    });

    it('should return 403 if profile type is not CLIENT', async () => {
        Job.findOne.mockResolvedValue({ id: 1, paid: null });
        const profile = { id: 1, type: 'contractor' };
        const result = await pay(1, profile);
        expect(result.status).toEqual(403);
        expect(result.response).toEqual("Unauthorized, Profile is not of client type");
    });

    it('should handle internal server errors gracefully', async () => {
        Job.findOne.mockRejectedValue(new Error("Internal Server Error"));
        const profile = { id: 1, type: 'client' };
        const result = await pay(1, profile);
        expect(result.status).toEqual(500);
        expect(result.response).toEqual("Internal Server Error");
    });
});