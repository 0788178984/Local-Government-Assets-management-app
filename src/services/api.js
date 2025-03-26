import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import config from '../config/config';

// Get API URL from config - ensure we use the correct IP address
export const API_URL = 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// API Endpoints - ensure no leading slashes since baseURL has trailing slash
export const ENDPOINTS = {
    login: 'users/login.php',
    register: 'users/register.php',
    assets: 'assets/read.php',
    createAsset: 'assets/create.php',
    teams: 'teams/read.php',
    createTeam: 'teams/create.php',
    maintenance: 'maintenance/read.php',
    createMaintenance: 'maintenance/create.php',
    schedules: 'schedules/read.php',
    createSchedule: 'schedules/create.php',
    reports: 'reports/read.php',
    createReport: 'reports/create.php',
    generateReport: 'reports/generate.php',
    deleteAsset: 'assets/delete.php',
    deleteTeam: 'teams/delete.php',
    deleteMaintenance: 'maintenance/delete.php'
};

// Add auth token interceptor
api.interceptors.request.use(async (config) => {
    try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    } catch (error) {
        console.error('Error setting auth token:', error);
        return config;
    }
});

// Log requests
api.interceptors.request.use(request => {
    console.log('Starting Request:', {
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers
    });
    return request;
});

// Log responses
api.interceptors.response.use(
    response => {
        console.log('Response:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API No Response:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('API Request Setup Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Add better error handling
const handleError = (error) => {
    if (error.response) {
        // Server responded with error status
        return {
            status: 'error',
            message: error.response.data.message || 'Server error',
            code: error.response.status
        };
    } else if (error.request) {
        // Request made but no response
        return {
            status: 'error',
            message: `Network connection error. Please check if the server is running at ${API_URL}`,
            code: 'NETWORK_ERROR'
        };
    }
        return {
            status: 'error',
        message: 'Request configuration error',
        code: 'CONFIG_ERROR'
        };
};

// Authentication APIs
export const login = async (email, password) => {
    try {
        const loginUrl = ENDPOINTS.login;
        // Use the updated API_URL directly to ensure we're using the new IP
        const fullLoginUrl = `${API_URL}${loginUrl}`;
        console.log('Login URL:', fullLoginUrl);
        
        // Ensure we're using the most current API URL for login
        const currentAPIUrl = API_URL;
        
        // Check if server is reachable
        try {
            await fetch(`${currentAPIUrl}ping.php`);
        } catch (networkError) {
            console.error('Server not reachable:', networkError);
            return {
                status: 'error',
                message: `Server not reachable at ${currentAPIUrl}. Please check your connection and server status.`
            };
        }
        
        // Ensure data is properly formatted
        const loginData = {
            email: email.trim(),
            password: password.trim()
        };
        
        console.log('Sending login data:', loginData);
        console.log('Available API URLs:', {
            'ip': config.API_URL_IP,
            'localhost': config.API_URL
        });
        
        const response = await api.post(loginUrl, loginData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 5000, // 5 second timeout
            validateStatus: function (status) {
                return status >= 200 && status < 500;
            }
        });
        
        console.log('Login response status:', response.status);
        console.log('Login response data:', response.data);
        
        if (response.data.status === 'success' && response.data.data) {
            const { data } = response.data;
            
            // Store user data with corrected field mappings
            const userData = {
                UserID: data.userId,
                Username: data.username,
                Email: data.email,
                Role: data.role
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            
            // Return success with the correct data structure
            return {
                status: 'success',
                data: userData,
                message: 'Login successful'
            };
        } else {
            return {
                status: 'error',
                message: response.data.message || 'Invalid credentials'
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return handleError(error);
    }
};

export const googleLogin = async (googleUser) => {
    try {
        const response = await api.post('/google-login.php', {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.googleId
        });
        if (response.data.status === 'success') {
            await storeUserSession(response.data.data);
            setAuthToken(response.data.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Google login error details:', error);
        return handleError(error);
    }
};

export const register = async (username, email, password, role = 'Asset Manager') => {
    try {
        const response = await api.post(ENDPOINTS.register, { username, email, password, role });
        return response.data;
    } catch (error) {
        console.error('Register error details:', error);
        return handleError(error);
    }
};

// User Management APIs
export const userService = {
    getAll: async () => {
        try {
            const response = await api.get('users/read.php');
            return response.data;
        } catch (error) {
            console.error('Get users error:', error);
            return handleError(error);
        }
    },
    
    getById: async (userId) => {
        try {
            const response = await api.get(`users/read_one.php?id=${userId}`);
            return response.data;
        } catch (error) {
            console.error('Get user error:', error);
            return handleError(error);
        }
    },
    
    create: async (userData) => {
        try {
            const response = await api.post('users/create.php', userData);
            return response.data;
        } catch (error) {
            console.error('Create user error:', error);
            return handleError(error);
        }
    },
    
    update: async (userId, userData) => {
        try {
            const response = await api.put(`users/update.php?id=${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error('Update user error:', error);
            return handleError(error);
        }
    },
    
    delete: async (userId) => {
        try {
            const response = await api.delete(`users/delete.php?id=${userId}`);
        return response.data;
    } catch (error) {
            console.error('Delete user error:', error);
        return handleError(error);
        }
    }
};

// Assets Management APIs
export const assetService = {
    getAll: async () => {
        try {
            const response = await axios.get(`${API_URL}/assets/read.php`);
            return response.data;
        } catch (error) {
            console.error('Error in assetService.getAll:', error);
            throw error;
        }
    },
    
    getById: async (assetId) => {
        try {
            const response = await api.get(`assets/read_one.php?id=${assetId}`);
            return response.data;
        } catch (error) {
            console.error('Get asset error:', error);
            return handleError(error);
        }
    },
    
    create: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/assets/create.php`, data);
            return response.data;
        } catch (error) {
            console.error('Error in assetService.create:', error);
            throw error;
        }
    },
    
    update: async (assetId, assetData) => {
        try {
            const response = await api.put(`assets/update.php?id=${assetId}`, assetData);
        return response.data;
    } catch (error) {
            console.error('Update asset error:', error);
        return handleError(error);
        }
    },
    
    delete: async (id) => {
        try {
            const response = await api.post(ENDPOINTS.deleteAsset, { AssetID: id });
            return response.data;
        } catch (error) {
            console.error('Delete asset error:', error);
            throw error;
        }
    }
};

// Maintenance Teams APIs
export const teamService = {
    getAll: async () => {
        try {
            // Update path to match backend structure
            const response = await api.get('teams/read.php');
            console.log('Team service response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Get teams error:', error);
            if (error.response && error.response.status === 404) {
                // Return empty array if no teams found
                return { status: 'success', data: [] };
            }
            return handleError(error);
        }
    },
    
    getById: async (teamId) => {
        try {
            const response = await api.get(`teams/read_one.php?id=${teamId}`);
            return response.data;
        } catch (error) {
            console.error('Get team error:', error);
            return handleError(error);
        }
    },
    
    create: async (teamData) => {
        try {
            const response = await api.post('teams/create.php', teamData);
            return response.data;
        } catch (error) {
            console.error('Create team error:', error);
            return handleError(error);
        }
    },
    
    update: async (teamId, teamData) => {
        try {
            const response = await api.put(`teams/update.php?id=${teamId}`, teamData);
            return response.data;
        } catch (error) {
            console.error('Update team error:', error);
            return handleError(error);
        }
    },
    
    delete: async (id) => {
        try {
            const response = await api.post(ENDPOINTS.deleteTeam, { teamId: id });
            if (response.data && response.data.status === 'success') {
                return response.data;
            } else {
                throw new Error(response.data?.message || 'Failed to delete team');
            }
        } catch (error) {
            if (error.response) {
                console.error('Delete team error response:', error.response);
                throw new Error(error.response.data?.message || 'Failed to delete team');
            } else if (error.request) {
                console.error('Delete team error request:', error.request);
                throw new Error('Network error while deleting team');
            } else {
                console.error('Delete team error:', error);
                throw error;
            }
        }
    },

    // Add test function to diagnose issues
    testDelete: async (id) => {
        try {
            console.log('Testing delete with ID:', id);
            
            // Test the endpoint directly
            const testResponse = await fetch(`${API_URL}test/team_delete_test.php?id=${id}`, {
                method: 'GET'
            });
            
            console.log('Test response status:', testResponse.status);
            const testText = await testResponse.text();
            console.log('Raw test response:', testText);
            
            let testResult;
            try {
                testResult = JSON.parse(testText);
                console.log('Parsed test result:', testResult);
            } catch (parseError) {
                console.error('Test parse error:', parseError);
                testResult = { status: 'error', message: 'Failed to parse test response' };
            }
            
            return {
                status: 'success',
                message: 'Test completed, check console',
                testResult
            };
        } catch (error) {
            console.error('Test error:', error);
            return {
                status: 'error',
                message: 'Test failed: ' + error.message
            };
        }
    },

    // Add method to get active teams count
    getActiveCount: async () => {
        try {
            const response = await axios.get(`${API_URL}teams/read.php`);
            return response.data.active_count || 0;
        } catch (error) {
            console.error('Get active teams count error:', error);
            return 0;
        }
    },

    // Add a simple delete method using the simplified endpoint
    simpleDelete: async (id) => {
        try {
            console.log('Simple delete team with ID:', id);
            
            // Use URLSearchParams
            const params = new URLSearchParams();
            params.append('id', id);
            
            // Make request
            const response = await fetch(`${API_URL}teams/delete_simple.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
            
            console.log('Simple delete response status:', response.status);
            
            // Get text response
            const responseText = await response.text();
            console.log('Simple delete raw response:', responseText);
            
            // Check if empty
            if (!responseText || responseText.trim() === '') {
                return {
                    status: 'success',
                    message: 'Team deleted (empty response)'
                };
            }
            
            // Try to parse JSON
            try {
                return JSON.parse(responseText);
            } catch (parseError) {
                console.error('Simple delete parse error:', parseError);
                return {
                    status: response.ok ? 'success' : 'error',
                    message: response.ok ? 'Team deleted (response not JSON)' : 'Failed to parse response'
                };
            }
        } catch (error) {
            console.error('Simple delete error:', error);
            return {
                status: 'error',
                message: 'Network error: ' + error.message
            };
        }
    },
};

// Maintenance Records APIs
export const maintenanceService = {
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.maintenance);
            return response.data;
        } catch (error) {
            console.error('Get maintenance records error:', error);
            return handleError(error);
        }
    },
    
    getById: async (maintenanceId) => {
        try {
            const response = await api.get(`maintenance/read_one.php?id=${maintenanceId}`);
            return response.data;
        } catch (error) {
            console.error('Get maintenance record error:', error);
            return handleError(error);
        }
    },
    
    create: async (maintenanceData) => {
        try {
            const response = await api.post(ENDPOINTS.createMaintenance, maintenanceData);
            return response.data;
        } catch (error) {
            console.error('Create maintenance record error:', error);
            return handleError(error);
        }
    },
    
    update: async (maintenanceId, maintenanceData) => {
        try {
            // Transform the data to match the backend API expectations
            const transformedData = {
                maintenanceId: maintenanceId,
                maintenanceType: maintenanceData.MaintenanceType,
                description: maintenanceData.Description || '',
                cost: maintenanceData.Cost || '0',
                maintenanceStatus: maintenanceData.MaintenanceStatus || 'Pending',
                maintenanceProvider: maintenanceData.MaintenanceProvider || '',
                teamId: maintenanceData.TeamID || maintenanceData.TeamId || null,
                maintenanceDate: maintenanceData.MaintenanceDate || null
            };
            
            console.log('Sending maintenance update with data:', transformedData);
            
            const response = await api.put(`maintenance/update.php`, transformedData);
            return response.data;
        } catch (error) {
            console.error('Update maintenance record error:', error);
            return handleError(error);
        }
    },
    
    delete: async (id) => {
        try {
            const response = await api.post(ENDPOINTS.deleteMaintenance, { id });
            return response.data;
        } catch (error) {
            console.error('Delete maintenance error:', error);
            return handleError(error);
        }
    }
};

// Reports APIs
export const reportService = {
    getAll: async () => {
        try {
            const response = await api.get(ENDPOINTS.reports);
            return response.data;
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    },
    
    getById: async (reportId) => {
        try {
            const response = await api.get(`${ENDPOINTS.reports}?id=${reportId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching report:', error);
            throw error;
        }
    },
    
    create: async (reportData) => {
        try {
            const response = await api.post(ENDPOINTS.createReport, reportData);
            return response.data;
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    },

    generate: async (reportData) => {
        try {
            const response = await api.post(ENDPOINTS.generateReport, {
                title: reportData.title,
                description: reportData.description,
                reportType: reportData.type,
                startDate: reportData.startDate,
                endDate: reportData.endDate,
                status: 'Pending'
            });
            return response.data;
        } catch (error) {
            console.error('Error generating report:', error);
            if (error.response) {
                throw new Error(error.response.data?.message || 'Failed to generate report');
            }
            throw error;
        }
    }
};

// User session and profile management
export const getUserSession = async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error getting user session:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const userData = await getUserSession();
    if (!userData || !userData.UserID) {
      throw new Error('User not authenticated');
    }
    
    // Ensure we have the UserID in the request
    // Only include fields that exist in the database
    const requestData = {
      UserID: userData.UserID,
      Username: profileData.Username,
      Email: profileData.Email
    };
    
    console.log('Sending profile update:', requestData);
    
    const response = await api.post('users/update_profile.php', requestData);
    
    if (response.data.status === 'success') {
      // Update the local storage with the new profile data
      const updatedUserData = { ...userData, ...requestData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return handleError(error);
  }
};

// Export default api for direct axios usage
export default api;
