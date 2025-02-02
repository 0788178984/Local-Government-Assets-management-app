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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Dashboard screen component
const DashboardScreen = () => {
  // State management for chart scrolling and auto-scroll functionality
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;

  // State for summary data
  const [summaryData, setSummaryData] = useState({
    maintenanceRecords: { count: 0, pending: 0 },
    maintenanceSchedules: { count: 0, upcoming: 0 },
    maintenanceTeams: { count: 0, active: 0 },
    users: { count: 0, active: 0 }
  });

  // Function to fetch summary data
  const fetchSummaryData = async () => {
    try {
      // Here you would fetch actual data from your database
      // For now using mock data
      const data = {
        maintenanceRecords: { count: 150, pending: 25 },
        maintenanceSchedules: { count: 80, upcoming: 12 },
        maintenanceTeams: { count: 10, active: 8 },
        users: { count: 45, active: 40 }
      };
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchSummaryData();
  }, []);

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
      icon: 'build',
      title: 'Maintenance Records',
      count: summaryData.maintenanceRecords.count,
      subtitle: `${summaryData.maintenanceRecords.pending} Pending`,
      color: '#1a237e'
    },
    {
      icon: 'schedule',
      title: 'Maintenance Schedules',
      count: summaryData.maintenanceSchedules.count,
      subtitle: `${summaryData.maintenanceSchedules.upcoming} Upcoming`,
      color: '#4a148c'
    },
    {
      icon: 'groups',
      title: 'Maintenance Teams',
      count: summaryData.maintenanceTeams.count,
      subtitle: `${summaryData.maintenanceTeams.active} Active`,
      color: '#004d40'
    },
    {
      icon: 'people',
      title: 'Users',
      count: summaryData.users.count,
      subtitle: `${summaryData.users.active} Active`,
      color: '#b71c1c'
    }
  ];

  // Menu items configuration
  const menuItems = [
    { icon: 'settings', title: 'Settings', description: 'System preferences and configurations' },
    { icon: 'help', title: 'Help', description: 'User guide and documentation' },
    { icon: 'info', title: 'About', description: 'System information and version' },
    { icon: 'security', title: 'Security', description: 'Privacy and security settings' },
    { icon: 'backup', title: 'Backup', description: 'Data backup and restore' },
    { icon: 'person', title: 'Profile', description: 'User profile settings' },
    { icon: 'notifications', title: 'Notifications', description: 'Notification preferences' },
    { icon: 'logout', title: 'Logout', description: 'Sign out from the system' },
  ];

  // Render menu item
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress(item.title)}>
      <Icon name={item.icon} size={24} color="#1a237e" />
      <View style={styles.menuItemText}>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#1a237e" />
    </TouchableOpacity>
  );

  // Handle menu item press
  const handleMenuItemPress = (title) => {
    setIsMenuVisible(false);
    // Add specific actions for each menu item
    switch (title) {
      case 'Logout':
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive' },
        ]);
        break;
      default:
        Alert.alert(title, `${title} functionality will be implemented soon`);
    }
  };

  // Function to show contact details in an alert
  const showContactDetails = () => {
    Alert.alert(
      'Contact Details',
      'Email: asmart@gmail.com\nPhone: +256779654710',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

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

  return (
    <View style={styles.container}>
      {/* Header Section with Institution Logo and Title */}
      <View style={styles.header}>
        <View style={styles.institutionContainer}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsMenuVisible(true)}
          >
            <Icon name="menu" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Local Government Assets Management</Text>
          <Image
            source={require('../../assets/logo1.png')}
            style={styles.institutionLogo}
          />
        </View>
      </View>

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
      <ScrollView style={styles.content}>
        {/* Quick Actions Section */}
        <View style={styles.quickActions}>
          {quickActionCards.map((item, index) => (
            <TouchableOpacity key={index} style={[styles.actionItem, { borderLeftWidth: 4, borderLeftColor: item.color }]}>
              <View style={styles.actionHeader}>
                <Icon name={item.icon} size={24} color={item.color} />
                <Text style={[styles.actionCount, { color: item.color }]}>{item.count}</Text>
              </View>
              <Text style={[styles.actionTitle, { color: item.color }]}>{item.title}</Text>
              <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
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
              onPress={showContactDetails}
              style={styles.contactButton}
            >
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuModalContainer}>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuHeaderText}>Menu</Text>
                <TouchableOpacity 
                  onPress={() => setIsMenuVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#1a237e" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={item => item.title}
                showsVerticalScrollIndicator={false}
                style={styles.menuList}
              />
            </View>
          </View>
        </TouchableOpacity>
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
    paddingTop: 35, 
    paddingBottom: 10,
    paddingHorizontal: 15,
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginTop: 5,
  },
  institutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  institutionLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 50,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 5,
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
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
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
  spacer: {
    height: 10,
  },
  // Menu Modal styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuModalContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',  // Changed from flex-end to flex-start
  },
  menuContent: {
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  closeButton: {
    padding: 5,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a237e',
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
});

export default DashboardScreen;
