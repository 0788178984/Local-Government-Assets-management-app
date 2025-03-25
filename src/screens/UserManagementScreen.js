import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { userService } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    userRole: 'Asset Manager',
    isActive: true
  });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    loadUsers();
    // Get user role from AsyncStorage
    const checkUserRole = async () => {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      setUserRole(user.role);
    };
    checkUserRole();
  }, []);

  // Add role-based access control
  const canManageUsers = userRole === 'Admin';
  
  // Modify render to include role check
  if (!canManageUsers) {
    return (
      <View style={styles.container}>
        <Text>Access Denied: Admin privileges required</Text>
      </View>
    );
  }

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      if (response.status === 'success') {
        setUsers(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load users');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.create(formData);
      if (response.status === 'success') {
        Alert.alert('Success', 'User created successfully');
        setModalVisible(false);
        resetForm();
        loadUsers();
      } else {
        Alert.alert('Error', response.message || 'Failed to create user');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!formData.username || !formData.email) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.update(selectedUser.UserID, formData);
      if (response.status === 'success') {
        Alert.alert('Success', 'User updated successfully');
        setModalVisible(false);
        resetForm();
        loadUsers();
      } else {
        Alert.alert('Error', response.message || 'Failed to update user');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await userService.delete(userId);
              if (response.status === 'success') {
                Alert.alert('Success', 'User deleted successfully');
                loadUsers();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete user');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
              console.error(error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.Username,
      email: user.Email,
      password: '', // Don't set password for editing
      userRole: user.UserRole,
      isActive: user.IsActive === 1 || user.IsActive === true
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      userRole: 'Asset Manager',
      isActive: true
    });
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.Username}</Text>
        <Text style={styles.email}>{item.Email}</Text>
        <Text style={styles.role}>{item.UserRole}</Text>
        <Text style={item.IsActive ? styles.active : styles.inactive}>
          {item.IsActive ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Icon name="edit" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteUser(item.UserID)}>
          <Icon name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.UserID.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyList}>No users found</Text>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedUser ? 'Edit User' : 'Create User'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
            />

            {!selectedUser && (
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry
              />
            )}

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Role:</Text>
              {['Admin', 'Asset Manager', 'Maintenance Team'].map(role => (
                <TouchableOpacity 
                  key={role}
                  style={[
                    styles.roleOption,
                    formData.userRole === role && styles.selectedRole
                  ]}
                  onPress={() => setFormData({...formData, userRole: role})}
                >
                  <Text 
                    style={[
                      styles.roleText,
                      formData.userRole === role && styles.selectedRoleText
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Active:</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  formData.isActive ? styles.switchActive : styles.switchInactive
                ]}
                onPress={() => setFormData({...formData, isActive: !formData.isActive})}
              >
                <View 
                  style={[
                    styles.switchThumb,
                    formData.isActive ? styles.switchThumbActive : styles.switchThumbInactive
                  ]} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={selectedUser ? handleUpdateUser : handleCreateUser}
              >
                <Text style={styles.buttonText}>
                  {selectedUser ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  userInfo: {
    flex: 1
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  role: {
    fontSize: 14,
    color: '#4a90e2',
    marginTop: 4
  },
  active: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 4
  },
  inactive: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 70
  },
  loader: {
    marginTop: 100
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16
  },
  pickerContainer: {
    marginBottom: 16
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8
  },
  roleOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8
  },
  selectedRole: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2'
  },
  roleText: {
    fontSize: 14
  },
  selectedRoleText: {
    color: '#fff'
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center'
  },
  switchActive: {
    backgroundColor: '#4cd964'
  },
  switchInactive: {
    backgroundColor: '#e9e9e9'
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11
  },
  switchThumbActive: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end'
  },
  switchThumbInactive: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  button: {
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#e74c3c'
  },
  saveButton: {
    backgroundColor: '#4a90e2'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default UserManagementScreen; 