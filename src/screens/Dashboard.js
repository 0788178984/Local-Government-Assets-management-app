import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../theme/colors';

const Dashboard = ({ navigation }) => {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const menuItems = [
    {
      title: 'Asset Management',
      icon: 'business',
      screen: 'AssetManagement',
      description: 'Manage and track assets',
    },
    {
      title: 'Maintenance',
      icon: 'build',
      screen: 'MaintenanceManagement',
      description: 'Schedule and track maintenance',
    },
    {
      title: 'Reports',
      icon: 'assessment',
      screen: 'Report',
      description: 'View and generate reports',
    },
    {
      title: 'Test Operations',
      icon: 'bug-report',
      screen: 'TestOperations',
      description: 'Test all database operations',
    },
  ];

  const renderMenuItem = ({ title, icon, screen, description }) => (
    <TouchableOpacity
      key={title}
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate(screen)}
    >
      <View style={styles.menuItemContent}>
        <Icon name={icon} size={32} color={colors.primary} />
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.menuItemDescription, { color: colors.text }]}>
            {description}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Welcome, {user?.Username || 'User'}
          </Text>
          <Text style={[styles.subText, { color: colors.text }]}>
            Role: {user?.Role || 'Staff'}
          </Text>
        </View>
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: colors.text }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    opacity: 0.7,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 16,
  },
  logoutText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Dashboard;