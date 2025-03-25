// API Configuration
export const API_CONFIG = {
    // Primary API URL for physical device testing
    PRIMARY_URL: 'http://10.20.1.155/LocalGovtAssetMgt_App/backend/api',
    
    // Alternate URL if primary fails
    ALTERNATE_URL: 'http://10.20.1.155/LocalGovtAssetMgt_App/backend/api',
    
    // Additional URLs
    URLS: {
        LOCAL: 'http://localhost/LocalGovtAssetMgt_App/backend/api',
        IP: 'http://10.20.1.155/LocalGovtAssetMgt_App/backend/api'
    },
    
    // Timeout in milliseconds
    TIMEOUT: 10000,
    
    // Endpoints
    ENDPOINTS: {
        LOGIN: '/login.php',
        VERIFY_TOKEN: '/verify_token.php',
        TEST_CONNECTION: '/test_connection.php'
    }
};

// Function to test API connection
const testApiConnection = async (url) => {
    try {
        const response = await fetch(`${url}${API_CONFIG.ENDPOINTS.TEST_CONNECTION}`);
        const data = await response.json();
        return data.status === 'success';
    } catch (error) {
        console.error('API connection test failed:', error);
        return false;
    }
};

// Function to get best available API URL
const getBestApiUrl = async () => {
    // Try PRIMARY_URL first
    if (await testApiConnection(API_CONFIG.PRIMARY_URL)) {
        return API_CONFIG.PRIMARY_URL;
    }
    
    // Try ALTERNATE_URL second
    if (await testApiConnection(API_CONFIG.ALTERNATE_URL)) {
        return API_CONFIG.ALTERNATE_URL;
    }
    
    // If both fail, throw error
    throw new Error('No API server available');
};

// Export configuration and helper functions
export default {
    ...API_CONFIG,
    testApiConnection,
    getBestApiUrl
};