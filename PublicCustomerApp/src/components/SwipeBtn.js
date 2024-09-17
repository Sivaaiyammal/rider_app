import React, { Component, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Dimensions, useColorScheme, Appearance } from "react-native";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { styles } from '../styles/Account/account'
import Next from '../assets/image/common/Next.svg'
import GreenNext from '../assets/image/GreenNext.svg'


const SwipeBtn = ({ bgColor, textColor, borderColor, swipeColor, icon, name, onHandleSwipeEnd }) => {
    const [translateX, setTranslateX] = useState(0);

    const onGestureEvent = (event) => {
        const offsetX = event.nativeEvent.translationX;
        setTranslateX(offsetX);
    };

    const onHandlerStateChange = ({ nativeEvent }) => {
        const { oldState, state, translationX } = nativeEvent;
        const screenWidth = Dimensions.get('window').width;
        const threshold = 0.8 * 0.55 * screenWidth;

        if (oldState === State.ACTIVE) {
            setTranslateX(0);
        }

        if (state === State.END && translationX > threshold) {
            onHandleSwipeEnd();
        }
    };

    return (
        <>
            <View style={{ alignItems: 'center' }}>
                <View
                    style={[
                        styles.track,
                        {
                            backgroundColor: bgColor ? bgColor : '#ffe8e8',
                            borderColor: borderColor ? borderColor : '#ff3838'
                        }]}
                >
                    <View
                        style={{
                            backgroundColor: swipeColor ? swipeColor : 'red',
                            height: "100%",
                            position: 'absolute'
                        }}
                    >
                        <Text style={{ width: (translateX > 10 ? translateX : "10") }}>{"   "}</Text>
                    </View>
                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                        maxPointers={1}>
                        <View style={[styles.thumb, { transform: [{ translateX }] }]}>
                            {
                                icon ? <GreenNext width={20} height={20} /> : <Next width={20} height={20} />
                            }
                        </View>
                    </PanGestureHandler>
                    <Text style={[styles.text, { color: textColor ? textColor : '#ff3838' }]}>{name}</Text>
                </View>
            </View>
        </>
    );
}


export default SwipeBtn;