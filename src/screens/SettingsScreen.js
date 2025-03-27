import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  useColorScheme,
  Image,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import { getUserSession, clearAuthData } from '../utils/authUtils';
import { useFocusEffect } from '@react-navigation/native';
import config from '../config/config';

const SettingsScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await getUserSession();
      
      if (userData) {
        setUser(userData);
      } else {
        // Navigate back to login if no user data
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await clearAuthData();
              // Navigate to Welcome screen and clear navigation history
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to log out');
            }
          }
        }
      ]
    );
  };

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const navigateToPrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const navigateToTermsOfService = () => {
    navigation.navigate('TermsOfService');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.ProfilePhoto || config.defaultAvatarUrl }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.Username || 'User'}</Text>
            <Text style={[styles.userEmail, { color: colors.text }]}>{user?.Email || 'email@example.com'}</Text>
            <Text style={[styles.userRole, { color: colors.text }]}>{user?.Role || 'Role'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={navigateToEditProfile}>
          <Icon name="person" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Edit Profile</Text>
          <Icon name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={navigateToChangePassword}>
          <Icon name="lock" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Change Password</Text>
          <Icon name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        
        <View style={styles.menuItem}>
          <Icon name="notifications" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Push Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.menuItem}>
          <Icon name="email" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Email Alerts</Text>
          <Switch
            value={emailAlerts}
            onValueChange={setEmailAlerts}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={navigateToPrivacyPolicy}>
          <Icon name="security" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Privacy Policy</Text>
          <Icon name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={navigateToTermsOfService}>
          <Icon name="description" size={24} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Terms of Service</Text>
          <Icon name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    marginHorizontal: 20,
    marginVertical: 30,
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default SettingsScreen;
