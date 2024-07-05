const {
  queryBestClients,
  queryBestProfession,
} = require("../../src/services/adminService");
const { Profile, Contract, Job } = require("../../src/models/associations");

jest.mock("../../src/models/associations");

describe("Admin Service", () => {
  describe("queryBestClients", () => {
    it("should return the top 2 clients with the highest total job price in the specified period", async () => {
      const mockClients = [
        { id: 1, firstName: "John", lastName: "Doe", total: 1000 },
        { id: 2, firstName: "Jane", lastName: "Doe", total: 800 },
      ];
      Profile.findAll.mockResolvedValue(mockClients);

      const startTime = new Date("2020-01-01");
      const endTime = new Date("2020-12-31");
      const result = await queryBestClients(startTime, endTime);

      expect(result.status).toEqual(200);
      expect(result.response).toEqual(mockClients);
    });

    it("should return 404 if no clients found", async () => {
      Profile.findAll.mockResolvedValue([]);

      const startTime = new Date("2020-01-01");
      const endTime = new Date("2020-12-31");
      const result = await queryBestClients(startTime, endTime);

      expect(result.status).toEqual(404);
      expect(result.response).toEqual("No results found");
    });

    it("should handle errors and return status 500", async () => {
      Profile.findAll.mockImplementation(() => {
        throw new Error("Database error");
      });

      const startTime = new Date("2020-01-01");
      const endTime = new Date("2020-12-31");
      const result = await queryBestClients(startTime, endTime);

      expect(result.status).toEqual(500);
      expect(result.response).toEqual("Internal Server Error");
    });
  });
});

describe("Admin Service - queryBestProfession", () => {
  it("should return the profession with the highest total job price in the specified period", async () => {
    const mockProfessions = [{ profession: "Software Developer", total: 5000 }];
    Profile.findAll.mockResolvedValue(mockProfessions);

    const startTime = new Date("2021-01-01");
    const endTime = new Date("2021-12-31");
    const result = await queryBestProfession(startTime, endTime);

    expect(result.status).toEqual(200);
    expect(result.response).toHaveLength(1);
    expect(result.response[0].profession).toEqual("Software Developer");
    expect(result.response[0].total).toEqual(5000);
  });
});
