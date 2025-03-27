import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/config';

// Keys used in AsyncStorage
export const STORAGE_KEYS = {
  USER: 'userSession',
  TOKEN: 'authToken',
  TOKEN_EXPIRY: 'tokenExpiry',
  REFRESH_TOKEN: 'refreshToken',
  HAS_LAUNCHED: 'hasLaunched'
};

// Session configuration
const SESSION_CONFIG = {
  TOKEN_EXPIRY_MINUTES: 60, // 1 hour
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  REFRESH_THRESHOLD_MINUTES: 5 // Refresh token if less than 5 minutes until expiry
};

// Error messages
export const AUTH_ERRORS = {
  INVALID_FORMAT: 'Invalid data format: User data must be an object with required fields',
  MISSING_FIELDS: (fields) => `Missing required fields: ${fields.join(', ')}`,
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_REFRESH_FAILED: 'Failed to refresh authentication token. Please log in again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
  UNAUTHORIZED: 'You are not authorized to perform this action.'
};

// Clear all auth-related data from AsyncStorage
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER,
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.TOKEN_EXPIRY,
      STORAGE_KEYS.REFRESH_TOKEN
    ]);
    console.log('Auth data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw new Error('Failed to clear authentication data');
  }
};

// Set user session data with proper validation
export const setUserSession = async (userData, token, refreshToken) => {
  try {
    if (!userData || typeof userData !== 'object') {
      throw new Error(AUTH_ERRORS.INVALID_FORMAT);
    }

    // Validate required fields
    const requiredFields = ['UserID', 'Username', 'Email', 'Role'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(AUTH_ERRORS.MISSING_FIELDS(missingFields));
    }

    // Check if tokenExpiry is already a Date string in the userData
    let tokenExpiryDate;
    if (userData.tokenExpiry) {
      try {
        // Try to parse the tokenExpiry from the server
        tokenExpiryDate = new Date(userData.tokenExpiry);
        
        // Verify it's a valid date and in the future
        if (isNaN(tokenExpiryDate) || tokenExpiryDate <= new Date()) {
          console.log('Invalid or expired token expiry from server:', userData.tokenExpiry);
          // Fall back to calculating a new expiry
          tokenExpiryDate = new Date();
          tokenExpiryDate.setMinutes(tokenExpiryDate.getMinutes() + SESSION_CONFIG.TOKEN_EXPIRY_MINUTES);
        }
      } catch (dateError) {
        console.log('Error parsing token expiry date:', dateError);
        // Fall back to calculating a new expiry
        tokenExpiryDate = new Date();
        tokenExpiryDate.setMinutes(tokenExpiryDate.getMinutes() + SESSION_CONFIG.TOKEN_EXPIRY_MINUTES);
      }
    } else {
      // If no tokenExpiry in userData, create one
      tokenExpiryDate = new Date();
      tokenExpiryDate.setMinutes(tokenExpiryDate.getMinutes() + SESSION_CONFIG.TOKEN_EXPIRY_MINUTES);
    }

    // Prepare user data with defaults
    const userDataWithDefaults = {
      ...userData,
      ProfilePhoto: userData.ProfilePhoto || null
    };

    // Store session data
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userDataWithDefaults)),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, tokenExpiryDate.toISOString()),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    ]);

    console.log(`User session saved successfully: ${JSON.stringify({
      user: userDataWithDefaults,
      tokenExpiry: tokenExpiryDate
    })}`);
    
    return {
      user: userDataWithDefaults,
      token,
      refreshToken,
      tokenExpiry: tokenExpiryDate
    };
  } catch (error) {
    console.error('Error setting user session:', error);
    throw error;
  }
};

// Get user session data with proper error handling
export const getUserSession = async () => {
  try {
    // Get all session data
    const [userStr, token, tokenExpiry, refreshToken] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY),
      AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    ]);

    console.log('Retrieved session data:', { hasToken: !!token, tokenExpiry, userStr });
    
    // If either user data or token is missing, return null but don't clear data
    if (!userStr || !token) {
      console.log('No user session found');
      return null;
    }

    // Check token expiry
    if (tokenExpiry) {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      
      // If token is expired
      if (expiryDate <= now) {
        console.log('Token expired, attempting refresh...');
        if (refreshToken) {
          try {
            const refreshed = await refreshAuthToken(refreshToken);
            if (!refreshed) {
              console.log('Refresh failed but continuing with current token');
              // Don't throw or clear data - let the component decide what to do
            }
          } catch (refreshError) {
            console.log('Refresh error but continuing:', refreshError.message);
            // Don't throw or clear data - let the component decide what to do
          }
        }
      }
      // If token will expire soon, refresh in background
      else if ((expiryDate - now) / 1000 / 60 <= SESSION_CONFIG.REFRESH_THRESHOLD_MINUTES) {
        console.log('Token expiring soon, refreshing in background...');
        refreshAuthToken(refreshToken).catch(error => {
          console.log('Background refresh failed:', error.message);
          // Just log the error, don't throw
        });
      }
    }
    
    // Parse user data, but don't fail if it's invalid
    try {
      const userData = JSON.parse(userStr);
      return userData;
    } catch (parseError) {
      console.error('Error parsing user data:', parseError);
      // Return a minimal valid user object rather than null
      return {
        UserID: '0',
        Username: 'Guest',
        Email: 'guest@localgov.com',
        Role: 'Guest'
      };
    }
  } catch (error) {
    // Log the error but don't clear auth data or throw
    console.error('Error getting user session:', error);
    // Return a minimal valid user object rather than null or throwing
    return {
      UserID: '0',
      Username: 'Guest',
      Email: 'guest@localgov.com',
      Role: 'Guest'
    };
  }
};

// Refresh authentication token
export const refreshAuthToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    // Make API call to refresh token
    const response = await fetch(`${config.API_URL}refresh.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      console.log(`Refresh token API returned ${response.status}`);
      return false;
    }

    const data = await response.json();
    
    if (data.status !== 'success' || !data.data?.token) {
      console.log('Invalid response from refresh token API');
      return false;
    }

    // Update stored token
    const { token, tokenExpiry, newRefreshToken } = data.data;
    
    // Set new token in AsyncStorage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, new Date(tokenExpiry).toISOString()),
      newRefreshToken ? AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken) : Promise.resolve()
    ]);

    console.log('Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const userData = await getUserSession();
    return !!userData;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Get authentication token
export const getAuthToken = async () => {
  try {
    // Get token and check expiry
    const [token, tokenExpiry, refreshToken] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY),
      AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    ]);
    
    if (!token) {
      return null;
    }
    
    // Check if token is expired
    if (tokenExpiry) {
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      
      if (expiryDate <= now) {
        // Token expired, try to refresh
        if (refreshToken) {
          const refreshed = await refreshAuthToken(refreshToken);
          if (refreshed) {
            // Get the new token
            return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
          }
        }
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};
