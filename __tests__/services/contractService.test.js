const { getContractById, getContractsByProfile } = require('../../src/services/contractService');
const  Contract  = require("../../src/models/Contract");
const { ContractStatuses } = require('../../src/constants/contractStatuses');

jest.mock('../../src/models/Contract');

describe('Contract Service', () => {
  describe('getContractById', () => {
    it('should return a contract if found', async () => {
      const mockContract = { id: 1, clientId: 1, contractorId: 2 };
      Contract.findOne.mockResolvedValue(mockContract);

      const result = await getContractById(1, 1);

      expect(result.status).toEqual(200);
      expect(result.response).toEqual(mockContract);
    });

    it('should return 404 if contract not found', async () => {
      Contract.findOne.mockResolvedValue(null);

      const result = await getContractById(999, 1);

      expect(result.status).toEqual(404);
      expect(result.response).toEqual("Contract not found");
    });
  });

  describe('getContractsByProfile', () => {
    it('should return a list of contracts for a profile', async () => {
      const mockContracts = [
        { id: 1, clientId: 1, contractorId: 2, status: 'in_progress' },
        { id: 2, clientId: 1, contractorId: 3, status: 'in_progress' }
      ];
      Contract.findAll.mockResolvedValue(mockContracts);

      const result = await getContractsByProfile(1);

      expect(result.status).toEqual(200);
      expect(result.response).toEqual(mockContracts);
    });

    it('should return 404 if no contracts found', async () => {
      Contract.findAll.mockResolvedValue([]);

      const result = await getContractsByProfile(999);

      expect(result.status).toEqual(404);
      expect(result.response).toEqual("No contracts found");
    });
  });
});