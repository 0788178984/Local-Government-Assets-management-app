import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import {
  assetService,
  teamService,
  maintenanceService,
  scheduleService
} from '../services/api';

const TestOperations = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  // Test Assets CRUD
  const testAssets = async () => {
    try {
      setLoading(true);
      console.log('Testing Assets CRUD...');
      
      // Create
      const newAsset = {
        name: 'Test Asset',
        description: 'Test Description',
        value: 1000,
        location: 'Test Location',
        status: 'Active'
      };
      const createResult = await assetService.create(newAsset);
      console.log('Create Asset Result:', createResult);
      
      // Read All
      const readAllResult = await assetService.getAll();
      console.log('Read All Assets Result:', readAllResult);
      
      // Read One
      if (createResult.data && createResult.data.id) {
        const readOneResult = await assetService.getById(createResult.data.id);
        console.log('Read One Asset Result:', readOneResult);
      }
      
      // Update
      if (createResult.data && createResult.data.id) {
        const updateResult = await assetService.update(createResult.data.id, {
          ...newAsset,
          name: 'Updated Test Asset'
        });
        console.log('Update Asset Result:', updateResult);
      }
      
      // Delete
      if (createResult.data && createResult.data.id) {
        const deleteResult = await assetService.delete(createResult.data.id);
        console.log('Delete Asset Result:', deleteResult);
      }
      
      setResults(prev => ({
        ...prev,
        assets: {
          create: createResult,
          readAll: readAllResult,
          update: updateResult,
          delete: deleteResult
        }
      }));
      
    } catch (error) {
      console.error('Assets Test Error:', error);
      Alert.alert('Error', 'Assets test failed: ' + error.message);
    }
  };

  // Test Teams CRUD
  const testTeams = async () => {
    try {
      setLoading(true);
      console.log('Testing Teams CRUD...');
      
      // Create
      const newTeam = {
        name: 'Test Team',
        leader: 'Test Leader',
        contact: '1234567890',
        specialization: 'Test Specialization',
        status: 'Active'
      };
      const createResult = await teamService.create(newTeam);
      console.log('Create Team Result:', createResult);
      
      // Read All
      const readAllResult = await teamService.getAll();
      console.log('Read All Teams Result:', readAllResult);
      
      // Read One
      if (createResult.data && createResult.data.id) {
        const readOneResult = await teamService.getById(createResult.data.id);
        console.log('Read One Team Result:', readOneResult);
      }
      
      // Update
      if (createResult.data && createResult.data.id) {
        const updateResult = await teamService.update(createResult.data.id, {
          ...newTeam,
          name: 'Updated Test Team'
        });
        console.log('Update Team Result:', updateResult);
      }
      
      // Delete
      if (createResult.data && createResult.data.id) {
        const deleteResult = await teamService.deleteTeam(createResult.data.id);
        console.log('Delete Team Result:', deleteResult);
      }
      
      setResults(prev => ({
        ...prev,
        teams: {
          create: createResult,
          readAll: readAllResult,
          update: updateResult,
          delete: deleteResult
        }
      }));
      
    } catch (error) {
      console.error('Teams Test Error:', error);
      Alert.alert('Error', 'Teams test failed: ' + error.message);
    }
  };

  // Test Maintenance Records CRUD
  const testMaintenance = async () => {
    try {
      setLoading(true);
      console.log('Testing Maintenance CRUD...');
      
      // Create
      const newRecord = {
        asset_id: 1, // Assuming asset exists
        team_id: 1, // Assuming team exists
        maintenance_date: new Date().toISOString().split('T')[0],
        description: 'Test Maintenance',
        cost: 500,
        status: 'Completed'
      };
      const createResult = await maintenanceService.create(newRecord);
      console.log('Create Maintenance Result:', createResult);
      
      // Read All
      const readAllResult = await maintenanceService.getAll();
      console.log('Read All Maintenance Result:', readAllResult);
      
      // Update
      if (createResult.data && createResult.data.id) {
        const updateResult = await maintenanceService.update(createResult.data.id, {
          ...newRecord,
          description: 'Updated Test Maintenance'
        });
        console.log('Update Maintenance Result:', updateResult);
      }
      
      // Delete
      if (createResult.data && createResult.data.id) {
        const deleteResult = await maintenanceService.delete(createResult.data.id);
        console.log('Delete Maintenance Result:', deleteResult);
      }
      
      setResults(prev => ({
        ...prev,
        maintenance: {
          create: createResult,
          readAll: readAllResult,
          update: updateResult,
          delete: deleteResult
        }
      }));
      
    } catch (error) {
      console.error('Maintenance Test Error:', error);
      Alert.alert('Error', 'Maintenance test failed: ' + error.message);
    }
  };

  // Test Schedules CRUD
  const testSchedules = async () => {
    try {
      setLoading(true);
      console.log('Testing Schedules CRUD...');
      
      // Create
      const newSchedule = {
        asset_id: 1, // Assuming asset exists
        team_id: 1, // Assuming team exists
        schedule_date: new Date().toISOString().split('T')[0],
        priority: 'High',
        maintenance_type: 'Routine',
        status: 'Pending'
      };
      const createResult = await scheduleService.create(newSchedule);
      console.log('Create Schedule Result:', createResult);
      
      // Read All
      const readAllResult = await scheduleService.getAll();
      console.log('Read All Schedules Result:', readAllResult);
      
      // Update
      if (createResult.data && createResult.data.id) {
        const updateResult = await scheduleService.update(createResult.data.id, {
          ...newSchedule,
          priority: 'Medium'
        });
        console.log('Update Schedule Result:', updateResult);
      }
      
      // Delete
      if (createResult.data && createResult.data.id) {
        const deleteResult = await scheduleService.delete(createResult.data.id);
        console.log('Delete Schedule Result:', deleteResult);
      }
      
      setResults(prev => ({
        ...prev,
        schedules: {
          create: createResult,
          readAll: readAllResult,
          update: updateResult,
          delete: deleteResult
        }
      }));
      
    } catch (error) {
      console.error('Schedules Test Error:', error);
      Alert.alert('Error', 'Schedules test failed: ' + error.message);
    }
  };

  const renderResults = (category, data) => {
    if (!data) return null;
    return (
      <View style={styles.resultSection}>
        <Text style={styles.categoryTitle}>{category} Results:</Text>
        {Object.entries(data).map(([operation, result]) => (
          <View key={operation} style={styles.operationResult}>
            <Text style={styles.operationTitle}>{operation}:</Text>
            <Text style={styles.resultText}>
              Status: {result?.status || 'N/A'}
            </Text>
            <Text style={styles.resultText}>
              Message: {result?.message || 'No message'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>CRUD Operations Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testAssets}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Assets CRUD</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testTeams}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Teams CRUD</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testMaintenance}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Maintenance CRUD</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testSchedules}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Schedules CRUD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {renderResults('Assets', results.assets)}
        {renderResults('Teams', results.teams)}
        {renderResults('Maintenance', results.maintenance)}
        {renderResults('Schedules', results.schedules)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976D2',
  },
  operationResult: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  operationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
});

export default TestOperations; 