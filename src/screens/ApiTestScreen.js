import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { lightColors, darkColors } from '../theme/colors';
import API_CONFIG from '../config/api';

const ApiTestScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const testEndpoints = async () => {
    setLoading(true);
    setError(null);
    const testResults = {};
    
    try {
      // Test main API endpoint
      const baseUrl = API_CONFIG.PRIMARY_URL;
      testResults.config = {
        primaryUrl: API_CONFIG.PRIMARY_URL,
        alternateUrl: API_CONFIG.ALTERNATE_URL
      };
      
      // Test the test_endpoint
      const testEndpointUrl = `${baseUrl}/test_endpoint.php`;
      testResults.testEndpoint = await testFetch(testEndpointUrl);
      
      // Test schedules endpoint
      const schedulesUrl = `${baseUrl}/schedules/read.php`;
      testResults.schedules = await testFetch(schedulesUrl);
      
      // Test assets endpoint
      const assetsUrl = `${baseUrl}/assets/read.php`;
      testResults.assets = await testFetch(assetsUrl);
      
      setResults(testResults);
    } catch (e) {
      console.error('Test failed:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  const testFetch = async (url) => {
    console.log(`Testing connection to: ${url}`);
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Error parsing JSON:', text);
          return {
            success: false,
            error: 'Invalid JSON response',
            responseTime,
            rawResponse: text.substring(0, 500) // Limit length for display
          };
        }
      } else {
        data = { rawContent: await response.text() };
      }
      
      return {
        success: true,
        status: response.status,
        data: data,
        responseTime
      };
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return {
        success: false,
        error: error.message,
        url
      };
    }
  };
  
  useEffect(() => {
    testEndpoints();
  }, []);

  const renderTestResult = (name, result) => {
    if (!result) return null;
    
    const backgroundColor = result.success ? 
      'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
    const borderColor = result.success ? colors.success : colors.error;
    
    return (
      <View style={[styles.resultCard, { backgroundColor, borderColor }]}>
        <Text style={[styles.resultTitle, { color: colors.text }]}>{name}</Text>
        {result.responseTime && (
          <Text style={[styles.responseTime, { color: colors.text }]}>
            Response time: {result.responseTime}ms
          </Text>
        )}
        {result.success ? (
          <Text style={[styles.successText, { color: colors.success }]}>
            Success: {result.status || 'OK'}
          </Text>
        ) : (
          <Text style={[styles.errorText, { color: colors.error }]}>
            Error: {result.error || 'Unknown error'}
          </Text>
        )}
        <Text style={[styles.dataLabel, { color: colors.text }]}>Details:</Text>
        <ScrollView style={styles.dataContainer}>
          <Text style={[styles.dataText, { color: colors.text }]}>
            {JSON.stringify(result.data || result, null, 2)}
          </Text>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>API Connection Test</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Testing connection to backend API endpoints
      </Text>
      
      <TouchableOpacity 
        style={[styles.refreshButton, { backgroundColor: colors.primary }]}
        onPress={testEndpoints}
        disabled={loading}
      >
        <Text style={styles.refreshButtonText}>
          {loading ? 'Testing...' : 'Refresh Tests'}
        </Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Testing API connections...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorTitle, { color: colors.error }]}>Testing Failed</Text>
            <Text style={[styles.errorMessage, { color: colors.text }]}>{error}</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>API Configuration</Text>
            <View style={[styles.configCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.configText, { color: colors.text }]}>
                Primary URL: {results.config?.primaryUrl || API_CONFIG.PRIMARY_URL}
              </Text>
              <Text style={[styles.configText, { color: colors.text }]}>
                Alternate URL: {results.config?.alternateUrl || API_CONFIG.ALTERNATE_URL}
              </Text>
            </View>
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Results</Text>
            {renderTestResult('Test Endpoint', results.testEndpoint)}
            {renderTestResult('Schedules API', results.schedules)}
            {renderTestResult('Assets API', results.assets)}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
  },
  refreshButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 40,
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  configCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  configText: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  responseTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dataContainer: {
    maxHeight: 200,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default ApiTestScreen;
