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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const SettingsScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      console.log('Retrieved user string:', userStr); // Debug log
      
      if (!userStr) {
        throw new Error('No user data found');
      }

      const userData = JSON.parse(userStr);
      console.log('Parsed user data:', userData); // Debug log
      
      if (!userData || !userData.UserID) {
        throw new Error('Invalid user data');
      }

      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't show alert, just set default values
      setUser({
        Username: 'Not available',
        Email: 'Not available',
        Role: 'User'
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (icon, title, value, onPress, type = 'button') => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={colors.primary} />
        <Text style={[styles.settingText, { color: colors.text }]}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.background}
        />
      ) : (
        <Icon name="chevron-right" size={24} color={colors.text} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            {user?.ProfilePhoto ? (
              <Image
                source={{ 
                  uri: `http://192.168.43.91/LocalGovtAssetMgt_App/backend/uploads/${user.ProfilePhoto}` 
                }}
                style={styles.profileImage}
                defaultSource={require('../../assets/default-avatar.jpg')}
              />
            ) : (
              <Icon name="account-circle" size={80} color={colors.primary} />
            )}
            {user?.Role && (
              <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.roleText}>{user.Role}</Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.Username || 'Not available'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.text }]}>
              {user?.Email || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={[styles.groupTitle, { color: colors.text }]}>Account Settings</Text>
          {renderSettingItem('person', 'Edit Profile', null, () => navigation.navigate('EditProfile'))}
          {renderSettingItem('lock', 'Change Password', null, () => navigation.navigate('ChangePassword'))}
        </View>

        <View style={styles.settingsGroup}>
          <Text style={[styles.groupTitle, { color: colors.text }]}>Notifications</Text>
          {renderSettingItem(
            'notifications',
            'Push Notifications',
            notifications,
            () => setNotifications(!notifications),
            'switch'
          )}
          {renderSettingItem(
            'email',
            'Email Alerts',
            emailAlerts,
            () => setEmailAlerts(!emailAlerts),
            'switch'
          )}
        </View>

        <View style={styles.settingsGroup}>
          <Text style={[styles.groupTitle, { color: colors.text }]}>System</Text>
          {renderSettingItem('code', 'API Connection Test', null, () =>
            navigation.navigate('ApiTest')
          )}
          {renderSettingItem('info', 'App Version', null, () => Alert.alert('Version', '1.0.0'))}
          {renderSettingItem('description', 'Terms of Service', null, () => 
            navigation.navigate('TermsOfService')
          )}
          {renderSettingItem('privacy-tip', 'Privacy Policy', null, () => 
            navigation.navigate('PrivacyPolicy')
          )}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 40,
    overflow: 'hidden',
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    marginTop: 5,
    opacity: 0.8,
  },
  settingsGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 8,
    gap: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd', // Placeholder color
  },
});

export default SettingsScreen;
