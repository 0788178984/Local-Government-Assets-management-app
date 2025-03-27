import React, { useColorScheme } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';

const ListItem = ({ title, description, ...props }) => {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? darkColors : lightColors;

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 15,
            marginVertical: 5,
            marginHorizontal: 10,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        title: {
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
        },
        description: {
            color: colors.text + '99',
            fontSize: 14,
        },
        iconContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 10,
        },
        icon: {
            marginLeft: 15,
            color: colors.primary,
        }
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
};

export default ListItem; 