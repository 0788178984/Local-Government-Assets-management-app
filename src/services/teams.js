import api, { ENDPOINTS } from './api';

class TeamsService {
    async getTeams() {
        try {
            console.log('Fetching teams...');
            const response = await api.get(ENDPOINTS.teams);
            console.log('Teams API response:', response.data);
            
            // Check if we have a valid response with data
            if (response.data && response.data.status === 'success') {
                if (Array.isArray(response.data.data)) {
                    return {
                        status: 'success',
                        data: response.data.data.map(team => ({
                            id: team.TeamID,
                            value: team.TeamID,
                            label: team.TeamName,
                            ...team
                        }))
                    };
                }
                return response.data;
            }
            
            // If no data, return empty array with success status
            return {
                status: 'success',
                data: [],
                message: 'No teams available'
            };
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            // Return empty array instead of throwing error for no teams
            if (error.response && error.response.status === 404) {
                return {
                    status: 'success',
                    data: [],
                    message: 'No teams found'
                };
            }
            throw error;
        }
    }

    async createTeam(teamData) {
        try {
            console.log('Creating team with data:', teamData);
            const response = await api.post(ENDPOINTS.createTeam, teamData);
            console.log('Create team response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Create team error:', error);
            if (error.response) {
                console.log('Error response:', error.response.data);
            }
            throw error;
        }
    }

    async getTeamById(teamId) {
        try {
            const response = await api.get(`maintenance_teams/read_one.php?id=${teamId}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch team ${teamId}:`, error);
            throw error;
        }
    }

    async refreshTeams() {
        try {
            return await this.getTeams();
        } catch (error) {
            console.error('Failed to refresh teams:', error);
            throw error;
        }
    }
}

export default new TeamsService();