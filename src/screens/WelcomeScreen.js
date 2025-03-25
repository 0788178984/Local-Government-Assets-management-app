import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showContactInfo = () => {
    Alert.alert(
      'Contact Details',
      'Email: asmart@gmail.com\nPhone: +256779654710',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  const handleGetStarted = async () => {
    try {
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to connect to the server. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image 
          source={require('../../assets/logo1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>Local Government Assets Management</Text>
        <Text style={styles.motto}>Efficiently Managing Our Resources Together</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.buttonContainer, 
          { 
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Developer Info Section */}
      <View style={styles.developerSection}>
        <View style={styles.developerPhotoContainer}>
          <Image 
            source={require('../../assets/ASIIMWE.png')}
            style={styles.developerPhoto}
          />
        </View>
        <View style={styles.developerInfo}>
          <Text style={styles.developerName}>ASIIMWE LUCKY</Text>
          <Text style={styles.developerTitle}>Lead Developer</Text>
        </View>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={showContactInfo}
        >
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  developerSection: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 139, 0.1)',
  },
  developerPhotoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00008B',
  },
  developerPhoto: {
    width: '100%',
    height: '100%',
  },
  developerInfo: {
    flex: 1,
    paddingHorizontal: 15,
  },
  developerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00008B',
  },
  developerTitle: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    backgroundColor: '#00008B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    color: '#333',
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: "#00008B",
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 36,
  },
  motto: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: "#00008B",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
