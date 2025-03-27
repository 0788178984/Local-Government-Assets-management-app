// API Configuration
const config = {
    // Server information - SINGLE SOURCE OF TRUTH
    SERVER: {
        IP: '10.20.1.41',
        BASE_PATH: '/LocalGovtAssetMgt_App',
        PORT: '80' // Default HTTP port
    },
    
    // Derived URLs (calculated from SERVER config)
    get API_BASE_URL() {
        return `http://${this.SERVER.IP}${this.SERVER.PORT !== '80' ? ':' + this.SERVER.PORT : ''}${this.SERVER.BASE_PATH}`;
    },
    
    get API_URL() {
        return `${this.API_BASE_URL}/backend/api/`;
    },
    
    get API_URL_IP() {
        return this.API_URL;
    },
    
    get UPLOADS_URL() {
        return `${this.API_BASE_URL}/backend/uploads/`;
    },
    
    // Image base URL for accessing images via network
    get imageBaseUrl() {
        return `${this.API_BASE_URL}/backend/images/`;
    },
    
    // Image assets URLs
    get logoUrl() {
        return `${this.imageBaseUrl}logo1.png`;
    },
    
    get developerPhotoUrl() {
        return `${this.imageBaseUrl}ASIIMWE.png`;
    },
    
    get defaultAvatarUrl() {
        return `${this.imageBaseUrl}default-avatar.jpg`;
    },
    
    // API Timeouts
    TIMEOUT: 15000, // 15 seconds
    RETRY_DELAY: 1000, // 1 second
    MAX_RETRIES: 3,
    
    async testConnection() {
        try {
            // Test IP connection
            const ipTest = await fetch(this.API_URL_IP + 'ping.php', {
                timeout: this.TIMEOUT
            });
            if (ipTest.ok) {
                console.log('IP connection successful');
                return { success: true, url: this.API_URL_IP };
            }
        } catch (error) {
            console.log('IP connection failed:', error);
        }

        try {
            // Test localhost as fallback
            const localTest = await fetch(this.API_URL + 'ping.php', {
                timeout: this.TIMEOUT
            });
            if (localTest.ok) {
                console.log('Localhost connection successful');
                return { success: true, url: this.API_URL };
            }
        } catch (error) {
            console.log('Localhost connection failed:', error);
        }

        return { success: false, url: null };
    }
};

// For debugging
console.log('Current server configuration:', {
    ip: config.SERVER.IP,
    basePath: config.SERVER.BASE_PATH,
    port: config.SERVER.PORT
});

console.log('Available API URLs:', {
    apiUrl: config.API_URL,
    uploadsUrl: config.UPLOADS_URL
});

export default config;