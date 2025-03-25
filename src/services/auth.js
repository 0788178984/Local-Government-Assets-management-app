import apiConfig from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
    constructor() {
        this.apiUrl = null;
        this.initializeApi();
    }

    async initializeApi() {
        try {
            this.apiUrl = await apiConfig.getBestApiUrl();
            console.log('Using API URL:', this.apiUrl);
        } catch (error) {
            console.error('Failed to initialize API:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            if (!this.apiUrl) {
                await this.initializeApi();
            }

            console.log('Attempting login with:', { email, password });
            console.log('Attempting login to:', this.apiUrl);

            const response = await fetch(`${this.apiUrl}${apiConfig.ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                // Store auth data
                await AsyncStorage.setItem('user_token', data.data.token);
                await AsyncStorage.setItem('user_data', JSON.stringify(data.data));
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (!error.response) {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    }

    async logout() {
        try {
            await AsyncStorage.removeItem('user_token');
            await AsyncStorage.removeItem('user_data');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const userData = await AsyncStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    async isAuthenticated() {
        try {
            const token = await AsyncStorage.getItem('user_token');
            if (!token) return false;

            // Verify token with backend
            const response = await fetch(`${this.apiUrl}${apiConfig.ENDPOINTS.VERIFY_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data.status === 'success';
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }
}

export default new AuthService(); 