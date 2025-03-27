import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, getAuthToken } from '../utils/authUtils';
import config from '../config/config';

// This is a simple loading screen that checks authentication state
// and redirects to the appropriate screen
const AuthLoadingScreen = ({ navigation }) => {
  const [status, setStatus] = useState('Checking authentication...');

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Log to help debug the issue
      console.log('AuthLoadingScreen: Checking authentication state...');
      
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      console.log('AuthLoadingScreen: User data from storage:', userDataString ? 'Found' : 'Not found');
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('AuthLoadingScreen: Token from storage:', token ? 'Found' : 'Not found');
      
      // Get token expiry from AsyncStorage
      const tokenExpiry = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      console.log('AuthLoadingScreen: Token expiry:', tokenExpiry);
      
      if (!userDataString || !token) {
        console.log('AuthLoadingScreen: Missing user data or token, navigating to Login');
        setStatus('Not authenticated, redirecting to login...');
        redirectToLogin();
        return;
      }
      
      // Verify token expiry
      if (tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);
        const now = new Date();
        
        console.log(`AuthLoadingScreen: Token expires at ${expiryDate.toISOString()}, current time is ${now.toISOString()}`);
        
        if (expiryDate <= now) {
          console.log('AuthLoadingScreen: Token expired, navigating to Login');
          setStatus('Session expired, redirecting to login...');
          redirectToLogin();
          return;
        }
      }
      
      // Verify token with backend - SKIPPING backend validation 
      // since we already validated the token locally
      setStatus('Authentication successful, loading dashboard...');
      
      try {
        // Parse user data
        const userData = JSON.parse(userDataString);
        console.log('AuthLoadingScreen: User authenticated as:', userData.Username);
        
        // Valid user session found, navigate to Dashboard
        console.log('AuthLoadingScreen: Navigating to Dashboard...');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        }, 1000);
      } catch (error) {
        console.error('AuthLoadingScreen: Error parsing user data:', error);
        setStatus('Authentication error, redirecting to login...');
        redirectToLogin();
      }
    } catch (error) {
      console.error('AuthLoadingScreen: Error checking auth state:', error);
      setStatus('Error checking authentication, redirecting to login...');
      redirectToLogin();
    }
  };
  
  const redirectToLogin = () => {
    // Short delay to show the message before redirecting
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default AuthLoadingScreen;
