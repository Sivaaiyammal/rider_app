import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

import NoticeBellImage from '../../Assets/HomeScreen/NoticeBell.webp'

const DriverAlert = () => {
    const [visible, setVisible] = useState(true); // This can be changed to control visibility from outside

    const handleClose = () => {
        setVisible(false);
    };

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.alertBox}>
                    <View style={styles.notificationIcon}>
                        <Image style={styles.icon} source={NoticeBellImage} />
                        {/* <Text style={styles.iconText}>🔔</Text> */}
                    </View>
                    <Text style={styles.alertText}>Your driver has alerted you that he had reached your location</Text>
                    <TouchableOpacity style={styles.okButton} onPress={handleClose}>
                        <Text style={styles.buttonText}>Ok</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
    },
    alertBox: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    notificationIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#FF7373', // This is a guess based on the image
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    icon: {
        width: 70,
        height: 60
    },
    alertText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    okButton: {
        backgroundColor: '#237b53', // This is a guess based on the image
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 5,
        width: 160,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default DriverAlert;
