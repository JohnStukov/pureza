import { userManagementService } from '../userManagementService';
import { functions } from '../../utils/appwrite';
import { withRetry } from '../../utils/retryLogic';

// Mock dependencies
jest.mock('../../utils/appwrite');
jest.mock('../../utils/retryLogic');

const mockFunctions = functions as jest.Mocked<typeof functions>;
const mockWithRetry = withRetry as jest.MockedFunction<typeof withRetry>;

describe('UserManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should successfully list users', async () => {
      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: [
            { $id: '1', name: 'User 1', email: 'user1@test.com' },
            { $id: '2', name: 'User 2', email: 'user2@test.com' }
          ]
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockWithRetry).toHaveBeenCalledWith(
        expect.any(Function),
        { maxRetries: 2, delay: 1000 }
      );
    });

    it('should handle errors when listing users', async () => {
      mockWithRetry.mockRejectedValue(new Error('Network error'));

      const result = await userManagementService.listUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        name: 'New User'
      };

      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: { $id: '3', ...userData }
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.createUser(userData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ $id: '3', ...userData });
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      const userId = '1';
      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com'
      };

      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: { $id: userId, ...updateData }
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.updateUser(userId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ $id: userId, ...updateData });
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      const userId = '1';

      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: { message: 'User deleted successfully' }
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.deleteUser(userId);

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('User deleted successfully');
    });
  });

  describe('updateUserStatus', () => {
    it('should successfully update user status', async () => {
      const userId = '1';
      const status = false;

      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: { $id: userId, status }
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.updateUserStatus(userId, status);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe(false);
    });
  });

  describe('createPasswordRecovery', () => {
    it('should successfully create password recovery', async () => {
      const userId = '1';

      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: { message: 'Password recovery email sent' }
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.createPasswordRecovery(userId);

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Password recovery email sent');
    });
  });

  describe('updateVerification', () => {
    it('should successfully update user verification', async () => {
      const userId = '1';

      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: { $id: userId, emailVerification: true }
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.updateVerification(userId);

      expect(result.success).toBe(true);
      expect(result.data.emailVerification).toBe(true);
    });
  });

  describe('Team Management', () => {
    it('should successfully list teams', async () => {
      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: [
            { $id: '1', name: 'Team 1' },
            { $id: '2', name: 'Team 2' }
          ]
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.listTeams();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should successfully create a team', async () => {
      const teamData = { name: 'New Team' };

      const mockResponse = {
        responseBody: JSON.stringify({
          success: true,
          data: { $id: '3', ...teamData }
        })
      };

      mockWithRetry.mockResolvedValue(mockResponse);

      const result = await userManagementService.createTeam(teamData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ $id: '3', ...teamData });
    });
  });
});

