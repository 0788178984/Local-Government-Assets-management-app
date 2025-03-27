import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';
import { setUserSession } from '../utils/authUtils';
import config from '../config/config';

const LoginScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateInput = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      setError('');
      if (!validateInput()) return;

      setIsLoading(true);

      // Log configuration for debugging
      console.log('API URL:', config.API_URL);
      console.log('LOGIN API ENDPOINT:', `${config.API_URL}login_fix.php`); // Use the working endpoint

      // Add retry logic
      const maxRetries = 3;
      let currentTry = 0;
      let lastError = null;

      while (currentTry < maxRetries) {
        try {
          // Use the working login_fix.php endpoint
          const response = await fetch(`${config.API_URL}login_fix.php`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "Username": username.trim(),
              "Password": password
            })
          });

          // Log response details for debugging
          console.log('Response status:', response.status);
          console.log('Response headers:', response.headers);
          
          const responseText = await response.text();
          console.log('Raw response:', responseText);

          // If response is empty, throw a specific error
          if (!responseText.trim()) {
            throw new Error('Server returned empty response. Please check server logs.');
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Server returned invalid JSON. Please contact administrator.');
          }

          if (data.status === 'success') {
            // Save user session with tokens
            await setUserSession(
              data.data,
              data.data.token,
              data.data.refreshToken
            );

            // Navigate to AuthLoading which will verify and then go to Dashboard
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthLoading' }],
            });
            return; // Success, exit the function
          } else {
            throw new Error(data.message || 'Login failed. Please try again.');
          }
        } catch (attemptError) {
          lastError = attemptError;
          currentTry++;
          
          if (currentTry < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentTry) * 1000));
            continue;
          }
          throw lastError;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: config.logoUrl }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Local Government Asset Management
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Icon name="error" size={20} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Icon name="person" size={20} color={colors.text} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Username"
              placeholderTextColor={colors.placeholder}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Icon name="lock" size={20} color={colors.text} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.passwordToggle}
            >
              <Icon
                name={showPassword ? "visibility-off" : "visibility"}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: colors.primary },
              isLoading && styles.disabledButton
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="login" size={20} color="#fff" />
                <Text style={styles.loginButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={isLoading}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    marginLeft: 10,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  passwordToggle: {
    padding: 10,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
