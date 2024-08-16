import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    Animated,
    Alert
} from 'react-native';
import Voice, {
    SpeechRecognizedEvent,
    SpeechResultsEvent,
    SpeechErrorEvent,
} from '@react-native-voice/voice';
import Icon from 'react-native-vector-icons/FontAwesome';

const VoiceRecognition = ({ modalVisible, setModalVisible, onSpeechCallBack }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const pulseAnimation = useRef(new Animated.Value(0)).current;
    const waveAnimations = useRef(Array(5).fill().map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechRecognized = onSpeechRecognized;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;

        if (modalVisible) {
            startListening();
        } else {
            stopListening();
        }

        return () => {
            stopListening();
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, [modalVisible]);

    useEffect(() => {
        if (isListening && modalVisible) {
            startAnimations();
        } else {
            stopAnimations();
        }
    }, [isListening, modalVisible]);

    const startAnimations = () => {
        // Start the pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnimation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Start the wave animations
        waveAnimations.forEach((animation, index) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animation, {
                        toValue: 1,
                        duration: 500 + index * 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animation, {
                        toValue: 0,
                        duration: 500 + index * 100,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        });
    };

    const stopAnimations = () => {
        pulseAnimation.stopAnimation(() => {
            pulseAnimation.setValue(0);
        });

        waveAnimations.forEach(animation => {
            animation.stopAnimation(() => {
                animation.setValue(0);
            });
        });
    };

    const onSpeechStart = (e) => {
        setIsListening(true);
        console.log('Speech started');
        console.log(e, "speech started")
    };

    const onSpeechEnd = (e) => {
        setIsListening(false);
        setModalVisible(false);
        console.log('Speech ended');
    };

    const onSpeechRecognized = (e) => {
        console.log(e, "speech recognized")
    }

    const onSpeechResults = (e) => {
        const result = e.value[0];
        console.log('Speech results:', result);
        setRecognizedText(result);
        onSpeechCallBack(result);
    };

    const onSpeechError = (e) => {
        console.error('Speech recognition error:', e);
        Alert.alert(
            "Speech Recognition Error",
            "There was an error with speech recognition. Please try again.",
            [{ text: "OK", onPress: () => setModalVisible(false) }]
        );
    };

    const startListening = async () => {
        try {
            console.log('startListening');
            await Voice.start('en-US');
            setIsListening(true);
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            Alert.alert(
                "Error",
                "Failed to start voice recognition. Please check your microphone permissions and try again.",
                [{ text: "OK", onPress: () => setModalVisible(false) }]
            );
        }
    };

    const stopListening = async () => {
        try {
            await Voice.stop();
            setIsListening(false);
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={stopListening}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Animated.View
                            style={{
                                transform: [
                                    {
                                        scale: pulseAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 1.2]
                                        })
                                    }
                                ]
                            }}
                        >
                            <Icon name="microphone" size={50} color="black" />
                        </Animated.View>
                        <Text style={styles.modalText}>Listening...</Text>
                        <View style={styles.waveContainer}>
                            {waveAnimations.map((animation, index) => (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.wave,
                                        {
                                            transform: [{
                                                scaleY: animation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.2, 1]
                                                })
                                            }]
                                        }
                                    ]}
                                />
                            ))}
                        </View>
                        {recognizedText ? <Text style={styles.recognizedText}>{recognizedText}</Text> : null}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    waveContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 50,
        marginTop: 20,
    },
    wave: {
        width: 5,
        height: 50,
        backgroundColor: '#1E90FF',
        marginHorizontal: 2,
    },
    recognizedText: {
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default VoiceRecognition;
