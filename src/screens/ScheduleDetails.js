import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, useColorScheme } from 'react-native';
import { format } from 'date-fns';
import { lightColors, darkColors } from '../theme/colors';

const ScheduleDetails = ({ route, navigation }) => {
  const { schedule } = route.params;
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Schedule Details</Text>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Asset Information</Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Asset Name:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{schedule.AssetName || 'Not specified'}</Text>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Location:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{schedule.AssetLocation || 'Not specified'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Schedule Information</Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Type:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{schedule.ScheduleType || 'Not specified'}</Text>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Frequency:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{schedule.Frequency || 'Not specified'}</Text>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Next Due Date:</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {schedule.NextDueDate ? formatDate(schedule.NextDueDate) : 'Not scheduled'}
              </Text>
              
              {schedule.LastCompletedDate && (
                <>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Last Completed:</Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {formatDate(schedule.LastCompletedDate)}
                  </Text>
                </>
              )}
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description:</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {schedule.Description || 'No description provided'}
              </Text>
            </View>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.secondary }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.completeButton]}
              onPress={() => {
                // TODO: Implement mark as completed functionality
                alert('Mark as completed functionality will be implemented here');
              }}
            >
              <Text style={styles.buttonText}>Mark as Completed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
  },
  button: {
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
});

export default ScheduleDetails;
