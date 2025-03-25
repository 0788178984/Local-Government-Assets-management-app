import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { assets } from '../apiService';

const AssetManagement = () => {
  const [assetsList, setAssetsList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAsset, setNewAsset] = useState({
    assetName: '',
    assetType: 'Building',
    location: '',
    initialCost: '',
    currentValue: '',
    maintenanceStatus: 'Good'
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const response = await assets.getAll();
      setAssetsList(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load assets');
    }
  };

  const handleCreateAsset = async () => {
    if (!newAsset.assetName || !newAsset.location || !newAsset.initialCost) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (isNaN(parseFloat(newAsset.initialCost)) || isNaN(parseFloat(newAsset.currentValue))) {
      Alert.alert('Error', 'Cost values must be numbers');
      return;
    }
    try {
      await assets.create({
        ...newAsset,
        initialCost: parseFloat(newAsset.initialCost),
        currentValue: parseFloat(newAsset.currentValue),
        acquisitionDate: new Date().toISOString().split('T')[0]
      });
      setModalVisible(false);
      loadAssets();
      Alert.alert('Success', 'Asset created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create asset');
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      await assets.delete(assetId);
      loadAssets();
      Alert.alert('Success', 'Asset deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete asset');
    }
  };

  const renderAssetItem = ({ item }) => (
    <View style={styles.assetItem}>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{item.AssetName}</Text>
        <Text>Type: {item.AssetType}</Text>
        <Text>Location: {item.Location}</Text>
        <Text>Status: {item.MaintenanceStatus}</Text>
        <Text>Value: ${item.CurrentValue}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteAsset(item.AssetID)}
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
        <Text style={styles.addButtonText}>Add New Asset</Text>
      </TouchableOpacity>

      <FlatList
        data={assetsList}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.AssetID.toString()}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add New Asset</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Asset Name"
            value={newAsset.assetName}
            onChangeText={(text) => setNewAsset({...newAsset, assetName: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newAsset.location}
            onChangeText={(text) => setNewAsset({...newAsset, location: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Initial Cost"
            value={newAsset.initialCost}
            onChangeText={(text) => setNewAsset({...newAsset, initialCost: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Current Value"
            value={newAsset.currentValue}
            onChangeText={(text) => setNewAsset({...newAsset, currentValue: text})}
            keyboardType="numeric"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleCreateAsset}
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
    backgroundColor: '#4CAF50',
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
  assetItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AssetManagement;
