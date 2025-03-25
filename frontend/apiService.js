import axios from 'axios';

// Update this to match your actual IP address
const API_BASE_URL = 'http://10.40.1.234/LocalGovtAssetMgt_App/backend/api';

// Create an Axios instance with auth token interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Remove duplicate logging
  console.log('Starting Request:', config.method, config.baseURL + config.url);
  console.log('Request Data:', config.data);
  return config;
}, error => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// Add a response interceptor with better error handling
api.interceptors.response.use(
  response => {
    console.log('Response Status:', response.status);
    return response;
  },
  error => {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      response: error.response?.data || 'No response received'
    });

    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Please check your network and server status.');
    }
    if (!error.response) {
      throw new Error('Network error. Please check if the server is running and accessible.');
    }
    throw error;
  }
);

// Authentication APIs
export const auth = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login.php', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (name, email, password, role = 'user') => {
    try {
      const response = await api.post('/register.php', { name, email, password, role });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
};

// Assets CRUD
export const assets = {
  // Create new asset
  create: async (assetData) => {
    try {
      const response = await api.post('/assets/create.php', assetData);
      return response.data;
    } catch (error) {
      console.error('Create asset error:', error);
      throw error;
    }
  },

  // Get all assets
  getAll: async () => {
    try {
      const response = await api.get('/assets/read.php');
      return response.data;
    } catch (error) {
      console.error('Get assets error:', error);
      throw error;
    }
  },

  // Get single asset
  getById: async (assetId) => {
    try {
      const response = await api.get(`/assets/read_one.php?id=${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Get asset error:', error);
      throw error;
    }
  },

  // Update asset
  update: async (assetId, assetData) => {
    try {
      const response = await api.put(`/assets/update.php?id=${assetId}`, assetData);
      return response.data;
    } catch (error) {
      console.error('Update asset error:', error);
      throw error;
    }
  },

  // Delete asset
  delete: async (assetId) => {
    try {
      const response = await api.delete(`/assets/delete.php?id=${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Delete asset error:', error);
      throw error;
    }
  },
};

// Maintenance Records CRUD
export const maintenance = {
  // Create maintenance record
  create: async (maintenanceData) => {
    try {
      const response = await api.post('/maintenance/create.php', maintenanceData);
      return response.data;
    } catch (error) {
      console.error('Create maintenance record error:', error);
      throw error;
    }
  },

  // Get all maintenance records
  getAll: async () => {
    try {
      const response = await api.get('/maintenance/read.php');
      return response.data;
    } catch (error) {
      console.error('Get maintenance records error:', error);
      throw error;
    }
  },

  // Get maintenance records by asset
  getByAsset: async (assetId) => {
    try {
      const response = await api.get(`/maintenance/read_by_asset.php?asset_id=${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Get asset maintenance records error:', error);
      throw error;
    }
  },

  // Update maintenance record
  update: async (maintenanceId, maintenanceData) => {
    try {
      const response = await api.put(`/maintenance/update.php?id=${maintenanceId}`, maintenanceData);
      return response.data;
    } catch (error) {
      console.error('Update maintenance record error:', error);
      throw error;
    }
  },

  // Delete maintenance record
  delete: async (maintenanceId) => {
    try {
      const response = await api.delete(`/maintenance/delete.php?id=${maintenanceId}`);
      return response.data;
    } catch (error) {
      console.error('Delete maintenance record error:', error);
      throw error;
    }
  },
};

// Maintenance Teams CRUD
export const teams = {
  // Create team
  create: async (teamData) => {
    try {
      const response = await api.post('/teams/create.php', teamData);
      return response.data;
    } catch (error) {
      console.error('Create team error:', error);
      throw error;
    }
  },

  // Get all teams
  getAll: async () => {
    try {
      const response = await api.get('/teams/read.php');
      return response.data;
    } catch (error) {
      console.error('Get teams error:', error);
      throw error;
    }
  },

  // Get single team
  getById: async (teamId) => {
    try {
      const response = await api.get(`/teams/read_one.php?id=${teamId}`);
      return response.data;
    } catch (error) {
      console.error('Get team error:', error);
      throw error;
    }
  },

  // Update team
  update: async (teamId, teamData) => {
    try {
      const response = await api.put(`/teams/update.php?id=${teamId}`, teamData);
      return response.data;
    } catch (error) {
      console.error('Update team error:', error);
      throw error;
    }
  },

  // Delete team
  delete: async (teamId) => {
    try {
      const response = await api.delete(`/teams/delete.php?id=${teamId}`);
      return response.data;
    } catch (error) {
      console.error('Delete team error:', error);
      throw error;
    }
  },
};

// Maintenance Schedules CRUD
export const schedules = {
  // Create schedule
  create: async (scheduleData) => {
    try {
      const response = await api.post('/schedules/create.php', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Create schedule error:', error);
      throw error;
    }
  },

  // Get all schedules
  getAll: async () => {
    try {
      const response = await api.get('/schedules/read.php');
      return response.data;
    } catch (error) {
      console.error('Get schedules error:', error);
      throw error;
    }
  },

  // Get schedules by asset
  getByAsset: async (assetId) => {
    try {
      const response = await api.get(`/schedules/read_by_asset.php?asset_id=${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Get asset schedules error:', error);
      throw error;
    }
  },

  // Update schedule
  update: async (scheduleId, scheduleData) => {
    try {
      const response = await api.put(`/schedules/update.php?id=${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Update schedule error:', error);
      throw error;
    }
  },

  // Delete schedule
  delete: async (scheduleId) => {
    try {
      const response = await api.delete(`/schedules/delete.php?id=${scheduleId}`);
      return response.data;
    } catch (error) {
      console.error('Delete schedule error:', error);
      throw error;
    }
  },

  // Get due maintenance schedules
  getDue: async (daysAhead = 30) => {
    try {
      const response = await api.get(`/schedules/get_due.php?days=${daysAhead}`);
      return response.data;
    } catch (error) {
      console.error('Get due schedules error:', error);
      throw error;
    }
  },
};
