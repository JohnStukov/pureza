import { functions } from '../utils/appwrite';
import { withRetry } from '../utils/retryLogic';
import { ID, AppwriteException, Models } from 'appwrite';
import '../config/debug'; // Import debug config to log environment variables
import { USER_ACTIONS, TEAM_ACTIONS } from '../constants/actions';

export interface UserData {
  email: string;
  password: string;
  name: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
}

export interface TeamData {
  name: string;
}

export interface TeamUpdateData {
  name: string;
}

export interface AppwriteUser extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  registration: string;
  status: boolean;
  labels: string[];
  passwordUpdate: string;
  email: string;
  phone: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs: Record<string, any>;
  accessedAt: string;
}

export interface AppwriteTeam {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  total: number;
  prefs: Record<string, any>;
}

export interface ManageUsersResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class UserManagementService {
  private functionId: string;

  constructor() {
    this.functionId = process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID || 'manage-users';
  }

  private async executeFunction<T>(payload: any): Promise<ManageUsersResponse<T>> {
    try {
      const execution = await withRetry(
        () => functions.createExecution(this.functionId, JSON.stringify(payload), false),
        { maxRetries: 2, delay: 1000 }
      );

      if (execution.status === 'failed') {
        console.error(`Function execution failed with status code ${execution.responseStatusCode}:`, execution.responseBody);
        try {
          const errorResult = JSON.parse(execution.responseBody);
          return { success: false, error: errorResult.message || errorResult.error || 'Function execution failed.' };
        } catch {
          return { success: false, error: execution.responseBody || 'Function execution failed with an unknown error.' };
        }
      }

      // Verificar que responseBody no esté vacío y sea JSON válido
      if (!execution.responseBody || execution.responseBody.trim() === '') {
        return { success: false, error: 'Empty response from function' };
      }

      let result;
      try {
        result = JSON.parse(execution.responseBody);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response body:', execution.responseBody);
        return { 
          success: false, 
          error: `Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}` 
        };
      }

      if (result.success === false || result.error) {
        return { success: false, error: result.error || 'The function reported an error.' };
      }

      // On success, return the entire result. The specific methods will parse it.
      return { success: true, data: result as T };

    } catch (error) {
      console.error('Error calling manage-users function:', error);
      if (error instanceof AppwriteException) {
        return { success: false, error: error.message };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred while calling the function.' 
      };
    }
  }

  // User Management Methods
  async listUsers(): Promise<ManageUsersResponse<AppwriteUser[]>> {
    const result = await this.executeFunction<any>({ action: USER_ACTIONS.LIST });

    if (!result.success) {
      return result; // Propagate the error response
    }

    let usersArray: AppwriteUser[] = [];
    if (Array.isArray(result.data)) {
      usersArray = result.data;
    } else if (result.data && Array.isArray(result.data.users)) {
      usersArray = result.data.users;
    }

    return { success: true, data: usersArray };
  }

  async createUser(userData: UserData): Promise<ManageUsersResponse<AppwriteUser>> {
    return this.executeFunction<AppwriteUser>({ action: USER_ACTIONS.CREATE, data: userData });
  }

  async updateUser(userId: string, userData: UserUpdateData): Promise<ManageUsersResponse<AppwriteUser>> {
    return this.executeFunction<AppwriteUser>({ action: USER_ACTIONS.UPDATE, userId, data: userData });
  }

  async deleteUser(userId: string): Promise<ManageUsersResponse<{}>> {
    return this.executeFunction<{}>({ action: USER_ACTIONS.DELETE, userId });
  }

  async updateUserStatus(userId: string, status: boolean): Promise<ManageUsersResponse<AppwriteUser>> {
    return this.executeFunction<AppwriteUser>({ action: USER_ACTIONS.UPDATE_STATUS, userId, data: { status } });
  }

  async createPasswordRecovery(userId: string): Promise<ManageUsersResponse<{}>> {
    return this.executeFunction<{}>({ action: USER_ACTIONS.CREATE_PASSWORD_RECOVERY, userId });
  }

  async updateVerification(userId: string): Promise<ManageUsersResponse<AppwriteUser>> {
    return this.executeFunction<AppwriteUser>({ action: USER_ACTIONS.UPDATE_VERIFICATION, userId });
  }

  // Team Management Methods
  async listTeams(): Promise<ManageUsersResponse<AppwriteTeam[]>> {
    const result = await this.executeFunction<any>({ action: TEAM_ACTIONS.LIST });

    if (!result.success) {
      return result;
    }

    let teamsArray: AppwriteTeam[] = [];
    if (Array.isArray(result.data)) {
      teamsArray = result.data;
    } else if (result.data && Array.isArray(result.data.teams)) {
      teamsArray = result.data.teams;
    }

    return { success: true, data: teamsArray };
  }

  async createTeam(teamData: TeamData): Promise<ManageUsersResponse<AppwriteTeam>> {
    return this.executeFunction<AppwriteTeam>({ action: TEAM_ACTIONS.CREATE, data: teamData });
  }

  async updateTeam(teamId: string, teamData: TeamUpdateData): Promise<ManageUsersResponse<AppwriteTeam>> {
    return this.executeFunction<AppwriteTeam>({ action: TEAM_ACTIONS.UPDATE, teamId, data: teamData });
  }

  async deleteTeam(teamId: string): Promise<ManageUsersResponse<{}>> {
    return this.executeFunction<{}>({ action: TEAM_ACTIONS.DELETE, teamId });
  }
}

export const userManagementService = new UserManagementService();
export default userManagementService;
