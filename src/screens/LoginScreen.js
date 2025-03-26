import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { login } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Clear any stored API URLs or cached data
      await AsyncStorage.removeItem('apiUrl');
      await AsyncStorage.removeItem('lastIpAddress');
      
      setIsLoading(true);
      console.log('Attempting login with:', { email, password });
      const response = await login(email, password);
      console.log('Login response:', response);
      
      if (response.status === 'success' && response.data) {
        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        
        // Navigate to Dashboard and prevent going back
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });

        // Force a reload of the app to update authentication state
        setTimeout(() => {
          navigation.navigate('Dashboard');
        }, 100);
      } else {
        Alert.alert('Error', response.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetWelcomeScreen = async () => {
    try {
      await AsyncStorage.removeItem('hasLaunched');
    } catch (error) {
      console.error('Error resetting welcome screen:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: 60,
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginTop: 20,
      paddingHorizontal: 20,
    },
    formContainer: {
      paddingHorizontal: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 15,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      color: colors.text,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
    },
    eyeIcon: {
      padding: 10,
    },
    loginButton: {
      backgroundColor: '#00008B',
      borderRadius: 8,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      elevation: 3,
    },
    loginButtonDisabled: {
      backgroundColor: '#ccc',
    },
    loginButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    signupLink: {
      marginTop: 20,
      alignItems: 'center',
    },
    signupText: {
      color: colors.text + '99',
      fontSize: 14,
    },
    signupTextBold: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 15,
      marginVertical: 5,
    },
    primaryText: {
      color: colors.text,
      fontSize: 16,
    },
    secondaryText: {
      color: colors.text + '99',
      fontSize: 14,
    },
    actionButton: {
      backgroundColor: colors.primary,
    },
    actionButtonText: {
      color: '#FFFFFF',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    }
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo1.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Local Government Assets Management</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="email" size={24} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            disabled={isLoading}
          >
            <Icon
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
