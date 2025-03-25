import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { reportService } from '../services/api';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginBottom: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
    marginTop: 5,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  cost: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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

const ReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    completed: "0",
    in_progress: "0",
    pending: "0",
    total_cost: "0.00",
    total_records: "0"
  });
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const loadData = async () => {
    try {
      const response = await reportService.getAll();
      console.log('Reports response:', response);
      
      if (response?.status === 'success') {
        setReports(response.data || []);
        setSummary(response.summary || {
          completed: "0",
          in_progress: "0",
          pending: "0",
          total_cost: "0.00",
          total_records: "0"
        });
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status, colors) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return colors.success;
      case 'in progress':
        return colors.info;
      case 'pending':
        return colors.warning;
      default:
        return colors.text;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      onPress={() => navigation.navigate('ReportDetail', { report: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.assetName, { color: colors.text }]}>{item.assetName}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status, colors) }]}>
          {item.status}
        </Text>
      </View>
      <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.date, { color: colors.text }]}>{item.maintenanceDate}</Text>
        <Text style={[styles.cost, { color: colors.text }]}>Cost: ${parseFloat(item.cost).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: colors.text }]}>{summary.total_records}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Reports</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: colors.success }]}>{summary.completed}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Completed</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: colors.warning }]}>{summary.pending}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Pending</Text>
        </View>
      </View>

      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('GenerateReport')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default ReportsScreen;