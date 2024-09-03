
import React, { Component } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

class QuestionModal extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>{this.props.question}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => {
                                this.props.onConfirm();
                            }}>
                            <Text style={styles.confirmButtonText}>{this.props.confirmBtnText || 'Confirm'}</Text>
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                this.props.onCancel()
                            }}>
                            <Text style={styles.cancelButtonText}>{this.props.cancelBtnText || 'Cancel'}</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    centeredView: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100000,
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    modalView: {
        // margin: 20,
        width:"90%",
        backgroundColor: 'rgba(255,255,255,1)',
        borderRadius:15,
        padding: 35,
        margin: 20,
        alignItems: 'center',
        justifyContent:'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        color:'#000'
    },
    buttonContainer: {
        flexDirection: 'row',
        // width: '100%'
    },
    confirmButton: {
        backgroundColor: '#007bff', // Blue color
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        margin: 10,
        fontWeight: "bold"
    },
    confirmButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight:'bold'
    },
    cancelButton: {
        borderColor: '#ff0000', // Red color
        borderWidth: 2,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        margin: 10,
        backgroundColor: 'transparent',

    },
    cancelButtonText: {
        color: '#ff0000', // Red color
        textAlign: 'center',
        fontWeight: "bold"

    },
});

export default QuestionModal;
