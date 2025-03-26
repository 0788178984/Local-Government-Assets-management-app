import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import Dashboard from '../screens/Dashboard';
import AssetManagement from '../screens/AssetManagement';
import MaintenanceManagement from '../screens/MaintenanceManagement';
import MaintenanceSchedule from '../screens/MaintenanceSchedule';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import MaintenanceRecordsScreen from '../screens/MaintenanceRecordsScreen';
import MaintenanceSchedulesScreen from '../screens/MaintenanceSchedulesScreen';
import AddMaintenance from '../screens/AddMaintenance';
import ReportsScreen from '../screens/ReportsScreen';
import GenerateReport from '../screens/GenerateReport';
import ViewReport from '../screens/ViewReport';
import TestOperations from '../screens/TestOperations';
import TeamsScreen from '../screens/TeamsScreen';
import EditTeamScreen from '../screens/EditTeamScreen';
import ScheduleDetails from '../screens/ScheduleDetails';
import MaintenanceDetails from '../screens/MaintenanceDetails';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { colors } = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    cardStyle: { backgroundColor: colors.background }
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{
          headerLeft: null,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="AssetManagement" 
        component={AssetManagement} 
        options={{ title: 'Asset Management' }} 
      />
      <Stack.Screen 
        name="MaintenanceManagement" 
        component={MaintenanceManagement} 
        options={{ title: 'Maintenance Management' }} 
      />
      <Stack.Screen 
        name="MaintenanceSchedule" 
        component={MaintenanceSchedule} 
        options={{ title: 'Maintenance Schedule' }} 
      />
      <Stack.Screen 
        name="Maintenance" 
        component={MaintenanceScreen} 
        options={{ title: 'Maintenance' }} 
      />
      <Stack.Screen 
        name="MaintenanceRecords" 
        component={MaintenanceRecordsScreen} 
        options={{ title: 'Maintenance Records' }} 
      />
      <Stack.Screen 
        name="MaintenanceSchedules" 
        component={MaintenanceSchedulesScreen} 
        options={{ title: 'Maintenance Schedules' }} 
      />
      <Stack.Screen 
        name="AddMaintenance" 
        component={AddMaintenance} 
        options={{ title: 'Add Maintenance Record' }} 
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ title: 'Reports' }} 
      />
      <Stack.Screen 
        name="GenerateReport" 
        component={GenerateReport} 
        options={{ title: 'Generate Report' }} 
      />
      <Stack.Screen 
        name="ViewReport" 
        component={ViewReport} 
        options={{ title: 'View Report' }} 
      />
      <Stack.Screen 
        name="TestOperations" 
        component={TestOperations} 
        options={{ title: 'Test Operations' }} 
      />
      <Stack.Screen 
        name="Teams" 
        component={TeamsScreen} 
        options={{ title: 'Maintenance Teams' }} 
      />
      <Stack.Screen 
        name="EditTeam" 
        component={EditTeamScreen} 
        options={{ title: 'Edit Team' }} 
      />
      <Stack.Screen 
        name="ScheduleDetails" 
        component={ScheduleDetails} 
        options={{ title: 'Schedule Details' }} 
      />
      <Stack.Screen 
        name="MaintenanceDetails" 
        component={MaintenanceDetails} 
        options={{ 
          title: 'Maintenance Details',
          // Make sure we have the header shown to navigate back
          headerShown: true,
          // Add animation to make it feel like a modal
          cardStyle: { backgroundColor: colors.background }
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;