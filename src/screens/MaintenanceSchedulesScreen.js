import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import API_CONFIG from '../config/api';

const MaintenanceSchedulesScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  
  const [schedules, setSchedules] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchedules = async () => {
    try {
      setError(null);
      const baseUrl = API_CONFIG.PRIMARY_URL.endsWith('/') 
        ? API_CONFIG.PRIMARY_URL 
        : `${API_CONFIG.PRIMARY_URL}/`;
      const apiUrl = `${baseUrl}schedules/read.php`;
      
      console.log('Fetching schedules from:', apiUrl);
      
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
      console.log('Schedules response:', result);
      
      if (result.status === 'success') {
        setSchedules(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError(error.message);
      Alert.alert('Error', `Failed to load maintenance schedules: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSchedules();
  }, []);

  const getStatusColor = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return colors.error; // Overdue
    if (diffDays <= 7) return '#FFA500'; // Due soon (orange)
    return colors.success; // Due later
  };

  const renderScheduleItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ScheduleDetails', { schedule: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.assetName, { color: colors.text }]}>{item.AssetName}</Text>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.NextDueDate) }]} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Icon name="schedule" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Next Due: {new Date(item.NextDueDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="repeat" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {item.Frequency} - {item.ScheduleType}
          </Text>
        </View>

        {item.LastCompletedDate && (
          <View style={styles.infoRow}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Last Done: {new Date(item.LastCompletedDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.message, { color: colors.text }]}>Loading schedules...</Text>
        </View>
      );
    }

    if (error && schedules.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="error" size={50} color={colors.error} />
          <Text style={[styles.message, { color: colors.text }]}>Error loading schedules</Text>
          <Text style={[styles.errorDetails, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]} 
            onPress={fetchSchedules}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (schedules.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="schedule" size={50} color={colors.text} />
          <Text style={[styles.message, { color: colors.text }]}>No maintenance schedules found</Text>
          <Text style={[styles.subMessage, { color: colors.text }]}>Add a new schedule to get started</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={schedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.ScheduleID.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    );
  };

  const handleAddSchedule = () => {
    navigation.navigate('AddSchedule');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderContent()}
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddSchedule}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorDetails: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assetName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardContent: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MaintenanceSchedulesScreen;