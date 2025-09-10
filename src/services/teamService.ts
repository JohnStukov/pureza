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

interface TeamAddMemberPayload {
    teamId: string;
    userEmail: string;
    roles?: string[];
}

interface TeamRemoveMemberPayload {
    teamId: string;
    membershipId: string;
}

interface TeamListMembersPayload {
    teamId: string;
}

interface TeamUpdateMemberRolePayload {
    teamId: string;
    membershipId: string;
    roles: string[];
}

interface TeamAcceptInvitationPayload {
    membershipId: string;
    secret: string;
}

interface TeamDeclineInvitationPayload {
    membershipId: string;
    secret: string;
}

export const teamService = {
    listTeams: async (): Promise<Team[]> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ action: 'teamList' }),
                false // async
            );
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in teamService:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

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
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in createTeam:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

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
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in updateTeam:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

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
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in deleteTeam:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

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

    addMember: async (payload: TeamAddMemberPayload): Promise<any> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ 
                    action: 'teamAddMember', 
                    teamId: payload.teamId,
                    userEmail: payload.userEmail,
                    data: { roles: payload.roles || ['member'] }
                }),
                false // async
            );
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in addMember:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

            if (response.status === 'completed') {
                return result;
            } else {
                throw new Error(result.error || 'Failed to add member to team');
            }
        } catch (error: any) {
            console.error('Error adding member to team:', error);
            throw new Error(error.message || 'Failed to add member to team');
        }
    },

    removeMember: async (payload: TeamRemoveMemberPayload): Promise<boolean> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ 
                    action: 'teamRemoveMember', 
                    teamId: payload.teamId,
                    data: { membershipId: payload.membershipId }
                }),
                false // async
            );
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in removeMember:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

            if (response.status === 'completed' && result.success) {
                return true;
            } else {
                throw new Error(result.error || 'Failed to remove member from team');
            }
        } catch (error: any) {
            console.error('Error removing member from team:', error);
            throw new Error(error.message || 'Failed to remove member from team');
        }
    },

    listMembers: async (payload: TeamListMembersPayload): Promise<any[]> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ 
                    action: 'teamListMembers', 
                    teamId: payload.teamId
                }),
                false // async
            );
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in listMembers:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

            if (response.status === 'completed') {
                return result.memberships || [];
            } else {
                throw new Error(result.error || 'Failed to list team members');
            }
        } catch (error: any) {
            console.error('Error listing team members:', error);
            throw new Error(error.message || 'Failed to list team members');
        }
    },

    updateMemberRole: async (payload: TeamUpdateMemberRolePayload): Promise<any> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ 
                    action: 'teamUpdateMemberRole', 
                    teamId: payload.teamId,
                    data: { 
                        membershipId: payload.membershipId,
                        roles: payload.roles
                    }
                }),
                false // async
            );
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in updateMemberRole:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

            if (response.status === 'completed') {
                return result;
            } else {
                throw new Error(result.error || 'Failed to update member role');
            }
        } catch (error: any) {
            console.error('Error updating member role:', error);
            throw new Error(error.message || 'Failed to update member role');
        }
    },

    acceptInvitation: async (payload: TeamAcceptInvitationPayload): Promise<boolean> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ 
                    action: 'teamAcceptInvitation', 
                    membershipId: payload.membershipId,
                    secret: payload.secret
                }),
                false // async
            );
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in acceptInvitation:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

            if (response.status === 'completed' && result.success) {
                return true;
            } else {
                throw new Error(result.error || 'Failed to accept invitation');
            }
        } catch (error: any) {
            console.error('Error accepting invitation:', error);
            throw new Error(error.message || 'Failed to accept invitation');
        }
    },

    declineInvitation: async (payload: TeamDeclineInvitationPayload): Promise<boolean> => {
        try {
            const response = await functions.createExecution(
                FUNCTION_ID,
                JSON.stringify({ 
                    action: 'teamDeclineInvitation', 
                    membershipId: payload.membershipId,
                    secret: payload.secret
                }),
                false // async
            );
            // Verificar que responseBody no esté vacío
            if (!response.responseBody || response.responseBody.trim() === '') {
                throw new Error('Empty response from function');
            }

            let result;
            try {
                result = JSON.parse(response.responseBody);
            } catch (parseError) {
                console.error('JSON parse error in declineInvitation:', parseError);
                console.error('Response body:', response.responseBody);
                throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

            if (response.status === 'completed' && result.success) {
                return true;
            } else {
                throw new Error(result.error || 'Failed to decline invitation');
            }
        } catch (error: any) {
            console.error('Error declining invitation:', error);
            throw new Error(error.message || 'Failed to decline invitation');
        }
    },
};

