import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';

const AddRecordScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  const [formData, setFormData] = useState({
    assetId: '',
    teamId: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    maintenanceType: '',
    description: '',
    cost: '',
    maintenanceStatus: 'Pending',
    maintenanceProvider: ''
  });

  const [assets, setAssets] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchTeams();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('http://10.20.1.155/LocalGovtAssetMgt_App/backend/api/assets/read.php');
      const result = await response.json();
      if (result.status === 'success') {
        setAssets(result.data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      Alert.alert('Error', 'Failed to load assets');
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://10.20.1.155/LocalGovtAssetMgt_App/backend/api/teams/read.php');
      const result = await response.json();
      if (result.status === 'success') {
        setTeams(result.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      Alert.alert('Error', 'Failed to load teams');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.assetId || !formData.maintenanceType || !formData.description || !formData.cost) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Format the data
      const submitData = {
        ...formData,
        cost: parseFloat(formData.cost),
        maintenanceStatus: formData.maintenanceStatus || 'Pending',
        maintenanceProvider: formData.maintenanceProvider || ''
      };

      console.log('Submitting data:', submitData); // Debug log

      const response = await fetch('http://10.20.1.155/LocalGovtAssetMgt_App/backend/api/maintenance/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log('Response:', data); // Debug log
      
      if (data.status === 'success') {
        Alert.alert('Success', 'Maintenance record added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(data.message || 'Failed to add maintenance record');
      }
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      Alert.alert('Error', error.message || 'Failed to add maintenance record');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Select Asset *</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Picker
            selectedValue={formData.assetId}
            onValueChange={(value) => setFormData({...formData, assetId: value})}
            style={{ color: colors.text }}
          >
            <Picker.Item label="Select an asset" value="" />
            {assets.map((asset) => (
              <Picker.Item key={asset.AssetID} label={asset.AssetName} value={asset.AssetID} />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Select Team</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Picker
            selectedValue={formData.teamId}
            onValueChange={(value) => setFormData({...formData, teamId: value})}
            style={{ color: colors.text }}
          >
            <Picker.Item label="Select a team" value="" />
            {teams.map((team) => (
              <Picker.Item key={team.TeamID} label={team.TeamName} value={team.TeamID} />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Maintenance Date *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.maintenanceDate}
          onChangeText={(text) => setFormData({...formData, maintenanceDate: text})}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Maintenance Type *</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Picker
            selectedValue={formData.maintenanceType}
            onValueChange={(value) => setFormData({...formData, maintenanceType: value})}
            style={{ color: colors.text }}
          >
            <Picker.Item label="Select type" value="" />
            <Picker.Item label="Routine" value="Routine" />
            <Picker.Item label="Repair" value="Repair" />
            <Picker.Item label="Emergency" value="Emergency" />
            <Picker.Item label="Preventive" value="Preventive" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          multiline
          numberOfLines={4}
          placeholder="Enter maintenance description"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Cost (UGX) *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={formData.cost}
          onChangeText={(text) => setFormData({...formData, cost: text})}
          keyboardType="numeric"
          placeholder="Enter cost"
          placeholderTextColor={colors.text}
        />

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Add Maintenance Record</Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddRecordScreen; 