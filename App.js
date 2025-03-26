// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme, StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { lightColors, darkColors } from './src/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './src/config/api';

// Import screen components
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import MaintenanceTeamsScreen from './src/screens/MaintenanceTeamsScreen';
import MaintenanceRecordsScreen from './src/screens/MaintenanceRecordsScreen';
import MaintenanceSchedulesScreen from './src/screens/MaintenanceSchedulesScreen';
import MaintenanceDetails from './src/screens/MaintenanceDetails';
import AddTeamScreen from './src/screens/AddTeamScreen';
import AddRecordScreen from './src/screens/AddRecordScreen';
import AddScheduleScreen from './src/screens/AddScheduleScreen';
import AssetsScreen from './src/screens/AssetsScreen';
import AddAssetScreen from './src/screens/AddAssetScreen';
import EditAssetScreen from './src/screens/EditAssetScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import GenerateReport from './src/screens/GenerateReport';
import ViewReport from './src/screens/ViewReport';
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfile from './src/screens/EditProfile';
import ChangePassword from './src/screens/ChangePassword';
import MaintenanceScreen from './src/screens/MaintenanceScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import EditTeamScreen from './src/screens/EditTeamScreen';
import ApiTestScreen from './src/screens/ApiTestScreen';
import ScheduleDetails from './src/screens/ScheduleDetails';

// Create a stack navigator
const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Always set Welcome as initial screen for first-time users
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      
      if (!hasLaunched) {
        setInitialRoute('Welcome');
        // Set hasLaunched flag for future app launches
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        // For subsequent launches, check if user is logged in
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setInitialRoute('Dashboard');
        } else {
          setInitialRoute('Login');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setInitialRoute('Welcome');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MaintenanceTeams" 
        component={MaintenanceTeamsScreen}
        options={{
          title: 'Maintenance Teams',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Teams" 
        component={TeamsScreen}
        options={{
          title: 'Maintenance Teams',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="AddTeam" 
        component={AddTeamScreen}
        options={{
          title: 'Add New Team',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="EditTeam" 
        component={EditTeamScreen}
        options={{
          title: 'Edit Team',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="MaintenanceRecords" 
        component={MaintenanceRecordsScreen}
        options={{
          title: 'Maintenance Records',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="MaintenanceSchedules" 
        component={MaintenanceSchedulesScreen}
        options={{
          title: 'Maintenance Schedules',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="AddRecord" 
        component={AddRecordScreen}
        options={{
          title: 'Add Maintenance Record',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Assets" 
        component={AssetsScreen}
        options={{
          title: 'Assets',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="AddAsset" 
        component={AddAssetScreen}
        options={{
          title: 'Add New Asset',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="EditAsset" 
        component={EditAssetScreen}
        options={{
          title: 'Edit Asset',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          title: 'Reports',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="GenerateReport" 
        component={GenerateReport}
        options={{
          title: 'Generate Report',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ViewReport" 
        component={ViewReport}
        options={{
          title: 'View Report',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfile}
        options={{
          title: 'Edit Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePassword}
        options={{
          title: 'Change Password',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Maintenance" 
        component={MaintenanceScreen}
        options={{
          title: 'Maintenance',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="AddSchedule" 
        component={AddScheduleScreen}
        options={{
          title: 'Add Maintenance Schedule',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ApiTest" 
        component={ApiTestScreen}
        options={{
          title: 'API Connection Test',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="MaintenanceDetails" 
        component={MaintenanceDetails}
        options={{
          title: 'Maintenance Details',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ScheduleDetails" 
        component={ScheduleDetails}
        options={{
          title: 'Schedule Details',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  const colorScheme = useColorScheme();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      setIsAuthenticated(!!userData);
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  };

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  const theme = colorScheme === 'dark' ? {
    ...DarkTheme,
    colors: darkColors,
  } : {
    ...DefaultTheme,
    colors: lightColors,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer theme={theme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
