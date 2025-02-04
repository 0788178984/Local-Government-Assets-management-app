import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Choose the appropriate URL based on the platform
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://10.20.1.236:80/LocalGovtAssetMgt_App/backend/api'; // Your IP with port 80
    } else if (Platform.OS === 'ios') {
        return 'http://localhost/LocalGovtAssetMgt_App/backend/api';
    } else {
        return 'http://localhost/LocalGovtAssetMgt_App/backend/api';
    }
};

const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Handle errors globally
const handleError = (error) => {
    if (error.response) {
        // Server responded with error status
        console.error('Response Error:', error.response.data);
        return {
            status: 'error',
            message: error.response.data.message || 'Server error occurred'
        };
    } else if (error.request) {
        // Request made but no response
        console.error('Network Error - No Response');
        return {
            status: 'error',
            message: 'Unable to connect to server. Please check your internet connection and make sure the server is running.'
        };
    } else {
        // Error in request setup
        console.error('Request Error:', error.message);
        return {
            status: 'error',
            message: 'An error occurred while setting up the request'
        };
    }
};

// Authentication APIs
export const login = async (email, password) => {
    try {
        console.log('Attempting login to:', API_URL);
        const response = await api.post('/login.php', { 
            email, 
            password 
        });
        
        if (response.data.status === 'success') {
            await storeUserSession(response.data.data);
            setAuthToken(response.data.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Login error details:', error);
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
        const response = await api.post('/register.php', { username, email, password, role });
        return response.data;
    } catch (error) {
        console.error('Register error details:', error);
        return handleError(error);
    }
};

// Asset Management APIs
export const getAssets = async () => {
    try {
        const response = await api.get('/assets.php');
        return response.data;
    } catch (error) {
        console.error('Get assets error details:', error);
        return handleError(error);
    }
};

export const getAssetById = async (assetId) => {
    try {
        const response = await api.get(`/assets.php?id=${assetId}`);
        return response.data;
    } catch (error) {
        console.error('Get asset by id error details:', error);
        return handleError(error);
    }
};

export const createAsset = async (assetData) => {
    try {
        const response = await api.post('/assets.php', assetData);
        return response.data;
    } catch (error) {
        console.error('Create asset error details:', error);
        return handleError(error);
    }
};

export const updateAsset = async (assetId, assetData) => {
    try {
        const response = await api.put('/assets.php', { assetId, ...assetData });
        return response.data;
    } catch (error) {
        console.error('Update asset error details:', error);
        return handleError(error);
    }
};

export const deleteAsset = async (assetId) => {
    try {
        const response = await api.delete('/assets.php', { data: { assetId } });
        return response.data;
    } catch (error) {
        console.error('Delete asset error details:', error);
        return handleError(error);
    }
};

// Add authentication token to requests
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Store user session
export const storeUserSession = async (userData) => {
    try {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
        console.error('Error storing user session:', error);
    }
};

// Get user session
export const getUserSession = async () => {
    try {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error getting user session:', error);
        return null;
    }
};

// Clear user session
export const clearUserSession = async () => {
    try {
        await AsyncStorage.removeItem('user');
        setAuthToken(null);
    } catch (error) {
        console.error('Error clearing user session:', error);
    }
};

export default {
    // Auth
    login,
    googleLogin,
    register,
    setAuthToken,
    storeUserSession,
    getUserSession,
    clearUserSession,
    
    // Assets
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
};
