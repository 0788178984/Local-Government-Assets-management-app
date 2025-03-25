import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  useColorScheme
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

const EditProfileScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  
  const [profileData, setProfileData] = useState({
    Username: '',
    Email: '',
    FullName: '',
    PhoneNumber: '',
    Address: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        setProfileData(prevData => ({
          ...prevData,
          ...userData
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      const userData = JSON.parse(userString);
      
      const response = await fetch(
        'http://10.20.1.155/LocalGovtAssetMgt_App/backend/api/users/update_profile.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            UserID: userData.UserID,
            Username: profileData.Username,
            Email: profileData.Email,
            FullName: profileData.FullName,
            PhoneNumber: profileData.PhoneNumber,
            Address: profileData.Address
          }),
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        // Update AsyncStorage with new user data
        const updatedUserData = { ...userData, ...profileData };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
        
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Username</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={profileData.Username}
          onChangeText={(text) => setProfileData({ ...profileData, Username: text })}
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={profileData.Email}
          onChangeText={(text) => setProfileData({ ...profileData, Email: text })}
          keyboardType="email-address"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={profileData.FullName}
          onChangeText={(text) => setProfileData({ ...profileData, FullName: text })}
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={profileData.PhoneNumber}
          onChangeText={(text) => setProfileData({ ...profileData, PhoneNumber: text })}
          keyboardType="phone-pad"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={profileData.Address}
          onChangeText={(text) => setProfileData({ ...profileData, Address: text })}
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.text}
        />

        <TouchableOpacity
          style={[styles.updateButton, { backgroundColor: colors.primary }]}
          onPress={handleUpdate}
        >
          <Text style={styles.updateButtonText}>Update Profile</Text>
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
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  updateButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 