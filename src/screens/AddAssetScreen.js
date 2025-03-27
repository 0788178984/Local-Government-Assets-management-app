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
import { Picker } from '@react-native-picker/picker';
import { assetService } from '../services/api';

export default function AddAssetScreen({ navigation }) {
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [location, setLocation] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [initialCost, setInitialCost] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [maintenanceStatus, setMaintenanceStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const handleSubmit = async () => {
    if (!assetName || !assetType || !location || !acquisitionDate || !initialCost || !currentValue || !maintenanceStatus) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await assetService.create({
        AssetName: assetName,
        AssetType: assetType,
        Location: location,
        AcquisitionDate: acquisitionDate,
        InitialCost: parseFloat(initialCost),
        CurrentValue: parseFloat(currentValue),
        MaintenanceStatus: maintenanceStatus
      });

      if (response.status === 'success') {
        Alert.alert(
          'Success',
          'Asset created successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create asset');
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      Alert.alert('Error', 'Failed to create asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Asset Name</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={assetName}
          onChangeText={setAssetName}
          placeholder="Enter asset name"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Asset Type</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.inputBackground }]}>
          <Picker
            selectedValue={assetType}
            onValueChange={setAssetType}
          >
            <Picker.Item label="Select type..." value="" />
            <Picker.Item label="Equipment" value="Equipment" />
            <Picker.Item label="Road" value="Road" />
            <Picker.Item label="Bridge" value="Bridge" />
            <Picker.Item label="Building" value="Building" />
            <Picker.Item label="Utility" value="Utility" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Location</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Acquisition Date</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={acquisitionDate}
          onChangeText={setAcquisitionDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Initial Cost</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={initialCost}
          onChangeText={setInitialCost}
          placeholder="Enter cost"
          placeholderTextColor={colors.text}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Current Value</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={currentValue}
          onChangeText={setCurrentValue}
          placeholder="Enter current value"
          placeholderTextColor={colors.text}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: colors.text }]}>Maintenance Status</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.inputBackground }]}>
          <Picker
            selectedValue={maintenanceStatus}
            onValueChange={setMaintenanceStatus}
          >
            <Picker.Item label="Select status..." value="" />
            <Picker.Item label="Good" value="Good" />
            <Picker.Item label="Fair" value="Fair" />
            <Picker.Item label="Poor" value="Poor" />
          </Picker>
        </View>

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
            {isSubmitting ? 'Creating Asset...' : 'Create Asset'}
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    borderColor: '#e0e0e0',
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
    opacity: 0.7,
  },
}); 