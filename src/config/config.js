// API Configuration
const config = {
    // API URLs - updated for physical device testing
    API_URL: 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/',
    API_URL_IP: 'http://192.168.43.91/LocalGovtAssetMgt_App/backend/api/',
    
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
console.log('Available API URLs:', {
    ip: config.API_URL_IP,
    localhost: config.API_URL
});

export default config;