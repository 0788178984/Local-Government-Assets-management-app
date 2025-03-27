// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { 
  useColorScheme, 
  StyleSheet, 
  View, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  Animated,
  LogBox,
  ActivityIndicator,
  Text 
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { lightColors, darkColors } from './src/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './src/config/api';
import { isAuthenticated, clearAuthData, STORAGE_KEYS } from './src/utils/authUtils';

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
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import AuthLoadingScreen from './src/screens/AuthLoadingScreen';

// Ignore specific harmless warnings
LogBox.ignoreLogs([
  'Warning: componentWillReceiveProps has been renamed',
  'Warning: componentWillMount has been renamed',
  'Animated: `useNativeDriver` was not specified'
]);

const Stack = createStackNavigator();

// Custom loading component
const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3498db" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('AuthLoading');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const authenticated = await isAuthenticated();
      setInitialRoute(authenticated ? 'Dashboard' : 'Welcome');
    } catch (error) {
      console.error('Error checking auth state:', error);
      // On error, clear auth data and start fresh
      await clearAuthData();
      setInitialRoute('Welcome');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' }
      }}
    >
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="MaintenanceTeams" component={MaintenanceTeamsScreen} />
      <Stack.Screen name="MaintenanceRecords" component={MaintenanceRecordsScreen} />
      <Stack.Screen name="MaintenanceSchedules" component={MaintenanceSchedulesScreen} />
      <Stack.Screen name="MaintenanceDetails" component={MaintenanceDetails} />
      <Stack.Screen name="AddTeam" component={AddTeamScreen} />
      <Stack.Screen name="AddRecord" component={AddRecordScreen} />
      <Stack.Screen name="AddSchedule" component={AddScheduleScreen} />
      <Stack.Screen name="Assets" component={AssetsScreen} />
      <Stack.Screen name="AddAsset" component={AddAssetScreen} />
      <Stack.Screen name="EditAsset" component={EditAssetScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="GenerateReport" component={GenerateReport} />
      <Stack.Screen name="ViewReport" component={ViewReport} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      <Stack.Screen name="Teams" component={TeamsScreen} />
      <Stack.Screen name="EditTeam" component={EditTeamScreen} />
      <Stack.Screen name="ApiTest" component={ApiTestScreen} />
      <Stack.Screen name="ScheduleDetails" component={ScheduleDetails} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Disable the Animated warning
    LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
  }, []);

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#3498db',
    marginTop: 10,
  },
});

export default App;
