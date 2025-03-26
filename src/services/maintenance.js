import api, { ENDPOINTS } from './api';

class MaintenanceService {
    async getMaintenanceRecords() {
        try {
            console.log('Fetching maintenance records...');
            const response = await api.get(ENDPOINTS.maintenance);
            console.log('Maintenance response:', response.data);
            
            if (response.data && response.data.status === 'success') {
                return {
                    status: 'success',
                    data: response.data
                };
            } else if (response.data && Array.isArray(response.data)) {
                return {
                    status: 'success',
                    data: response.data
                };
            }
            return {
                status: 'success',
                data: []
            };
        } catch (error) {
            console.error('Failed to fetch maintenance records:', error);
            if (error.response && error.response.status === 404) {
                return {
                    status: 'success',
                    data: []
                };
            }
            throw error;
        }
    }

    async getMaintenanceById(id) {
        try {
            const response = await api.get(`${ENDPOINTS.maintenance.replace('read.php', 'read_one.php')}?id=${id}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch maintenance record ${id}:`, error);
            throw error;
        }
    }

    async createMaintenance(data) {
        try {
            console.log('Creating maintenance record:', data);
            const response = await api.post(ENDPOINTS.createMaintenance, data);
            return response.data;
        } catch (error) {
            console.error('Failed to create maintenance record:', error);
            throw error;
        }
    }

    async updateMaintenance(id, data) {
        try {
            const response = await api.put(`${ENDPOINTS.maintenance.replace('read.php', 'update.php')}`, {
                MaintenanceID: id,
                ...data
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to update maintenance record ${id}:`, error);
            throw error;
        }
    }

    async deleteMaintenance(id) {
        try {
            const response = await api.post(ENDPOINTS.deleteMaintenance, {
                MaintenanceID: id
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to delete maintenance record ${id}:`, error);
            throw error;
        }
    }
}

export default new MaintenanceService();