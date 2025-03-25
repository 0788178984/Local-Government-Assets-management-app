import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';

const MaintenanceScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  const maintenanceOptions = [
    {
      title: 'Upcoming Maintenance',
      icon: 'event',
      screen: 'MaintenanceSchedules',
      description: 'List of assets with upcoming maintenance schedules'
    },
    {
      title: 'Maintenance Records',
      icon: 'assignment',
      screen: 'MaintenanceRecords',
      description: 'View and add maintenance records'
    },
    {
      title: 'Maintenance Schedules',
      icon: 'schedule',
      screen: 'MaintenanceSchedules',
      description: 'Manage maintenance schedules'
    }
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.cardContent}>
        <Icon name={item.icon} size={40} color={colors.primary} />
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.cardDescription, { color: colors.text }]}>{item.description}</Text>
        </View>
        <Icon name="chevron-right" size={24} color={colors.text} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={maintenanceOptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardText: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default MaintenanceScreen;