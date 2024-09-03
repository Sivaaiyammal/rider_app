import { Text, View, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native'
import React, { Component } from 'react'
import OTPTextInput from 'react-native-otp-textinput';


// style
import { PopupScreen } from "../../Styles/DriverStyle/ReadyForPickupStyle"
import { otpStyles } from "../../Styles/DriverStyle/OTPstyle"
import LeftArrowImage from '../../Assets/HomeScreen/InstantTrips/LeftArrow.webp'

// image
// import LeftArrowImage from '../../Assets/HomeScreen/InstantTrips/LeftArrow.webp'

import OTPverifiedImage from "../../Assets/HomeScreen/OTPverified.webp"
import { AlertStyle, BottomStyle } from "../../Styles/DriverStyle/AlertStyle"
import NotShow from "../../Assets/DriverAppIcons/not.webp"
import SmallScreenLoader from '../../Components/Loaders/SmallScreenLoader';
import ButtonSecondaryRect from '../Buttons/ButtonSecondaryRect';
class CustomerLocationReachedPopup extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false
        }
    }

    render = () => {
        const { header, content } = this.props

        return (
            <Animated.View style={[PopupScreen.popupScreen]}>
                {
                    this.state.loading ?
                        <SmallScreenLoader /> : null
                }
                <View style={otpStyles.container}>
                    <View>
                        <Text style={styles.header}>
                            {header}
                        </Text>
                        <Text style={styles.content}>
                            {content}
                        </Text>
                    </View>
                    <View>
                        <ButtonSecondaryRect
                            name="Enter Otp"
                            onPress={this.props.onOTPClick}
                            bgColor="black"
                            textColor="white"
                            borderColor="black"
                            minWidth="100%"
                            fontSize={25}
                        />
                        <ButtonSecondaryRect
                            name="Alert Passanger"
                            onPress={this.props.onAlert}
                            bgColor="rgba(255,0,0,0.1)"
                            textColor="tomato"
                            minWidth="100%"
                        />
                    </View>
                </View>
            </Animated.View>
        )
    }
}

export default CustomerLocationReachedPopup

const styles = StyleSheet.create({
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15
    },
    content: {
        textAlign: 'center'
    }
})


