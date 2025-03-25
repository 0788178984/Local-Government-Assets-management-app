import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import API_CONFIG from '../config/api';

const TeamsScreen = ({ navigation }) => {
  const [teams, setTeams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  const fetchTeams = async () => {
    try {
      setRefreshing(true);
      
      // Use consistent API URL format
      const baseUrl = API_CONFIG.PRIMARY_URL.endsWith('/') 
        ? API_CONFIG.PRIMARY_URL 
        : `${API_CONFIG.PRIMARY_URL}/`;
      const apiUrl = `${baseUrl}teams/read.php`;
      console.log('Fetching teams from:', apiUrl);
      
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
      console.log('Teams response:', result);
      
      if (result.status === 'success') {
        setTeams(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      Alert.alert('Error', `Failed to load teams: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDelete = async (teamId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const baseUrl = API_CONFIG.PRIMARY_URL.endsWith('/') 
                ? API_CONFIG.PRIMARY_URL 
                : `${API_CONFIG.PRIMARY_URL}/`;
              const apiUrl = `${baseUrl}teams/delete.php`;
              console.log('Deleting team from:', apiUrl, 'TeamID:', teamId);
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ TeamID: teamId }),
              });
              
              if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
              }
              
              // Check if response has content
              const responseText = await response.text();
              console.log('Delete response text:', responseText);
              
              let result;
              if (responseText.trim()) {
                result = JSON.parse(responseText);
              } else {
                throw new Error('Empty response from server');
              }
              
              console.log('Delete team response:', result);
              
              if (result.status === 'success') {
                Alert.alert('Success', 'Team deleted successfully');
                fetchTeams(); // Refresh the list
              } else {
                throw new Error(result.message || 'Failed to delete team');
              }
            } catch (error) {
              console.error('Error deleting team:', error);
              Alert.alert('Error', `Failed to delete team: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.teamName, { color: colors.text }]}>{item.TeamName}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: item.IsActive === '1' ? '#4CAF50' : '#F44336' },
            ]}
          />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {item.IsActive === '1' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Icon name="person" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{item.TeamLeader}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{item.ContactPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="email" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{item.ContactEmail}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('EditTeam', { team: item })}
        >
          <Icon name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={() => handleDelete(item.TeamID)}
        >
          <Icon name="delete" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddTeam')}
      >
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Team</Text>
      </TouchableOpacity>

      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(item) => item.TeamID.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTeams} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No teams found. Add a new team to get started.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
  },
  cardContent: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 24,
  },
});

export default TeamsScreen;