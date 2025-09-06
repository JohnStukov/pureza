import { functions } from '../utils/appwrite';

const FUNCTION_ID = process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID!;

interface Team {
    $id: string;
    name: string;
    total: number;
}

interface TeamCreatePayload {
    name: string;
}

interface TeamUpdatePayload {
    teamId: string;
    name: string;
}

interface TeamDeletePayload {
    teamId: string;
}

export const teamService = {
    listTeams: async (): Promise<Team[]> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ action: 'teamList' }),
                false // async
            );
            const result = JSON.parse(response.responseBody);
            if (response.status === 'completed' && result.teams) {
                return result.teams as Team[];
            } else {
                throw new Error(result.error || 'Failed to list teams');
            }
        } catch (error: any) {
            console.error('Error listing teams:', error);
            throw new Error(error.message || 'Failed to list teams');
        }
    },

    createTeam: async (payload: TeamCreatePayload): Promise<Team> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ action: 'teamCreate', data: payload }),
                false // async
            );
            const result = JSON.parse(response.responseBody);
            if (response.status === 'completed') {
                return result as Team;
            } else {
                throw new Error(result.error || 'Failed to create team');
            }
        } catch (error: any) {
            console.error('Error creating team:', error);
            throw new Error(error.message || 'Failed to create team');
        }
    },

    updateTeam: async (payload: TeamUpdatePayload): Promise<Team> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ action: 'teamUpdate', teamId: payload.teamId, data: { name: payload.name } }),
                false // async
            );
            const result = JSON.parse(response.responseBody);
            if (response.status === 'completed') {
                return result as Team;
            } else {
                throw new Error(result.error || 'Failed to update team');
            }
        } catch (error: any) {
            console.error('Error updating team:', error);
            throw new Error(error.message || 'Failed to update team');
        }
    },

    deleteTeam: async (payload: TeamDeletePayload): Promise<boolean> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ action: 'teamDelete', teamId: payload.teamId }),
                false // async
            );
            const result = JSON.parse(response.responseBody);
            if (response.status === 'completed' && result.success) {
                return true;
            } else {
                throw new Error(result.error || 'Failed to delete team');
            }
        } catch (error: any) {
            console.error('Error deleting team:', error);
            throw new Error(error.message || 'Failed to delete team');
        }
    },
};

