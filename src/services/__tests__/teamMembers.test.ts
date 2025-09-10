import { teamService } from '../teamService';

// Mock del módulo appwrite
const mockFunctions = {
  createExecution: jest.fn()
};

jest.mock('../../utils/appwrite', () => ({
  functions: mockFunctions
}));

describe('Team Members Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID = 'test-function-id';
  });

  describe('Add Member to Team', () => {
    it('should add member to team successfully', async () => {
      const mockMembership = {
        $id: 'membership-1',
        userId: 'user-1',
        teamId: 'team-1',
        roles: ['member'],
        joinedAt: '2024-01-01T00:00:00.000Z'
      };

      (mockFunctions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify(mockMembership)
      });

      const result = await teamService.addMember({
        teamId: 'team-1',
        userId: 'user-1',
        roles: ['member']
      });

      expect(result).toEqual(mockMembership);
      expect(mockFunctions.createExecution).toHaveBeenCalledWith(
        'test-function-id',
        JSON.stringify({
          action: 'teamAddMember',
          teamId: 'team-1',
          userId: 'user-1',
          data: { roles: ['member'] }
        }),
        false
      );
    });

    it('should handle add member error', async () => {
      (mockFunctions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          error: 'User already in team'
        })
      });

      await expect(teamService.addMember({
        teamId: 'team-1',
        userId: 'user-1'
      })).rejects.toThrow('User already in team');
    });
  });

  describe('Remove Member from Team', () => {
    it('should remove member from team successfully', async () => {
      (mockFunctions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          success: true
        })
      });

      const result = await teamService.removeMember({
        teamId: 'team-1',
        membershipId: 'membership-1'
      });

      expect(result).toBe(true);
      expect(mockFunctions.createExecution).toHaveBeenCalledWith(
        'test-function-id',
        JSON.stringify({
          action: 'teamRemoveMember',
          teamId: 'team-1',
          data: { membershipId: 'membership-1' }
        }),
        false
      );
    });
  });

  describe('List Team Members', () => {
    it('should list team members successfully', async () => {
      const mockMembers = {
        memberships: [
          {
            $id: 'membership-1',
            userId: 'user-1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            roles: ['member'],
            joinedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        total: 1
      };

      (mockFunctions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify(mockMembers)
      });

      const result = await teamService.listMembers({
        teamId: 'team-1'
      });

      expect(result).toEqual(mockMembers.memberships);
      expect(mockFunctions.createExecution).toHaveBeenCalledWith(
        'test-function-id',
        JSON.stringify({
          action: 'teamListMembers',
          teamId: 'team-1'
        }),
        false
      );
    });

    it('should return empty array when no members', async () => {
      (mockFunctions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify({
          memberships: [],
          total: 0
        })
      });

      const result = await teamService.listMembers({
        teamId: 'team-1'
      });

      expect(result).toEqual([]);
    });
  });

  describe('Update Member Role', () => {
    it('should update member role successfully', async () => {
      const mockUpdatedMember = {
        $id: 'membership-1',
        userId: 'user-1',
        roles: ['admin'],
        updatedAt: '2024-01-01T00:00:00.000Z'
      };

      (mockFunctions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: JSON.stringify(mockUpdatedMember)
      });

      const result = await teamService.updateMemberRole({
        teamId: 'team-1',
        membershipId: 'membership-1',
        roles: ['admin']
      });

      expect(result).toEqual(mockUpdatedMember);
      expect(mockFunctions.createExecution).toHaveBeenCalledWith(
        'test-function-id',
        JSON.stringify({
          action: 'teamUpdateMemberRole',
          teamId: 'team-1',
          data: {
            membershipId: 'membership-1',
            roles: ['admin']
          }
        }),
        false
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle empty response', async () => {
      (mockFunctions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: ''
      });

      await expect(teamService.addMember({
        teamId: 'team-1',
        userId: 'user-1'
      })).rejects.toThrow('Empty response from function');
    });

    it('should handle invalid JSON response', async () => {
      (mockFunctions.createExecution as jest.Mock).mockResolvedValue({
        status: 'completed',
        responseBody: 'invalid json'
      });

      await expect(teamService.addMember({
        teamId: 'team-1',
        userId: 'user-1'
      })).rejects.toThrow('Invalid JSON response');
    });

    it('should handle network errors', async () => {
      (mockFunctions.createExecution as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(teamService.addMember({
        teamId: 'team-1',
        userId: 'user-1'
      })).rejects.toThrow('Network error');
    });
  });
});
