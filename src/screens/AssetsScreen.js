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
import { assetService } from '../services/api';

export default function AssetsScreen({ navigation }) {
  const [assets, setAssets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const fetchAssets = async () => {
    try {
      const response = await assetService.getAll();
      if (response.status === 'success') {
        setAssets(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch assets');
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      Alert.alert('Error', 'Failed to load assets. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssets();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX'
    }).format(value);
  };

  const getAssetTypeIcon = (type) => {
    switch(type) {
      case 'Equipment': return 'build';
      case 'Road': return 'directions';
      case 'Bridge': return 'architecture';
      case 'Building': return 'business';
      case 'Utility': return 'power';
      default: return 'category';
    }
  };

  const handleDelete = async (assetId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this asset?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await assetService.delete(assetId);
              if (response.status === 'success') {
                Alert.alert('Success', 'Asset deleted successfully');
                fetchAssets();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete asset');
              }
            } catch (error) {
              console.error('Error deleting asset:', error);
              if (error.response) {
                Alert.alert('Error', error.response.data.message || 'Failed to delete asset');
              } else if (error.request) {
                Alert.alert('Error', 'Network error. Please check your connection.');
              } else {
                Alert.alert('Error', 'An unexpected error occurred');
              }
            }
          }
        }
      ]
    );
  };

  const renderAssetItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Icon 
            name={getAssetTypeIcon(item.AssetType)} 
            size={24} 
            color={colors.primary} 
          />
          <Text style={[styles.assetName, { color: colors.text }]}>
            {item.AssetName}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditAsset', { asset: item })}
            style={styles.iconButton}
          >
            <Icon name="edit" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item.AssetID)}
            style={styles.iconButton}
          >
            <Icon name="delete" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="category" size={20} color={colors.text} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Type: {item.AssetType || 'Not specified'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="location-on" size={20} color={colors.text} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Location: {item.Location}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="calendar-today" size={20} color={colors.text} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Acquired: {new Date(item.AcquisitionDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.costSection}>
          <View style={styles.infoRow}>
            <Icon name="attach-money" size={20} color={colors.text} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Initial Cost: {formatCurrency(item.InitialCost)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="trending-down" size={20} color={colors.text} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Current Value: {formatCurrency(item.CurrentValue)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBar, { backgroundColor: colors.background }]}>
          <Icon 
            name={item.MaintenanceStatus === 'Good' ? 'check-circle' : 'warning'} 
            size={20} 
            color={item.MaintenanceStatus === 'Good' ? '#4CAF50' : '#FFC107'} 
          />
          <Text style={[styles.statusText, { color: colors.text }]}>
            Status: {item.MaintenanceStatus}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddAsset')}
      >
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Asset</Text>
      </TouchableOpacity>

      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={item => item.AssetID.toString()}
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
              No assets found. Pull to refresh or add a new asset.
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  costSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
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