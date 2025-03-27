import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import { API_URL } from '../services/api';

const ChangePassword = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChangePassword = async () => {
    try {
      // Validate inputs
      if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
        Alert.alert('Error', 'All fields are required');
        return;
      }

      if (passwords.newPassword !== passwords.confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }

      if (passwords.newPassword.length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters long');
        return;
      }

      // Get user data from AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      console.log('Retrieved user data:', userStr);

      if (!userStr) {
        Alert.alert('Error', 'User session not found. Please login again.');
        navigation.navigate('Login');
        return;
      }

      const userData = JSON.parse(userStr);

      const response = await fetch(`${API_URL}/users/change_password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          UserID: userData.UserID,
          CurrentPassword: passwords.currentPassword,
          NewPassword: passwords.newPassword
        })
      });

      const data = await response.json();
      console.log('Change password response:', data);

      if (data.status === 'success') {
        Alert.alert('Success', 'Password changed successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                flex: 1,
              }]}
              value={passwords.currentPassword}
              onChangeText={(text) => setPasswords({...passwords, currentPassword: text})}
              placeholder="Enter current password"
              placeholderTextColor={colors.text}
              secureTextEntry={!showPasswords.current}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
            >
              <Icon 
                name={showPasswords.current ? "visibility" : "visibility-off"} 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                flex: 1,
              }]}
              value={passwords.newPassword}
              onChangeText={(text) => setPasswords({...passwords, newPassword: text})}
              placeholder="Enter new password"
              placeholderTextColor={colors.text}
              secureTextEntry={!showPasswords.new}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
            >
              <Icon 
                name={showPasswords.new ? "visibility" : "visibility-off"} 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                flex: 1,
              }]}
              value={passwords.confirmPassword}
              onChangeText={(text) => setPasswords({...passwords, confirmPassword: text})}
              placeholder="Confirm new password"
              placeholderTextColor={colors.text}
              secureTextEntry={!showPasswords.confirm}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
            >
              <Icon 
                name={showPasswords.confirm ? "visibility" : "visibility-off"} 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.changeButton, { backgroundColor: colors.primary }]}
          onPress={handleChangePassword}
        >
          <Text style={styles.changeButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  changeButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePassword; 