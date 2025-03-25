import React, { useColorScheme } from 'react';
import { View, StyleSheet } from 'react-native';
import RNModal from 'react-native/Libraries/Modal/Modal';
import { lightColors, darkColors } from '../theme/colors';

const Modal = ({ visible, children, ...props }) => {
    const colorScheme = useColorScheme();
    const colors = colorScheme === 'dark' ? darkColors : lightColors;

    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background + 'CC',
            padding: 20,
        },
        modalContent: {
            backgroundColor: colors.card,
            borderRadius: 8,
            padding: 20,
            width: '100%',
            borderColor: colors.border,
            borderWidth: 1,
        },
        text: {
            color: colors.text,
        },
        title: {
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 15,
        },
        button: {
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
        },
        buttonText: {
            color: '#FFFFFF',
        }
    });

    return (
        <RNModal
            visible={visible}
            transparent={true}
            {...props}
        >
            <View style={styles.modalContainer}>
                {children}
            </View>
        </RNModal>
    );
};

export default Modal; 