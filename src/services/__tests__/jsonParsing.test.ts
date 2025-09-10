// Mock del módulo appwrite
jest.mock('../../utils/appwrite', () => ({
  functions: {
    createExecution: jest.fn()
  }
}));

import { userManagementService } from '../userManagementService';
import { teamService } from '../teamService';
import { functions } from '../../utils/appwrite';

describe('JSON Parsing Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID = 'test-function-id';
  });

  describe('Empty Response Handling', () => {
    it('should handle empty response body in userManagementService', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: ''
      });

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty response from function');
    });

    it('should handle empty response body in teamService', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: ''
      });

      await expect(teamService.listTeams()).rejects.toThrow('Empty response from function');
    });
  });

  describe('Invalid JSON Handling', () => {
    it('should handle invalid JSON in userManagementService', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: 'invalid json {'
      });

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON response');
    });

    it('should handle invalid JSON in teamService', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: 'not json at all'
      });

      await expect(teamService.listTeams()).rejects.toThrow('Invalid JSON response');
    });

    it('should handle malformed JSON with unexpected token', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: '{"incomplete":'
      });

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON response');
    });
  });

  describe('Whitespace Handling', () => {
    it('should handle response with only whitespace', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: '   \n\t  '
      });

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty response from function');
    });
  });

  describe('Valid JSON Handling', () => {
    it('should handle valid JSON response correctly', async () => {
      const mockUsers = [
        { $id: '1', name: 'Test User', email: 'test@example.com' }
      ];

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          success: true,
          users: mockUsers
        })
      });

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUsers);
    });

    it('should handle valid team JSON response correctly', async () => {
      const mockTeams = [
        { $id: '1', name: 'Test Team', total: 0 }
      ];

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          teams: mockTeams
        })
      });

      const result = await teamService.listTeams();

      expect(result).toEqual(mockTeams);
    });
  });

  describe('Error Response Handling', () => {
    it('should handle function error response', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          success: false,
          error: 'Function execution failed'
        })
      });

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Function execution failed');
    });

    it('should handle team function error response', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          error: 'Team not found'
        })
      });

      await expect(teamService.listTeams()).rejects.toThrow('Team not found');
    });
  });

  describe('Function Execution Failure', () => {
    it('should handle function execution failure', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'failed',
        responseStatusCode: 500,
        responseBody: 'Internal Server Error'
      });

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal Server Error');
    });
  });
});
