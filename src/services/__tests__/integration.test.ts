// Mock del módulo appwrite
jest.mock('../../utils/appwrite', () => ({
  functions: {
    createExecution: jest.fn()
  }
}));

import { userManagementService } from '../userManagementService';
import { teamService } from '../teamService';
import { productService } from '../productService';
import { functions } from '../../utils/appwrite';

describe('Integration Tests - manage-users Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar variables de entorno para testing
    process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID = 'test-function-id';
    process.env.REACT_APP_APPWRITE_DATABASE_ID = 'test-database-id';
    process.env.REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID = 'test-products-collection-id';
  });

  describe('User Management Integration', () => {
    it('should successfully list users from manage-users function', async () => {
      const mockUsers = [
        {
          $id: '1',
          name: 'Test User',
          email: 'test@example.com',
          status: true,
          $createdAt: '2023-01-01T00:00:00.000Z',
          $updatedAt: '2023-01-01T00:00:00.000Z'
        }
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
      expect(functions.createExecution).toHaveBeenCalledWith(
        'test-function-id',
        JSON.stringify({ action: 'list' }),
        false
      );
    });

    it('should handle function execution failure', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'failed',
        responseStatusCode: 500,
        responseBody: 'Internal Server Error'
      });

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Function execution failed');
    });

    it('should handle network errors', async () => {
      (functions.createExecution as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should create user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      };

      const mockUser = {
        $id: '2',
        ...userData,
        status: true,
        $createdAt: '2023-01-01T00:00:00.000Z',
        $updatedAt: '2023-01-01T00:00:00.000Z'
      };

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          success: true,
          ...mockUser
        })
      });

      const result = await userManagementService.createUser(userData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(functions.createExecution).toHaveBeenCalledWith(
        'test-function-id',
        JSON.stringify({ action: 'create', data: userData }),
        false
      );
    });

    it('should update user successfully', async () => {
      const userId = '1';
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockUpdatedUser = {
        $id: userId,
        ...updateData,
        status: true,
        $createdAt: '2023-01-01T00:00:00.000Z',
        $updatedAt: '2023-01-01T00:00:00.000Z'
      };

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          success: true,
          ...mockUpdatedUser
        })
      });

      const result = await userManagementService.updateUser(userId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedUser);
    });

    it('should delete user successfully', async () => {
      const userId = '1';

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          success: true
        })
      });

      const result = await userManagementService.deleteUser(userId);

      expect(result.success).toBe(true);
      expect(functions.createExecution).toHaveBeenCalledWith(
        'test-function-id',
        JSON.stringify({ action: 'delete', userId }),
        false
      );
    });

    it('should update user status successfully', async () => {
      const userId = '1';
      const status = false;

      const mockUser = {
        $id: userId,
        name: 'Test User',
        email: 'test@example.com',
        status: status,
        $createdAt: '2023-01-01T00:00:00.000Z',
        $updatedAt: '2023-01-01T00:00:00.000Z'
      };

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          success: true,
          ...mockUser
        })
      });

      const result = await userManagementService.updateUserStatus(userId, status);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });
  });

  describe('Team Management Integration', () => {
    it('should list teams successfully', async () => {
      const mockTeams = [
        {
          $id: '1',
          name: 'Test Team',
          total: 5,
          $createdAt: '2023-01-01T00:00:00.000Z',
          $updatedAt: '2023-01-01T00:00:00.000Z'
        }
      ];

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          teams: mockTeams
        })
      });

      const result = await teamService.listTeams();

      expect(result).toEqual(mockTeams);
      expect(functions.createExecution).toHaveBeenCalledWith(
        'test-function-id',
        JSON.stringify({ action: 'teamList' }),
        false
      );
    });

    it('should create team successfully', async () => {
      const teamData = { name: 'New Team' };
      const mockTeam = {
        $id: '2',
        ...teamData,
        total: 0,
        $createdAt: '2023-01-01T00:00:00.000Z',
        $updatedAt: '2023-01-01T00:00:00.000Z'
      };

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify(mockTeam)
      });

      const result = await teamService.createTeam(teamData);

      expect(result).toEqual(mockTeam);
    });

    it('should handle team creation failure', async () => {
      const teamData = { name: 'New Team' };

      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'failed',
        responseStatusCode: 400,
        responseBody: 'Invalid team name'
      });

      await expect(teamService.createTeam(teamData)).rejects.toThrow('Invalid team name');
    });
  });

  describe('Configuration Tests', () => {
    it('should use correct function ID from environment', () => {
      expect(process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID).toBe('test-function-id');
    });

    it('should handle missing environment variables', () => {
      delete process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID;
      
      // El servicio debería usar un valor por defecto
      const service = new (userManagementService.constructor as any)();
      expect(service.functionId).toBe('manage-users');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle malformed JSON response', async () => {
      (functions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: 'invalid json'
      });

      await expect(userManagementService.listUsers()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (functions.createExecution as jest.Mock).mockRejectedValue(timeoutError);

      const result = await userManagementService.listUsers();
      expect(result.success).toBe(false);
    });

    it('should handle Appwrite exceptions', async () => {
      const appwriteError = {
        type: 'user_already_exists',
        message: 'User already exists',
        code: 409
      };
      (functions.createExecution as jest.Mock).mockRejectedValue(appwriteError);

      const result = await userManagementService.createUser({
        email: 'existing@example.com',
        password: 'password',
        name: 'Existing User'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('User already exists');
    });
  });

  describe('Retry Logic Tests', () => {
    it('should retry on network errors', async () => {
      let attemptCount = 0;
      (functions.createExecution as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          const error = new Error('Network error');
          error.name = 'NetworkError';
          throw error;
        }
        return Promise.resolve({
          status: 'completed',
          responseBody: JSON.stringify({ success: true, users: [] })
        });
      });

      const result = await userManagementService.listUsers();
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3);
    });

    it('should not retry on validation errors', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      (functions.createExecution as jest.Mock).mockRejectedValue(validationError);

      const result = await userManagementService.createUser({
        email: 'invalid-email',
        password: '123',
        name: 'Test'
      });

      expect(result.success).toBe(false);
      expect(functions.createExecution).toHaveBeenCalledTimes(1);
    });
  });
});
