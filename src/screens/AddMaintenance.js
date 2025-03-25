import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { maintenanceService } from '../services/api';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';

const AddMaintenance = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const handleSubmit = async () => {
    if (!title || !description || !assetId || !teamId || !scheduledDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const maintenanceData = {
        title,
        description,
        asset_id: assetId,
        team_id: teamId,
        scheduled_date: scheduledDate,
        status: 'Pending'
      };

      const response = await maintenanceService.create(maintenanceData);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Maintenance record created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to create maintenance record');
      }
    } catch (error) {
      console.error('Create maintenance error:', error);
      Alert.alert('Error', 'Failed to create maintenance record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Title</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter maintenance title"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter maintenance description"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={4}
        />

        <Text style={[styles.label, { color: colors.text }]}>Asset ID</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={assetId}
          onChangeText={setAssetId}
          placeholder="Enter asset ID"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Team ID</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={teamId}
          onChangeText={setTeamId}
          placeholder="Enter team ID"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Scheduled Date</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={scheduledDate}
          onChangeText={setScheduledDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.placeholder}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : 'Create Maintenance Record'}
          </Text>
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
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddMaintenance;
