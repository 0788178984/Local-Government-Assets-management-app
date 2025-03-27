import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import { reportService } from '../services/api';

const AddReport = ({ navigation }) => {
  const [assetName, setAssetName] = useState('');
  const [description, setDescription] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [cost, setCost] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const handleSubmit = async () => {
    if (!assetName || !description || !maintenanceType || !cost) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const reportData = {
        assetName,
        description,
        maintenanceType,
        cost: parseFloat(cost),
        status: 'Pending',
        maintenanceDate: new Date().toISOString().split('T')[0]
      };

      const response = await reportService.create(reportData);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Report created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to create report');
      }
    } catch (error) {
      console.error('Create report error:', error);
      Alert.alert('Error', 'Failed to create report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Asset Name</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={assetName}
          onChangeText={setAssetName}
          placeholder="Enter asset name"
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

        <Text style={[styles.label, { color: colors.text }]}>Maintenance Type</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={maintenanceType}
          onChangeText={setMaintenanceType}
          placeholder="Enter maintenance type"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={[styles.label, { color: colors.text }]}>Cost</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={cost}
          onChangeText={setCost}
          placeholder="Enter cost"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : 'Create Report'}
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

export default AddReport;
