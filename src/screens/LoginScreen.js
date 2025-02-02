import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Mock user data
const mockUsers = [
  {
    email: 'admin@gmail.com',
    password: 'admin123',
    name: 'Admin User',
  },
  {
    email: 'test@gmail.com',
    password: 'test123',
    name: 'Test User',
  },
];

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      Alert.alert('Success', `Welcome back, ${user.name}!`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Dashboard'),
        },
      ]);
    } else {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert(
      'Mock Social Login',
      `This is a simulated ${provider} login.\n\nIn a production app, this would connect to ${provider}'s authentication service.`,
      [
        {
          text: 'Sign in as Demo User',
          onPress: () => {
            Alert.alert('Success', 'Welcome Demo User!', [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Dashboard'),
              },
            ]);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
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
          <Icon name="email" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Icon
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => handleSocialLogin('Google')}
          >
            <Icon name="android" size={24} color="#4285F4" style={styles.socialIcon} />
            <Text style={[styles.socialButtonText, { color: '#4285F4' }]}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialButton, styles.githubButton]}
            onPress={() => handleSocialLogin('GitHub')}
          >
            <Icon name="code" size={24} color="#24292e" style={styles.socialIcon} />
            <Text style={[styles.socialButtonText, { color: '#24292e' }]}>Continue with GitHub</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={() => Alert.alert('Demo Credentials', 'Email: admin@gmail.com\nPassword: admin123')}>
            <Text style={styles.helpText}>Need Help? View Demo Credentials</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.forgotContainer}>
          <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'Password reset functionality will be implemented soon!')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
    fontSize: 16,
  },
  socialButtonsContainer: {
    gap: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  githubButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#24292e',
  },
  socialIcon: {
    marginRight: 10,
    width: 24,
    height: 24,
    textAlign: 'center',
  },
  socialButtonText: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  helpContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  helpText: {
    color: '#4285F4',
    fontSize: 16,
  },
  forgotContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotText: {
    color: '#1a237e',
    fontSize: 16,
  },
});

export default LoginScreen;
