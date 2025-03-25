import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { reportService } from '../services/api';
import { lightColors, darkColors } from '../theme/colors';

const ViewReport = ({ route, navigation }) => {
  const reportId = route.params?.reportId;
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  const [report, setReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReport, setEditedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!reportId) {
      Alert.alert('Error', 'No report ID provided');
      navigation.goBack();
      return;
    }
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching report with ID:', reportId);
      
      const response = await reportService.getById(reportId);
      console.log('Report response:', response);
      
      if (response.status === 'success' && response.data) {
        setReport(response.data);
        setEditedReport(response.data);
      } else {
        throw new Error(response.message || 'Failed to load report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      Alert.alert('Error', 'Failed to load report: ' + error.message);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await reportService.update(reportId, editedReport);
      if (response.status === 'success') {
        Alert.alert('Success', 'Report updated successfully');
        setReport(editedReport);
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update report');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update report: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {report.ReportTitle}
        </Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Icon 
            name={isEditing ? "close" : "edit"} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Report Type</Text>
        <Text style={[styles.text, { color: colors.text }]}>{report.ReportType}</Text>

        <Text style={[styles.label, { color: colors.text }]}>Generated Date</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          {new Date(report.GeneratedDate).toLocaleDateString()}
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Content</Text>
        {isEditing ? (
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border 
            }]}
            value={editedReport.ReportContent}
            onChangeText={(text) => setEditedReport({
              ...editedReport,
              ReportContent: text
            })}
            multiline
            numberOfLines={10}
          />
        ) : (
          <Text style={[styles.content, { color: colors.text }]}>
            {report.ReportContent}
          </Text>
        )}
      </View>

      {isEditing && (
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  infoContainer: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  text: {
    fontSize: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
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
  },
});

export default ViewReport; 