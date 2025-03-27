import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { reportService } from '../services/api';
import { lightColors, darkColors } from '../theme/colors';

const GenerateReport = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  
  const [reportData, setReportData] = useState({
    ReportTitle: '',
    ReportType: 'Asset',
    ReportContent: '',
    GeneratedBy: 1 // Replace with actual user ID from context/state
  });

  const handleSubmit = async () => {
    try {
      if (!reportData.ReportTitle.trim()) {
        Alert.alert('Error', 'Please enter a report title');
        return;
      }

      const response = await reportService.generate(reportData);
      if (response.status === 'success') {
        Alert.alert('Success', 'Report generated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to generate report');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report: ' + error.message);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Report Title</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={reportData.ReportTitle}
          onChangeText={(text) => setReportData({...reportData, ReportTitle: text})}
          placeholder="Enter report title"
          placeholderTextColor={colors.text}
        />

        <Text style={[styles.label, { color: colors.text }]}>Report Type</Text>
        <View style={[styles.pickerContainer, { 
          backgroundColor: colors.card,
          borderColor: colors.border 
        }]}>
          <Picker
            selectedValue={reportData.ReportType}
            onValueChange={(value) => setReportData({...reportData, ReportType: value})}
            style={[styles.picker, { color: colors.text }]}
          >
            <Picker.Item label="Asset Report" value="Asset" />
            <Picker.Item label="Maintenance Report" value="Maintenance" />
            <Picker.Item label="Financial Report" value="Financial" />
            <Picker.Item label="Summary Report" value="Summary" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Report Content</Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border 
          }]}
          value={reportData.ReportContent}
          onChangeText={(text) => setReportData({...reportData, ReportContent: text})}
          placeholder="Enter report content"
          placeholderTextColor={colors.text}
          multiline
          numberOfLines={6}
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Generate Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GenerateReport; 