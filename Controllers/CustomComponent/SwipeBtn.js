import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Dimensions, useColorScheme, Appearance, ActivityIndicator } from "react-native";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { styles } from '../../Styles/Account/account'
import { lightThemeStyles, darkThemeStyles } from '../../Styles/ColorSet'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import Next from '../../Assets/Common/Next.svg'
import GreenNext from '../../Assets/SvgIcons/GreenNext.svg'

class SwipeBtn extends Component {
    constructor(props) {
        super(props); this.state = {
            animation: new Animated.Value(0),
            opacity: new Animated.Value(1),

            translateX: 0,

            theme: Appearance.getColorScheme()

        };
    }

    onGestureEvent = (event) => {
        // console.log(event.nativeEvent.translationX);
        const offsetX = event.nativeEvent.translationX;
        const screenWidth = Dimensions.get('window').width;
        this.setState({ translateX: offsetX });
        // this.setState({ boxWidth : offsetX })
        console.log(offsetX, "======================")
        console.log(this.state.boxWidth, "boxwidth")

    };

    onHandlerStateChange = ({ nativeEvent }) => {
        // console.log(this.props,"======================")
        const { oldState, state, translationX } = nativeEvent;
        const screenWidth = Dimensions.get('window').width;
        const threshold = 0.8 * 0.55 * screenWidth;

        // console.log("screenWidth => ", screenWidth);
        // console.log("threshold => ", threshold);

        if (oldState === State.ACTIVE) {
            this.setState({ translateX: 0 });
            this.setState({ boxWidth: "1%" })
        }

        if (state === State.END && translationX > threshold) {
            // console.log("Logged out");
            // Perform your logout action here
            // this.props.navigation.navigate("AuthenticationScreen");
            this.props.onHandleSwipeEnd();
        }
    };

    render() {
        // let styles = Appearance.getColorScheme() === 'light' ? lightThemeStyles : darkThemeStyles;
        const { bgColor, textColor, borderColor, swipeColor, icon, name, loading } = this.props

        return (
            <>
                <View style={{ alignItems: 'center' }}>
                    <View style={[styles.track, { backgroundColor: bgColor ? bgColor : '#ffe8e8', borderColor: borderColor ? borderColor : '#ff3838' }]}>

                        {
                            loading ?
                                <ActivityIndicator />

                                :
                                <>
                                    <View style={{ backgroundColor: swipeColor ? swipeColor : 'red', height: "100%", position: 'absolute' }} >
                                        <Text style={{ width: (this.state.translateX > 10 ? this.state.translateX : "10") }}>{"   "}</Text>
                                    </View>
                                    <PanGestureHandler
                                        onGestureEvent={this.onGestureEvent}
                                        onHandlerStateChange={this.onHandlerStateChange}
                                        maxPointers={1}>
                                        {/* <View style={styles.square}/> */}
                                        <View style={[styles.thumb, { transform: [{ translateX: this.state.translateX }] }]}>
                                            {/* <Text style={{ fontSize: 24, color: Colors.black }} >{">"}</Text> */}
                                            {
                                                icon ? <GreenNext width={20} height={20} /> : <Next width={20} height={20} />
                                            }

                                        </View>
                                    </PanGestureHandler>
                                    <Text style={[styles.text, { color: textColor ? textColor : '#ff3838' }]}>{name}</Text>
                                </>
                        }

                    </View>
                </View>
            </>
        );
    }
}

export default SwipeBtn;
