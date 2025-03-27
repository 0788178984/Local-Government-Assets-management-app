import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import API_CONFIG from '../config/api';

const EditAssetScreen = ({ route, navigation }) => {
  const { asset } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  const [formData, setFormData] = useState({
    assetId: asset.AssetID,
    assetName: asset.AssetName || '',
    assetType: asset.AssetType || '',
    location: asset.Location || '',
    acquisitionDate: asset.AcquisitionDate || formatDate(new Date()),
    initialCost: asset.InitialCost ? asset.InitialCost.toString() : '',
    currentValue: asset.CurrentValue ? asset.CurrentValue.toString() : '',
    maintenanceStatus: asset.MaintenanceStatus || 'Good'
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const assetTypes = [
    'Road', 'Bridge', 'Building', 'Vehicle', 'Equipment', 
    'IT Equipment', 'Furniture', 'Utility', 'Park', 'Other'
  ];

  const maintenanceStatuses = ['Good', 'Fair', 'Poor', 'Critical', 'Out of Service'];

  // Helper function to format date as YYYY-MM-DD
  function formatDate(date) {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  const validate = () => {
    const errors = {};
    
    if (!formData.assetName.trim()) {
      errors.assetName = 'Asset name is required';
    }
    
    if (!formData.assetType) {
      errors.assetType = 'Asset type is required';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (formData.initialCost && isNaN(parseFloat(formData.initialCost))) {
      errors.initialCost = 'Initial cost must be a valid number';
    }
    
    if (formData.currentValue && isNaN(parseFloat(formData.currentValue))) {
      errors.currentValue = 'Current value must be a valid number';
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.acquisitionDate)) {
      errors.acquisitionDate = 'Date must be in YYYY-MM-DD format';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const baseUrl = API_CONFIG.PRIMARY_URL.endsWith('/') 
        ? API_CONFIG.PRIMARY_URL 
        : `${API_CONFIG.PRIMARY_URL}/`;
      const apiUrl = `${baseUrl}assets/update.php`;
      
      console.log('Updating asset at:', apiUrl);
      
      const submitData = {
        AssetID: formData.assetId,
        AssetName: formData.assetName,
        AssetType: formData.assetType,
        Location: formData.location,
        AcquisitionDate: formData.acquisitionDate,
        InitialCost: parseFloat(formData.initialCost),
        CurrentValue: parseFloat(formData.currentValue),
        MaintenanceStatus: formData.maintenanceStatus
      };
      
      console.log('Submitting update data:', submitData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      const result = await response.json();
      console.log('Update response:', result);
      
      if (result.status === 'success') {
        Alert.alert(
          'Success',
          'Asset has been updated successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to update asset');
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      Alert.alert('Error', 'An error occurred while updating the asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Edit Asset</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Asset Name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: validationErrors.assetName ? colors.error : colors.border }
            ]}
            value={formData.assetName}
            onChangeText={(text) => setFormData({ ...formData, assetName: text })}
            placeholder="Enter asset name"
            placeholderTextColor={colors.placeholder}
          />
          {validationErrors.assetName && (
            <Text style={[styles.errorText, { color: colors.error }]}>{validationErrors.assetName}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Asset Type</Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: validationErrors.assetType ? colors.error : colors.border }]}>
            <Picker
              selectedValue={formData.assetType}
              onValueChange={(itemValue) => setFormData({ ...formData, assetType: itemValue })}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.text}
            >
              <Picker.Item label="Select asset type" value="" />
              {assetTypes.map((type, index) => (
                <Picker.Item key={index} label={type} value={type} />
              ))}
            </Picker>
          </View>
          {validationErrors.assetType && (
            <Text style={[styles.errorText, { color: colors.error }]}>{validationErrors.assetType}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Location</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: validationErrors.location ? colors.error : colors.border }
            ]}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="Enter location"
            placeholderTextColor={colors.placeholder}
          />
          {validationErrors.location && (
            <Text style={[styles.errorText, { color: colors.error }]}>{validationErrors.location}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Acquisition Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: validationErrors.acquisitionDate ? colors.error : colors.border }
            ]}
            value={formData.acquisitionDate}
            onChangeText={(text) => setFormData({ ...formData, acquisitionDate: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.placeholder}
          />
          {validationErrors.acquisitionDate && (
            <Text style={[styles.errorText, { color: colors.error }]}>{validationErrors.acquisitionDate}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Initial Cost</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: validationErrors.initialCost ? colors.error : colors.border }
            ]}
            value={formData.initialCost}
            onChangeText={(text) => setFormData({ ...formData, initialCost: text })}
            placeholder="Enter initial cost"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
          />
          {validationErrors.initialCost && (
            <Text style={[styles.errorText, { color: colors.error }]}>{validationErrors.initialCost}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Current Value</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: validationErrors.currentValue ? colors.error : colors.border }
            ]}
            value={formData.currentValue}
            onChangeText={(text) => setFormData({ ...formData, currentValue: text })}
            placeholder="Enter current value"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
          />
          {validationErrors.currentValue && (
            <Text style={[styles.errorText, { color: colors.error }]}>{validationErrors.currentValue}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Maintenance Status</Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Picker
              selectedValue={formData.maintenanceStatus}
              onValueChange={(itemValue) => setFormData({ ...formData, maintenanceStatus: itemValue })}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.text}
            >
              {maintenanceStatuses.map((status, index) => (
                <Picker.Item key={index} label={status} value={status} />
              ))}
            </Picker>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.submitButtonText}>Update Asset</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default EditAssetScreen;
