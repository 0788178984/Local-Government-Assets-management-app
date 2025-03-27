import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightColors, darkColors } from '../theme/colors';

const TermsOfServiceScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Terms of Service
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            By accessing or using the Local Government Assets Management Application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. Description of Service
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The Local Government Assets Management Application is a tool designed for local government entities to manage their assets, maintenance records, and related data. The application provides features for tracking assets, scheduling maintenance, generating reports, and managing user accounts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. User Accounts
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            To use certain features of the application, you may be required to create a user account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. User Responsibilities
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You agree to use the application only for lawful purposes and in accordance with these Terms of Service. You agree not to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Use the application in any way that violates any applicable local, state, national, or international law or regulation
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Attempt to gain unauthorized access to any part of the application
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Interfere with or disrupt the application or servers or networks connected to the application
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Use the application to transmit any malware, spyware, or other malicious code
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Data Security and Privacy
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We take data security and privacy seriously. Please refer to our Privacy Policy for information on how we collect, use, and protect your data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Intellectual Property
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The application and its original content, features, and functionality are owned by the Local Government Assets Management team and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Termination
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may terminate or suspend your account and access to the application immediately, without prior notice or liability, for any reason, including, without limitation, if you breach these Terms of Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Limitation of Liability
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            In no event shall the Local Government Assets Management team be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. Changes to Terms
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We reserve the right to modify or replace these Terms of Service at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have any questions about these Terms of Service, please contact us at support@localgov-assetmgt.com.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text }]}>
            Last updated: March 26, 2025
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 16,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default TermsOfServiceScreen;
