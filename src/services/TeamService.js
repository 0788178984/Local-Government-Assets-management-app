import config from '../config/config';
import axios from 'axios';

class TeamService {
    constructor() {
        this.baseUrl = null;
    }

    async initializeConnection() {
        try {
            const connection = await config.testConnection();
            this.baseUrl = connection.url;
            console.log('Using API URL:', this.baseUrl);
        } catch (error) {
            console.error('Connection initialization failed:', error);
            throw new Error('Unable to establish connection. Please check your network and server settings.');
        }
    }

    async getAllTeams() {
        try {
            await this.initializeConnection();
            console.log('Fetching teams from:', `${this.baseUrl}maintenance_teams/read.php`);
            
            const response = await axios.get(`${this.baseUrl}maintenance_teams/read.php`, {
                timeout: 5000
            });
            
            if (response.data && response.data.status === 'success') {
                return {
                    success: true,
                    data: response.data.records || [],
                    activeCount: response.data.activeCount,
                    totalCount: response.data.totalCount
                };
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
            throw new Error('Failed to fetch teams. Please check your network connection and try again.');
        }
    }

    // Create new team
    async createTeam(teamData) {
        try {
            await this.initializeConnection();
            const response = await axios.post(`${this.baseUrl}maintenance_teams/create.php`, teamData);
            console.log('Create team response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error creating team:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update team
    async updateTeam(teamData) {
        try {
            await this.initializeConnection();
            const response = await axios.post(`${this.baseUrl}maintenance_teams/update.php`, teamData);
            console.log('Update team response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error updating team:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete team
    async deleteTeam(teamId) {
        try {
            await this.initializeConnection();
            const response = await axios.post(`${this.baseUrl}maintenance_teams/delete.php`, {
                teamId: teamId
            });
            console.log('Delete team response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error deleting team:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new TeamService(); 