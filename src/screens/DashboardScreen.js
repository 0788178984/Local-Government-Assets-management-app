// Import necessary components and libraries from React Native
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Alert,
  Modal,
  TextInput,
  Platform,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../services/api';

// Dashboard screen component
const DashboardScreen = ({ navigation, route }) => {
  // State management for user session and theme
  const [user, setUser] = useState(route.params?.user || null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  
  // State management for chart scrolling and auto-scroll functionality
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;

  // Add animation value for header
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -30],
    extrapolate: 'clamp'
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  // State for summary data
  const [summaryData, setSummaryData] = useState({
    totalAssets: 0,
    goodCondition: 0,
    fairCondition: 0,
    poorCondition: 0,
    maintenanceCount: 0,
    reportCount: 0
  });

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  // Add a loading state for the cards
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add connection status state
  const [isConnected, setIsConnected] = useState(true);

  // Function to check API connection
  const checkApiConnection = async () => {
    try {
      console.log('Checking API connection at:', API_URL);
      const response = await fetch(`${API_URL}ping.php`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 5000
      });
      
      console.log('Connection check response:', response.status);
      const isConnected = response.ok;
      setIsConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('API connection check failed:', error);
      setIsConnected(false);
      return false;
    }
  };

  // Function to fetch summary data
  const fetchSummaryData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}dashboard/get_summary.php`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Summary response status:', response.status);
      
      const data = await response.json();
      console.log('Summary response data:', data);
      
      if (data.status === 'success') {
        setSummaryData(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch summary data');
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Separate function for handling refresh
  const handleRefresh = async () => {
    try {
      await fetchSummaryData();
    } catch (error) {
      // Show error toast or alert
      Alert.alert(
        'Refresh Failed',
        'Could not refresh data. Please try again.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Retry', onPress: handleRefresh }
        ]
      );
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchSummaryData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchSummaryData, 300000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Check for user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        
        if (!userStr) {
          // No valid session, redirect to login
          navigation.replace('Login');
          return;
        }

        if (!user) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        navigation.replace('Login');
      }
    };

    checkUserSession();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Chart data configuration
  const charts = [
    {
      type: 'line',
      title: 'Asset Usage Trends',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [20, 45, 28, 80, 99, 43]
        }]
      }
    },
    {
      type: 'bar',
      title: 'Maintenance Costs',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          data: [300, 450, 280, 800]
        }]
      }
    },
    {
      type: 'pie',
      title: 'Asset Distribution',
      data: [
        { name: 'Vehicles', population: 45, color: '#1a237e' },
        { name: 'Buildings', population: 28, color: '#d32f2f' },
        { name: 'Equipment', population: 30, color: '#0097a7' },
      ]
    },
  ];

  // Common configuration for all charts
  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(26, 35, 126, ${opacity})`,
    strokeWidth: 2,
  };

  // Function to render individual chart based on type
  const renderChart = (item, index) => {
    const commonProps = {
      data: item.data,
      width: screenWidth - 60,
      height: 200,
      chartConfig: chartConfig,
      style: { marginVertical: 8, borderRadius: 16 }
    };

    switch (item.type) {
      case 'line':
        return <LineChart {...commonProps} bezier />;
      case 'bar':
        return <BarChart {...commonProps} />;
      default:
        return null;
    }
  };

  // Quick action cards configuration
  const quickActionCards = [
    {
      icon: 'inventory',
      title: 'Assets',
      count: summaryData.totalAssets,
      subtitle: `${summaryData.goodCondition} Good, ${summaryData.fairCondition} Fair, ${summaryData.poorCondition} Poor`,
      color: '#1a237e',
      screen: 'Assets'
    },
    {
      icon: 'build',
      title: 'Maintenance',
      count: summaryData.maintenanceCount,
      subtitle: `${summaryData.maintenanceCount} Records`,
      color: '#b71c1c',
      screen: 'Maintenance'
    },
    {
      icon: 'group',
      title: 'Teams',
      count: summaryData.teams?.total || 0,
      subtitle: `${summaryData.teams?.active || 0} Active`,
      color: '#004d40',
      screen: 'Teams'
    },
    {
      icon: 'assessment',
      title: 'Reports',
      count: summaryData.reportCount,
      subtitle: `${summaryData.reportCount} Reports`,
      color: '#1565c0',
      screen: 'Reports'
    }
  ];

  // Menu items configuration
  const menuItems = [
    {
      icon: 'inventory',
      title: 'Assets',
      screen: 'Assets'
    },
    {
      icon: 'build',
      title: 'Maintenance',
      screen: 'Maintenance'
    },
    {
      icon: 'group',
      title: 'Teams',
      screen: 'Teams'
    },
    {
      icon: 'assessment',
      title: 'Reports',
      screen: 'Reports'
    },
    {
      icon: 'settings',
      title: 'Settings',
      screen: 'Settings'
    }
  ];

  // Handle menu item selection
  const handleMenuItemPress = (title) => {
    setIsMenuVisible(false);
    switch (title) {
      case 'Dashboard':
        // Handle dashboard navigation
        break;
      case 'Assets':
        // Handle assets navigation
        break;
      case 'Maintenance':
        // Handle maintenance navigation
        break;
      case 'Reports':
        // Handle reports navigation
        break;
      case 'Settings':
        // Handle settings navigation
        break;
      case 'Logout':
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: handleLogout }
          ]
        );
        break;
      default:
        break;
    }
  };

  // Render menu item
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress(item.title)}>
      <Icon name={item.icon} size={24} color="#1a237e" />
      <View style={styles.menuItemText}>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#1a237e" />
    </TouchableOpacity>
  );

  // Menu header with user info
  const renderMenuHeader = () => (
    <View style={styles.menuHeader}>
      <View style={styles.menuUserSection}>
        <View style={styles.menuUserInfo}>
          <Text style={styles.menuLabel}>Menu</Text>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Guest'}</Text>
          </View>
        </View>
        {user?.photoUrl ? (
          <Image 
            source={{ uri: user.photoUrl }} 
            style={styles.profileImage} 
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Icon name="person" size={30} color="#1a237e" />
          </View>
        )}
      </View>
    </View>
  );

  // Auto-scroll functionality
  React.useEffect(() => {
    let scrollInterval;
    if (isAutoScroll) {
      scrollInterval = setInterval(() => {
        setCurrentChartIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % charts.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * screenWidth,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);
    }
    return () => clearInterval(scrollInterval);
  }, [isAutoScroll]);

  // Profile settings modal
  const ProfileSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isProfileModalVisible}
      onRequestClose={() => setIsProfileModalVisible(false)}
    >
      <View style={[styles.modalContainer, isDarkMode && styles.darkMode]}>
        <View style={[styles.modalContent, isDarkMode && styles.darkModeContent]}>
          <Text style={[styles.modalTitle, isDarkMode && styles.darkModeText]}>Profile Settings</Text>
          
          <TouchableOpacity style={styles.profileImageContainer}>
            <Image
              source={user?.profileImage ? { uri: user.profileImage } : require('../../assets/logo1.png')}
              style={styles.profileImageLarge}
            />
            <Text style={[styles.uploadText, isDarkMode && styles.darkModeText]}>Tap to upload new photo</Text>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkModeText]}>Dark Mode</Text>
            <TouchableOpacity
              style={[styles.toggleButton, isDarkMode && styles.toggleButtonActive]}
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              <View style={[styles.toggleKnob, isDarkMode && styles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsProfileModalVisible(false)}
          >
            <Text style={[styles.closeButtonText, isDarkMode && styles.darkModeText]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const mainDashboardItems = [
    {
      icon: 'inventory',
      title: 'Assets',
      description: 'Manage all assets',
      screen: 'Assets'
    },
    {
      icon: 'build',
      title: 'Maintenance',
      description: 'Manage maintenance tasks',
      screen: 'Maintenance'
    },
    {
      icon: 'group',
      title: 'Teams',
      description: 'Manage maintenance teams',
      screen: 'Teams'
    },
    {
      icon: 'assessment',
      title: 'Reports',
      description: 'View and generate reports',
      screen: 'Reports'
    }
  ];

  // Add this for debugging
  useEffect(() => {
    console.log('Summary Data:', summaryData);
  }, [summaryData]);

  // Add loading indicator in the quick actions section
  const renderQuickActionCards = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading summary data...</Text>
        </View>
      );
    }

    return error ? (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={40} color="#b71c1c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    ) : (
      quickActionCards.map((item, index) => (
        <TouchableOpacity 
          key={index}
          style={[
            styles.actionItem,
            { backgroundColor: colors.card, borderLeftColor: item.color }
          ]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Icon name={item.icon} size={24} color={item.color} />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.actionCount, { color: colors.text }]}>
              {item.count}
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      ))
    );
  };

  // Add connection status display
  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <View style={styles.connectionError}>
          <Icon name="wifi-off" size={24} color="#b71c1c" />
          <Text style={styles.connectionErrorText}>
            Cannot connect to server at {API_URL}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={checkApiConnection}
          >
            <Text style={styles.retryButtonText}>Check Connection</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderConnectionStatus()}
      <Animated.View style={[
        styles.header,
        { transform: [{ translateY }] },
        isDarkMode && styles.darkModeHeader
      ]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setIsMenuVisible(true)}
          >
            <Icon name="menu" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Local Government</Text>
            <Text style={styles.headerSubtitle}>Asset Management</Text>
          </View>

          <Image
            source={require('../../assets/logo1.png')}
            style={styles.institutionLogo}
          />
        </View>
      </Animated.View>

      <ProfileSettingsModal />

      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => setIsSearchVisible(!isSearchVisible)}
      >
        <View style={styles.searchPlaceholder}>
          <Icon name="search" size={20} color="#666" />
          <Text style={styles.searchPlaceholderText}>Search assets, maintenance...</Text>
        </View>
      </TouchableOpacity>

      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets, maintenance..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearSearch}
              onPress={() => setSearchQuery('')}
            >
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#1a237e']}
            tintColor={isDarkMode ? '#ffffff' : '#1a237e'}
            title="Pull to refresh..."
            titleColor={isDarkMode ? '#ffffff' : '#666666'}
          />
        }
      >
        {/* Quick Actions Section */}
        <View style={styles.quickActions}>
          {renderQuickActionCards()}
        </View>

        {/* Charts Section */}
        <View style={styles.chartsContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={() => setIsAutoScroll(false)}
          >
            {charts.map((chart, index) => (
              <View key={index} style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>{chart.title}</Text>
                {renderChart(chart, index)}
              </View>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {charts.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentChartIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Developer Information Section */}
        <View style={styles.developerInfo}>
          <View style={styles.developerContentWrapper}>
            <Image
              style={styles.developerImage}
              source={require('../../assets/ASIIMWE.png')}
            />
            <View style={styles.textContainer}>
              <Text style={styles.developerName}>ASIIMWE LUCKY</Text>
              <Text style={styles.leadDeveloperText}>Lead Developer</Text>
            </View>
            <TouchableOpacity 
              onPress={() => Alert.alert(
                'Contact Details',
                'Email: asmart@gmail.com\nPhone: +256779654710',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
              )}
              style={styles.contactButton}
            >
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

      </Animated.ScrollView>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.menuModalContainer}>
          <View style={[styles.menuModalContent, isDarkMode && styles.darkModeContent]}>
            {/* Header Section */}
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, isDarkMode && styles.darkModeText]}>Menu</Text>
              
              <View style={styles.headerRight}>
                <TouchableOpacity
                  onPress={() => setIsProfileModalVisible(true)}
                  style={styles.profileButton}
                >
                  <Image
                    source={user?.profileImage ? { uri: user.profileImage } : require('../../assets/logo1.png')}
                    style={styles.menuProfileImage}
                  />
                  <Text style={[styles.adminText, isDarkMode && styles.darkModeText]}>
                    (Admin)
                  </Text>
                </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setIsMenuVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuItemsContainer}>
              {mainDashboardItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dashboardCard}
                  onPress={() => {
                    navigation.navigate(item.screen);
                    setIsMenuVisible(false);
                  }}
                >
                  <Icon name={item.icon} size={40} color={colors.primary} />
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.cardDescription, { color: colors.text }]}>{item.description}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={colors.text} />
            </TouchableOpacity>
              ))}

              {/* Settings Option */}
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                  navigation.navigate('Settings');
                  setIsMenuVisible(false);
                }}
              >
                <Icon name="settings" size={24} color={isDarkMode ? '#fff' : '#666'} />
              <Text style={[styles.menuItemText, isDarkMode && styles.darkModeText]}>Settings</Text>
                <Icon 
                  name="chevron-right" 
                  size={20} 
                  color={isDarkMode ? '#aaa' : '#666'} 
                />
            </TouchableOpacity>
            </ScrollView>

            {/* Bottom Section */}
            <View style={styles.menuBottom}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
                <Icon name={isDarkMode ? "light-mode" : "dark-mode"} size={24} color={isDarkMode ? '#fff' : '#666'} />
              <Text style={[styles.menuItemText, isDarkMode && styles.darkModeText]}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
                <Icon name="logout" size={24} color={isDarkMode ? '#fff' : '#666'} />
              <Text style={[styles.menuItemText, isDarkMode && styles.darkModeText]}>Logout</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles definition
const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header styles
  header: {
    backgroundColor: '#1a237e',
    paddingTop: Platform.OS === 'android' ? 35 : 40,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  menuButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  institutionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  menuModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuModalContent: {
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  adminText: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  darkModeContent: {
    backgroundColor: '#1a1a1a',
    borderLeftColor: '#333',
  },
  darkModeText: {
    color: '#fff',
  },
  menuItemsContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 20,
    gap: 15,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  activeMenuItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  actionCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chartsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  chartWrapper: {
    width: Dimensions.get('window').width - 40,
    alignItems: 'center',
    padding: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#1a237e',
  },
  developerInfo: {
    padding: 5,
    backgroundColor: '#1a237e', 
    borderRadius: 15,
    margin: 10,
  },
  developerContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  developerImage: {
    width: 65,
    height: 65,
    borderRadius: 40,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
  developerName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  leadDeveloperText: {
    fontSize: 14,
    fontWeight: '300',
    color: '#ffffff',
  },
  contactButton: {
    backgroundColor: '#ff0000', 
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 15,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 5,
    elevation: 2,
  },
  searchPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchPlaceholderText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 10,
    marginTop: 0,
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 50,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  clearSearch: {
    padding: 5,
  },
  card: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownContent: {
    borderTopWidth: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  submenuContent: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  darkModeSubmenu: {
    backgroundColor: '#2c2c2c',
    borderColor: '#333',
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    gap: 12,
  },
  submenuText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  toggleButton: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#1a237e',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    backgroundColor: '#FFFFFF',
  },
  userDetails: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuModalContent: {
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  adminText: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  darkModeContent: {
    backgroundColor: '#1a1a1a',
    borderLeftColor: '#333',
  },
  darkModeText: {
    color: '#fff',
  },
  menuItemsContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 20,
    gap: 15,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  activeMenuItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  actionCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chartsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  chartWrapper: {
    width: Dimensions.get('window').width - 40,
    alignItems: 'center',
    padding: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#1a237e',
  },
  developerInfo: {
    padding: 5,
    backgroundColor: '#1a237e', 
    borderRadius: 15,
    margin: 10,
  },
  developerContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  developerImage: {
    width: 65,
    height: 65,
    borderRadius: 40,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
  developerName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  leadDeveloperText: {
    fontSize: 14,
    fontWeight: '300',
    color: '#ffffff',
  },
  contactButton: {
    backgroundColor: '#ff0000', 
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 15,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#b71c1c',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#1a237e',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectionError: {
    backgroundColor: '#ffebee',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  connectionErrorText: {
    color: '#b71c1c',
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
  },
});

export default DashboardScreen;
