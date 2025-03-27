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
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import API_CONFIG from '../config/api';

const AddScheduleScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  const [formData, setFormData] = useState({
    assetId: '',
    scheduleType: '',
    frequency: '',
    nextDueDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAssets, setFetchingAssets] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setFetchingAssets(true);
      const baseUrl = API_CONFIG.PRIMARY_URL.endsWith('/') 
        ? API_CONFIG.PRIMARY_URL 
        : `${API_CONFIG.PRIMARY_URL}/`;
      const apiUrl = `${baseUrl}assets/read.php`;
      
      console.log('Fetching assets from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Assets response:', result);
      
      if (result.status === 'success') {
        setAssets(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch assets');
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      Alert.alert('Error', `Failed to load assets: ${error.message}`);
    } finally {
      setFetchingAssets(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.assetId || !formData.scheduleType || !formData.frequency || !formData.nextDueDate) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);
      
      const baseUrl = API_CONFIG.PRIMARY_URL.endsWith('/') 
        ? API_CONFIG.PRIMARY_URL 
        : `${API_CONFIG.PRIMARY_URL}/`;
      const apiUrl = `${baseUrl}schedules/create.php`;
      
      console.log('Creating schedule at:', apiUrl, 'with data:', formData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Create schedule response text:', responseText);
      
      let data;
      if (responseText.trim()) {
        data = JSON.parse(responseText);
      } else {
        throw new Error('Empty response from server');
      }
      
      console.log('Create schedule response:', data);
      
      if (data.status === 'success') {
        Alert.alert('Success', 'Maintenance schedule added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(data.message || 'Failed to add maintenance schedule');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      Alert.alert('Error', `Failed to add maintenance schedule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Select Asset *</Text>
        {fetchingAssets ? (
          <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', padding: 10 }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading assets...</Text>
          </View>
        ) : (
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
        )}

        <Text style={[styles.label, { color: colors.text }]}>Schedule Type *</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Picker
            selectedValue={formData.scheduleType}
            onValueChange={(value) => setFormData({...formData, scheduleType: value})}
            style={{ color: colors.text }}
          >
            <Picker.Item label="Select type" value="" />
            <Picker.Item label="Regular Inspection" value="Regular Inspection" />
            <Picker.Item label="Preventive Maintenance" value="Preventive Maintenance" />
            <Picker.Item label="Corrective Maintenance" value="Corrective Maintenance" />
            <Picker.Item label="Emergency Maintenance" value="Emergency Maintenance" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Frequency *</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Picker
            selectedValue={formData.frequency}
            onValueChange={(value) => setFormData({...formData, frequency: value})}
            style={{ color: colors.text }}
          >
            <Picker.Item label="Select frequency" value="" />
            <Picker.Item label="Daily" value="Daily" />
            <Picker.Item label="Weekly" value="Weekly" />
            <Picker.Item label="Bi-Weekly" value="Bi-Weekly" />
            <Picker.Item label="Monthly" value="Monthly" />
            <Picker.Item label="Quarterly" value="Quarterly" />
            <Picker.Item label="Semi-Annually" value="Semi-Annually" />
            <Picker.Item label="Annually" value="Annually" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Next Due Date *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={formData.nextDueDate}
          onChangeText={(text) => setFormData({...formData, nextDueDate: text})}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Enter description"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="save" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Add Schedule</Text>
            </>
          )}
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
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
    minHeight: 100,
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
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  }
});

export default AddScheduleScreen;