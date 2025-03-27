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
import { teamService } from '../services/api';

export default function MaintenanceTeamsScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const fetchTeams = async () => {
    try {
      const response = await teamService.getAll();
      if (response.status === 'success') {
        setTeams(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      Alert.alert('Error', 'Failed to load teams. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTeams();
    
    // Refresh list when navigating back to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTeams();
    });

    return unsubscribe;
  }, [navigation]);

  const renderTeamItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.teamName, { color: colors.text }]}>{item.TeamName}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="person" size={20} color={colors.text} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Leader: {item.TeamLeader}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color={colors.text} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {item.ContactPhone}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="email" size={20} color={colors.text} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {item.ContactEmail}
          </Text>
        </View>
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
        renderItem={renderTeamItem}
        keyExtractor={item => item.TeamID.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No teams found. Pull to refresh or add a new team.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 