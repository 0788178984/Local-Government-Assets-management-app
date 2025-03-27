import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/authUtils';

// This is a bridge component that ensures proper navigation to Dashboard
const DashboardBridge = ({ navigation }) => {
  useEffect(() => {
    // Immediately navigate to the correct Dashboard component
    const navigateToDashboard = async () => {
      try {
        // Retrieve user data to pass to Dashboard
        const userDataStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        
        console.log('DashboardBridge: Redirecting to correct Dashboard...');
        
        // Give a slight delay to ensure the navigation stack is ready
        setTimeout(() => {
          navigation.replace('Dashboard', { user: userData });
        }, 300);
      } catch (error) {
        console.error('DashboardBridge: Error during navigation:', error);
        // If something goes wrong, still try to navigate
        setTimeout(() => {
          navigation.replace('Dashboard');
        }, 300);
      }
    };

    navigateToDashboard();
  }, [navigation]);

  // Show loading indicator while redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.text}>Loading Dashboard...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default DashboardBridge;
