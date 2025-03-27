import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { maintenance, teams } from '../apiService';

const MaintenanceManagement = ({ route }) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [maintenanceTeams, setMaintenanceTeams] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    assetId: route?.params?.assetId || null,
    teamId: '',
    maintenanceType: 'Routine',
    description: '',
    cost: '',
    maintenanceStatus: 'Pending',
    maintenanceProvider: 'In-House'
  });

  useEffect(() => {
    loadData();
  }, [route?.params?.assetId]);

  const loadData = async () => {
    try {
      // Load maintenance records for specific asset if assetId is provided
      if (route?.params?.assetId) {
        const records = await maintenance.getByAsset(route.params.assetId);
        setMaintenanceRecords(records.data);
      } else {
        const records = await maintenance.getAll();
        setMaintenanceRecords(records.data);
      }

      // Load maintenance teams
      const teamsResponse = await teams.getAll();
      setMaintenanceTeams(teamsResponse.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load maintenance data');
    }
  };

  const handleCreateMaintenance = async () => {
    try {
      await maintenance.create({
        ...newMaintenance,
        cost: parseFloat(newMaintenance.cost),
        maintenanceDate: new Date().toISOString().split('T')[0]
      });
      setModalVisible(false);
      loadData();
      Alert.alert('Success', 'Maintenance record created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create maintenance record');
    }
  };

  const handleDeleteMaintenance = async (maintenanceId) => {
    try {
      await maintenance.delete(maintenanceId);
      loadData();
      Alert.alert('Success', 'Maintenance record deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete maintenance record');
    }
  };

  const renderMaintenanceItem = ({ item }) => (
    <View style={styles.maintenanceItem}>
      <View style={styles.maintenanceInfo}>
        <Text style={styles.maintenanceType}>{item.MaintenanceType}</Text>
        <Text>Status: {item.MaintenanceStatus}</Text>
        <Text>Provider: {item.MaintenanceProvider}</Text>
        <Text>Cost: ${item.Cost}</Text>
        <Text>Date: {new Date(item.MaintenanceDate).toLocaleDateString()}</Text>
        <Text style={styles.description}>{item.Description}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteMaintenance(item.MaintenanceID)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add New Maintenance Record</Text>
      </TouchableOpacity>

      <FlatList
        data={maintenanceRecords}
        renderItem={renderMaintenanceItem}
        keyExtractor={(item) => item.MaintenanceID.toString()}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Maintenance Record</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newMaintenance.description}
            onChangeText={(text) => setNewMaintenance({...newMaintenance, description: text})}
            multiline
          />
          
          <TextInput
            style={styles.input}
            placeholder="Cost"
            value={newMaintenance.cost}
            onChangeText={(text) => setNewMaintenance({...newMaintenance, cost: text})}
            keyboardType="numeric"
          />

          {/* Add dropdown/picker for teams, maintenance type, status, and provider */}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleCreateMaintenance}
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
  addButton: {
    backgroundColor: '#2196F3',
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
  maintenanceItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontStyle: 'italic',
    marginTop: 5,
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
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MaintenanceManagement;
