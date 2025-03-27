import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { format } from 'date-fns';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import { maintenanceService } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MaintenanceDetails = ({ route, navigation }) => {
  const { record } = route.params;
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState({...record});
  const [isSaving, setIsSaving] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    // Log the record data for debugging
    console.log('MaintenanceDetails - Received record:', record);
  }, [record]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatCost = (cost) => {
    if (!cost) return '$0.00';
    try {
      return `$${parseFloat(cost).toFixed(2)}`;
    } catch (error) {
      console.error('Error formatting cost:', error);
      return cost;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#999';
    
    switch(status.toLowerCase().trim()) {
      case 'completed':
        return '#4CAF50';
      case 'in progress':
        return '#2196F3';
      case 'pending':
        return '#FFA000';
      default:
        return '#999';
    }
  };

  const handleInputChange = (field, value) => {
    setEditedRecord({
      ...editedRecord,
      [field]: value
    });
  };

  // Simple date validation function
  const validateDate = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate the data
      if (!editedRecord.MaintenanceType || !editedRecord.MaintenanceDate) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        setIsSaving(false);
        return;
      }
      
      // Validate date format
      if (!validateDate(editedRecord.MaintenanceDate)) {
        Alert.alert('Validation Error', 'Please enter date in YYYY-MM-DD format');
        setIsSaving(false);
        return;
      }
      
      // Format the cost as a number
      let updatedRecord = {...editedRecord};
      if (updatedRecord.Cost) {
        updatedRecord.Cost = parseFloat(updatedRecord.Cost.toString().replace(/[^0-9.]/g, '')).toString();
      }
      
      console.log('Saving maintenance record:', updatedRecord);
      
      const response = await maintenanceService.update(record.MaintenanceID, updatedRecord);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Maintenance record updated successfully');
        setIsEditing(false);
        navigation.goBack(); // Return to the previous screen to see the updated list
      } else {
        Alert.alert('Error', response.message || 'Failed to update maintenance record');
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      Alert.alert('Error', 'An unexpected error occurred while updating the record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset the form
    setEditedRecord({...record});
    setIsEditing(false);
  };

  const renderStatusModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showStatusModal}
      onRequestClose={() => setShowStatusModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Status</Text>
          
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={() => {
              handleInputChange('MaintenanceStatus', 'Pending');
              setShowStatusModal(false);
            }}
          >
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor('Pending') }]} />
            <Text style={[styles.modalOptionText, { color: colors.text }]}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={() => {
              handleInputChange('MaintenanceStatus', 'In Progress');
              setShowStatusModal(false);
            }}
          >
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor('In Progress') }]} />
            <Text style={[styles.modalOptionText, { color: colors.text }]}>In Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={() => {
              handleInputChange('MaintenanceStatus', 'Completed');
              setShowStatusModal(false);
            }}
          >
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor('Completed') }]} />
            <Text style={[styles.modalOptionText, { color: colors.text }]}>Completed</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.secondary, alignSelf: 'center', marginTop: 15 }]}
            onPress={() => setShowStatusModal(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderReadOnlyView = () => (
    <>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Asset Information</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Asset Name:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.AssetName || 'Not specified'}</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Location:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.Location || record.AssetLocation || 'Not specified'}</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Asset Condition:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.AssetCondition || 'Not specified'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Maintenance Information</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Type:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.MaintenanceType || 'Not specified'}</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Date:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{formatDate(record.MaintenanceDate)}</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Status:</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(record.MaintenanceStatus) }]} />
          <Text style={[styles.value, { color: colors.text }]}>{record.MaintenanceStatus || 'Not specified'}</Text>
        </View>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Provider:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.MaintenanceProvider || 'Not specified'}</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Cost:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{formatCost(record.Cost)}</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Description:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.Description || 'No description provided'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Team Information</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Team:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.TeamName || 'No team assigned'}</Text>
      </View>
    </>
  );

  const renderEditView = () => (
    <>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Asset Information</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Asset Name:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.AssetName || 'Not specified'}</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Location:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.Location || record.AssetLocation || 'Not specified'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Maintenance Information</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Type:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
          value={editedRecord.MaintenanceType}
          onChangeText={(text) => handleInputChange('MaintenanceType', text)}
          placeholder="Enter maintenance type"
          placeholderTextColor={colors.textSecondary}
        />
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Date (YYYY-MM-DD):</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
          value={editedRecord.MaintenanceDate}
          onChangeText={(text) => handleInputChange('MaintenanceDate', text)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: -10, marginBottom: 10 }}>
          Format: YYYY-MM-DD (e.g., 2025-03-26)
        </Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Status:</Text>
        <TouchableOpacity 
          style={[styles.input, { backgroundColor: colors.inputBackground }]}
          onPress={() => setShowStatusModal(true)}
        >
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(editedRecord.MaintenanceStatus) }]} />
            <Text style={{ color: colors.text }}>{editedRecord.MaintenanceStatus || 'Select status'}</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Provider:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
          value={editedRecord.MaintenanceProvider}
          onChangeText={(text) => handleInputChange('MaintenanceProvider', text)}
          placeholder="Enter provider"
          placeholderTextColor={colors.textSecondary}
        />
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Cost:</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
          value={editedRecord.Cost ? editedRecord.Cost.toString().replace(/^\$/, '') : ''}
          onChangeText={(text) => handleInputChange('Cost', text)}
          placeholder="Enter cost"
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textSecondary}
        />
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>Description:</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.inputBackground, color: colors.text }]}
          value={editedRecord.Description}
          onChangeText={(text) => handleInputChange('Description', text)}
          placeholder="Enter description"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Team Information</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Team:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{record.TeamName || 'No team assigned'}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 5 }}>
          Team assignment cannot be changed here
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Maintenance Details</Text>
            
            {isEditing ? renderEditView() : renderReadOnlyView()}
          </View>
          
          <View style={styles.actions}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.secondary }]}
                  onPress={handleCancel}
                  disabled={isSaving}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.success }]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.secondary }]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.editButton, { backgroundColor: colors.primary }]}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      
      {renderStatusModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
  },
  button: {
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#1a73e8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 100,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
  }
});

export default MaintenanceDetails;
