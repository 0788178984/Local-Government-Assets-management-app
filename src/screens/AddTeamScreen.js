import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import { teamService } from '../services/api';

export default function AddTeamScreen({ navigation }) {
  const [teamName, setTeamName] = useState('');
  const [teamLeader, setTeamLeader] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission

    if (!teamName || !teamLeader || !contactPhone || !contactEmail) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await teamService.create({
        teamName,
        teamLeader,
        contactPhone,
        contactEmail
      });

      if (response.status === 'success') {
        Alert.alert(
          'Success',
          'Team created successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert(
        'Error',
        'Failed to create team. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Team Name</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={teamName}
          onChangeText={setTeamName}
          placeholder="Enter team name"
          placeholderTextColor={colors.text}
          editable={!isSubmitting}
        />

        <Text style={[styles.label, { color: colors.text }]}>Team Leader</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={teamLeader}
          onChangeText={setTeamLeader}
          placeholder="Enter team leader name"
          placeholderTextColor={colors.text}
          editable={!isSubmitting}
        />

        <Text style={[styles.label, { color: colors.text }]}>Contact Phone</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="Enter contact phone"
          placeholderTextColor={colors.text}
          keyboardType="phone-pad"
          editable={!isSubmitting}
        />

        <Text style={[styles.label, { color: colors.text }]}>Contact Email</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="Enter contact email"
          placeholderTextColor={colors.text}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSubmitting}
        />

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { backgroundColor: colors.primary },
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating Team...' : 'Create Team'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
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
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.7
  }
}); 