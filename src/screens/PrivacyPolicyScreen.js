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

const PrivacyPolicyScreen = ({ navigation }) => {
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
          Privacy Policy
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            This Privacy Policy describes how your personal information is collected, used, and shared when you use the Local Government Assets Management Application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            When you use our application, we collect several types of information:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Account Information: We collect information you provide when creating an account, such as your name, email address, username, and password.
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Usage Data: We collect information about how you interact with our application, including the features you use, the time spent on the application, and the actions you take.
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Device Information: We collect information about the device you use to access our application, including the hardware model, operating system, and unique device identifiers.
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Asset and Maintenance Data: We collect and store information about assets, maintenance records, schedules, and other data you enter into the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We use the information we collect to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Provide, maintain, and improve our application
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Process and complete transactions
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Send you technical notices, updates, security alerts, and support messages
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Respond to your comments, questions, and requests
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Monitor and analyze trends, usage, and activities in connection with our application
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Detect, investigate, and prevent fraudulent transactions and other illegal activities
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Sharing Your Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may share your information in the following circumstances:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • With your consent or at your direction
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • With other users of your organization who have appropriate access permissions
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of ourselves or others
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Data Security
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems or your information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Data Retention
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We store the information we collect about you for as long as is necessary for the purpose(s) for which we originally collected it. We may retain certain information for legitimate business purposes or as required by law.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Your Rights
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Accessing, correcting, or deleting your personal information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Objecting to our use of your personal information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Requesting that we limit our use of your personal information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • Requesting portability of your personal information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            To exercise these rights, please contact us using the information provided below.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Changes to This Privacy Policy
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may update this privacy policy from time to time. If we make material changes, we will notify you through the application or by other means, such as email. We encourage you to review the privacy policy whenever you access the application to stay informed about our information practices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have any questions about this privacy policy or our information practices, please contact us at privacy@localgov-assetmgt.com.
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

export default PrivacyPolicyScreen;
