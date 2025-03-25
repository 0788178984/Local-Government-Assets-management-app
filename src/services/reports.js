import api, { ENDPOINTS } from './api';

class ReportsService {
    async getReports() {
        try {
            console.log('Fetching reports...');
            const response = await api.get(ENDPOINTS.reports);
            console.log('Reports API response:', response.data);
            
            if (response.data && response.data.status === 'success') {
                return response.data;
            }
            
            return {
                status: 'success',
                data: [],
                summary: {
                    total_records: '0',
                    pending: '0',
                    in_progress: '0',
                    completed: '0',
                    total_cost: '0.00'
                }
            };
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            throw error;
        }
    }
}

export default new ReportsService(); 