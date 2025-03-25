import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import MaintenanceService from '../services/maintenance';
import { lightColors, darkColors } from '../theme/colors';

const MaintenanceRecordsScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
  });

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const loadRecords = async () => {
    try {
      const response = await MaintenanceService.getMaintenanceRecords();
      console.log('Maintenance records response:', response);
      
      if (response?.data?.data) {
        // Ensure we're working with an array and each item has a unique key
        const recordsArray = Array.isArray(response.data.data) ? response.data.data : [];
        const recordsWithKeys = recordsArray.map((record, index) => ({
          ...record,
          key: `${record?.MaintenanceID || record?.id || index}`,
        }));
        setRecords(recordsWithKeys);
        
        // Update counts if available
        if (response.data.counts) {
          setCounts(response.data.counts);
        }
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Failed to load maintenance records:', error);
      setRecords([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const renderItem = ({ item }) => {
    if (!item) return null;

    // Safely access properties with fallbacks
    const assetName = item?.AssetName || item?.assetName || 'Unknown Asset';
    const maintenanceDate = formatDate(item?.MaintenanceDate || item?.maintenanceDate);
    const maintenanceType = item?.MaintenanceType || item?.maintenanceType || 'Not specified';
    const maintenanceStatus = item?.MaintenanceStatus || item?.maintenanceStatus || 'Unknown';
    const teamName = item?.TeamName || item?.teamName || 'No team assigned';
    const cost = item?.Cost || item?.cost ? 
      `$${parseFloat(item?.Cost || item?.cost).toFixed(2)}` : '$0.00';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('MaintenanceDetails', { record: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.assetName, { color: colors.text }]}>{assetName}</Text>
          <Text style={[styles.date, { color: colors.text }]}>{maintenanceDate}</Text>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={[styles.type, { color: colors.text }]}>Type: {maintenanceType}</Text>
          <Text style={[styles.team, { color: colors.text }]}>Team: {teamName}</Text>
          <Text style={[styles.status, { color: colors.text }]}>Status: {maintenanceStatus}</Text>
          <Text style={[styles.cost, { color: colors.text }]}>Cost: {cost}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: colors.text }]}>
          Total: {counts.total} | Pending: {counts.pending} | In Progress: {counts.in_progress} | Completed: {counts.completed}
        </Text>
      </View>

      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={item => item?.key || String(Math.random())}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No maintenance records found
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddMaintenance')}
      >
        <Text style={styles.addButtonText}>+ Add Maintenance</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  statsText: {
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  date: {
    fontSize: 14,
  },
  cardBody: {
    gap: 5,
  },
  type: {
    fontSize: 14,
  },
  team: {
    fontSize: 14,
  },
  status: {
    fontSize: 14,
  },
  cost: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MaintenanceRecordsScreen; 