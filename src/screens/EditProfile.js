import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/config';

const EditProfile = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  
  const [profile, setProfile] = useState({
    Username: '',
    Email: '',
    Role: '',
    ProfilePicture: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('userSession');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setProfile({
          Username: parsedData.Username || '',
          Email: parsedData.Email || '',
          Role: parsedData.Role || '',
          ProfilePicture: parsedData.ProfilePicture || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleSave = async () => {
    try {
      if (!profile.Username.trim() || !profile.Email.trim()) {
        Alert.alert('Error', 'Username and Email are required');
        return;
      }

      const response = await AsyncStorage.setItem('userSession', JSON.stringify(profile));
      if (response) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileImageSection}>
        <Image
          source={profile.ProfilePicture ? { uri: profile.ProfilePicture } : { uri: config.defaultAvatarUrl }}
          style={styles.profileImage}
        />
        <Text style={[styles.roleText, { color: colors.text }]}>
          Role: {profile.Role}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Username</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border 
            }]}
            value={profile.Username}
            onChangeText={(text) => setProfile({...profile, Username: text})}
            placeholder="Enter username"
            placeholderTextColor={colors.text}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border 
            }]}
            value={profile.Email}
            onChangeText={(text) => setProfile({...profile, Email: text})}
            placeholder="Enter email"
            placeholderTextColor={colors.text}
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
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
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default EditProfile;