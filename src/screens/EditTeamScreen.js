import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import API_CONFIG from '../config/api';

const EditTeamScreen = ({ route, navigation }) => {
  const { team } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  
  const [teamName, setTeamName] = useState(team.TeamName);
  const [teamLeader, setTeamLeader] = useState(team.TeamLeader);
  const [contactPhone, setContactPhone] = useState(team.ContactPhone);
  const [contactEmail, setContactEmail] = useState(team.ContactEmail);
  const [isActive, setIsActive] = useState(team.IsActive === '1' || team.IsActive === true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!teamName.trim()) {
      newErrors.teamName = 'Team name is required';
      isValid = false;
    }

    if (!teamLeader.trim()) {
      newErrors.teamLeader = 'Team leader is required';
      isValid = false;
    }

    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
      isValid = false;
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid phone number';
      isValid = false;
    }

    if (!contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const baseUrl = API_CONFIG.PRIMARY_URL.endsWith('/') 
        ? API_CONFIG.PRIMARY_URL 
        : `${API_CONFIG.PRIMARY_URL}/`;
      const apiUrl = `${baseUrl}teams/update.php`;
      
      console.log('Updating team at:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          TeamID: team.TeamID,
          TeamName: teamName,
          TeamLeader: teamLeader,
          ContactPhone: contactPhone,
          ContactEmail: contactEmail,
          IsActive: isActive ? 1 : 0
        }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Update response text:', responseText);
      
      let result;
      if (responseText.trim()) {
        result = JSON.parse(responseText);
      } else {
        throw new Error('Empty response from server');
      }

      console.log('Update team response:', result);

      if (result.status === 'success') {
        Alert.alert('Success', 'Team updated successfully', [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Teams', { refresh: true }) 
          }
        ]);
      } else {
        throw new Error(result.message || 'Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      Alert.alert('Error', `Failed to update team: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text }]}>Edit Team</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Team Name</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
              errors.teamName && styles.inputError
            ]}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
            placeholderTextColor={colors.placeholder}
          />
          {errors.teamName && <Text style={styles.errorText}>{errors.teamName}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Team Leader</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
              errors.teamLeader && styles.inputError
            ]}
            value={teamLeader}
            onChangeText={setTeamLeader}
            placeholder="Enter team leader name"
            placeholderTextColor={colors.placeholder}
          />
          {errors.teamLeader && <Text style={styles.errorText}>{errors.teamLeader}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Contact Phone</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
              errors.contactPhone && styles.inputError
            ]}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="Enter contact phone"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
          />
          {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Contact Email</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
              errors.contactEmail && styles.inputError
            ]}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="Enter contact email"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.contactEmail && <Text style={styles.errorText}>{errors.contactEmail}</Text>}
        </View>

        <View style={styles.switchContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Active Status</Text>
          <Switch
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={isActive ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setIsActive}
            value={isActive}
          />
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="save" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Update Team</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, marginTop: 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color={colors.text} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default EditTeamScreen;
