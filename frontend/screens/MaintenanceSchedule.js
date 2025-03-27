import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { schedules, assets } from '../apiService';

const MaintenanceSchedule = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [dueSchedules, setDueSchedules] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    assetId: '',
    scheduleType: 'Regular Inspections',
    frequency: 'Monthly',
    nextDueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all schedules
      const schedulesResponse = await schedules.getAll();
      setAllSchedules(schedulesResponse.data);

      // Load due schedules (next 7 days)
      const dueResponse = await schedules.getDue(7);
      setDueSchedules(dueResponse.data);

      // Load assets for dropdown
      const assetsResponse = await assets.getAll();
      setAssetsList(assetsResponse.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load schedules data');
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await schedules.create(newSchedule);
      setModalVisible(false);
      loadData();
      Alert.alert('Success', 'Maintenance schedule created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create maintenance schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await schedules.delete(scheduleId);
      loadData();
      Alert.alert('Success', 'Schedule deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete schedule');
    }
  };

  const renderScheduleItem = ({ item }) => {
    const asset = assetsList.find(a => a.AssetID === item.AssetID);
    const isDue = dueSchedules.some(s => s.ScheduleID === item.ScheduleID);

    return (
      <View style={[styles.scheduleItem, isDue && styles.dueSchedule]}>
        <View style={styles.scheduleInfo}>
          <Text style={styles.assetName}>{asset?.AssetName || 'Unknown Asset'}</Text>
          <Text style={styles.scheduleType}>{item.ScheduleType}</Text>
          <Text>Frequency: {item.Frequency}</Text>
          <Text>Next Due: {new Date(item.NextDueDate).toLocaleDateString()}</Text>
          {item.LastCompletedDate && (
            <Text>Last Completed: {new Date(item.LastCompletedDate).toLocaleDateString()}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSchedule(item.ScheduleID)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const DueMaintenanceSection = () => (
    <View style={styles.dueSection}>
      <Text style={styles.sectionTitle}>Due Maintenance (Next 7 Days)</Text>
      <FlatList
        data={dueSchedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.ScheduleID.toString()}
        style={styles.dueList}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No maintenance due in the next 7 days</Text>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <DueMaintenanceSection />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add New Schedule</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>All Maintenance Schedules</Text>
      <FlatList
        data={allSchedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.ScheduleID.toString()}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Maintenance Schedule</Text>

          {/* Add Picker/Dropdown for selecting asset */}
          <TextInput
            style={styles.input}
            placeholder="Next Due Date (YYYY-MM-DD)"
            value={newSchedule.nextDueDate}
            onChangeText={(text) => setNewSchedule({...newSchedule, nextDueDate: text})}
          />

          {/* Add Picker/Dropdown for schedule type and frequency */}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleCreateSchedule}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  dueSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dueList: {
    maxHeight: 200,
  },
  addButton: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  scheduleItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  dueSchedule: {
    borderLeftWidth: 5,
    borderLeftColor: '#ff4444',
  },
  scheduleInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scheduleType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    flex: 0.45,
  },
  cancelButton: {
    backgroundColor: '#777',
  },
  submitButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default MaintenanceSchedule;
