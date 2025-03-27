import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { teamService } from '../services/TeamService';

const ApiTest = () => {
  const [teamId, setTeamId] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Running test for team ID:', teamId);
      const response = await teamService.runTest(teamId);
      console.log('Test response:', response);
      setResult(response);
    } catch (err) {
      console.error('Test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Deleting team with ID:', teamId);
      const response = await teamService.deleteTeam(teamId);
      console.log('Delete response:', response);
      setResult(response);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const simpleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Simple deleting team with ID:', teamId);
      const response = await teamService.simpleDelete(teamId);
      console.log('Simple delete response:', response);
      setResult(response);
    } catch (err) {
      console.error('Simple delete error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Test Screen</Text>
      
      <Text style={styles.label}>Team ID:</Text>
      <TextInput
        style={styles.input}
        value={teamId}
        onChangeText={setTeamId}
        keyboardType="numeric"
        placeholder="Enter team ID"
      />
      
      <View style={styles.buttonRow}>
        <Button title="Run Test" onPress={runTest} disabled={loading} />
      </View>
      
      <View style={styles.buttonRow}>
        <Button title="Delete Team" onPress={deleteTeam} disabled={loading} />
        <View style={styles.spacer} />
        <Button title="Simple Delete" onPress={simpleDelete} disabled={loading} />
      </View>
      
      {loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}
      
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result</Text>
          <Text style={styles.resultStatus}>Status: {result.status || 'N/A'}</Text>
          <Text style={styles.resultMessage}>Message: {result.message || 'N/A'}</Text>
          
          {result.received && (
            <View style={styles.resultData}>
              <Text style={styles.resultDataTitle}>Received Data:</Text>
              <Text>Method: {result.received.method}</Text>
              <Text>GET params: {JSON.stringify(result.received.get)}</Text>
              <Text>POST params: {JSON.stringify(result.received.post)}</Text>
            </View>
          )}
        </View>
      )}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spacer: {
    width: 16,
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#c62828',
  },
  resultContainer: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 16,
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 16,
    marginBottom: 16,
  },
  resultData: {
    borderTopWidth: 1,
    borderTopColor: '#2e7d32',
    paddingTop: 8,
  },
  resultDataTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default ApiTest; 