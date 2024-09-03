import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';


const TimerButton = ({ duration = 10, onTimeout, onPress, name,textColor,bgColor }) => {
    const [timer, setTimer] = useState(duration);
    const widthAnim = useRef(new Animated.Value(0)).current; // Animation value for width

    useEffect(() => {
        // Animation for the progress bar
        Animated.timing(widthAnim, {
            toValue: 1,
            duration: duration * 1000, // Convert seconds to milliseconds
            useNativeDriver: false, // Width animation does not support native driver
        }).start();

        // Timer countdown logic
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer === 1) {
                    clearInterval(interval);
                    if (onTimeout) onTimeout(); // Callback when timer ends
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval); // Clean up on unmount or re-render
    }, [duration, onTimeout]);

    // Animated width calculation
    const width = widthAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'], // From 0 to 100% of the parent View's width
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.button,{backgroundColor:bgColor}]} onPress={onPress}>
                <Text style={[styles.buttonText,{color:textColor}]}>{name} ({timer}s)</Text>
                <Animated.View style={[styles.progressBar, { width }]} />
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden', // Ensure the progress bar does not overflow the button boundaries
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        top: 0,
        backgroundColor: 'rgba(255,0,0,0.1)',
    },
});

export default TimerButton