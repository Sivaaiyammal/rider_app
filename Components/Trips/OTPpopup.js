import { Text, View, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native'
import React, { Component } from 'react'
import OTPTextInput from 'react-native-otp-textinput';


// style
import { PopupScreen } from "../../Styles/DriverStyle/ReadyForPickupStyle"
import { otpStyles, styles } from "../../Styles/DriverStyle/OTPstyle"
import LeftArrowImage from '../../Assets/HomeScreen/InstantTrips/LeftArrow.webp'

// image
// import LeftArrowImage from '../../Assets/HomeScreen/InstantTrips/LeftArrow.webp'

import OTPverifiedImage from "../../Assets/HomeScreen/OTPverified.webp"
import { AlertStyle, BottomStyle } from "../../Styles/DriverStyle/AlertStyle"
import NotShow from "../../Assets/DriverAppIcons/not.webp"
import SmallScreenLoader from '../../Components/Loaders/SmallScreenLoader';
class OTPpopup extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            translateY: new Animated.Value(500),
            otpVerified: false,
            otp: '',
            otpCountVerified: false,
            timer: 30,
            timerUP: false
        }
        this.handleOTPBack = this.handleOTPBack.bind(this);
        this.handleOTPchange = this.handleOTPchange.bind(this);
        this.verifyOtpHandler = this.verifyOtpHandler.bind(this);


    }
    tickTimer() {
        this.timerID = setInterval(() => {
            if (this.state.timer > 0) {
                let tick = this.state.timer - 1
                tick = tick < 10 ? '0' + tick : tick
                this.setState({ timer: tick })
            } else {
                clearInterval(this.timerID)
                this.setState({ timerUP: true })
            }
        }, 1000)
    }
    reSendOTP() {
        this.setState({ timerUP: false, timer: 30 })
        this.tickTimer()
    }
    componentDidMount() {
        this.tickTimer()
        Animated.timing(this.state.translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }

    componentWillUnmount() {

    }

    handleOTPchange(otpCount) {

        if (otpCount.length == 4) {
            console.log("isndie")
            this.setState({ otpCountVerified: true })
        } else {
            this.setState({ otpCountVerified: false })
        }
        this.setState({ otp: otpCount })
    }
    async verifyOtpHandler(context) {

        const { otp } = this.state
        return this.props.onOTpVerify(otp)

    }
    handleOTPBack = (context) => {
        context.toggleOTPpopup(false);
        this.setState({ otpVerified: false });
    }

    handleBackwardpopup =  () => {
        Animated.timing(this.state.translateY, {
            toValue: 700,
            duration: 300,
            useNativeDriver: true,
        }).start();
        setTimeout(() => {
            this.props.onBack()
        })
    }

    render = () => {
        const { upperText, lowerText, trip_type } = this.props

        return (
            <Animated.View style={[PopupScreen.popupScreen, { transform: [{ translateY: this.state.translateY }] }]}>
                {
                    this.state.loading ?
                        <SmallScreenLoader /> : null
                }
                <View style={otpStyles.container}>
                    <TouchableOpacity style={popupStyles.backBtn} onPress={() => {
                        this.handleBackwardpopup()
                        // this.props.onBack()
                    }}>
                        <Image style={{ width: 15, height: 15 }} source={LeftArrowImage} />
                    </TouchableOpacity>
                    {/* <View style={otpStyles.closeBtn}> */}
                    {/* <View style={popupStyles.header} > */}

                    <Text style={otpStyles.verifyOTP}>Verify OTP</Text>
                    {/* </View> */}

                    <View style={PopupScreen.borderLine}></View>
                    <View style={otpStyles.verifyOTPbox}>
                        <Text style={{ color: '#212121' }}>{upperText}</Text>
                        <Text style={{ textAlign: 'center', color: '#212121' }}>{lowerText}<Text style={{ fontWeight: '600' }}> {" "}{this.props.name}</Text></Text>
                    </View>
                    <OTPTextInput
                        containerStyle={{ flexDirection: 'row', marginTop: 20 }}
                        inputCount={4}
                        // inputCount={inputCount}
                        textInputStyle={{ width: 40, height: 60, borderColor: 'gray', borderWidth: 1, margin: 5, borderRadius: 5 }}
                        handleTextChange={this.handleOTPchange}
                        focusedBorderColor="#6c63ff"
                    />
                    {
                        this.state.otpVerified ?
                            <View style={otpStyles.verificatinBox}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center", marginTop: 10 }}>
                                    <Image style={{ height: 20, width: 20, marginRight: 10, }} source={OTPverifiedImage} />
                                    <Text style={{ color: '#038710' }}>Verified</Text>
                                </View>
                            </View> : null
                    }
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            marginTop: 10,
                            alignItems: 'center'
                        }
                        }
                        disabled={!this.state.otpCountVerified}
                        onPress={async () => {
                            this.setState({ loading: true })
                            let verified = await this.verifyOtpHandler()
                            this.setState({ loading: false })

                        }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', width: 130, alignItems: 'center', backgroundColor: !this.state.otpCountVerified && (!this.state.otpCountVerified || this.state.otpCountVerified == undefined) ? '#e0e0e0' : 'black', padding: 10, color: 'white', borderRadius: 5 }}>
                            <Text style={{ color: 'white' }}>Verify OTP  </Text>
                        </View>
                    </TouchableOpacity>
                    {
                        this.props.noShowBtn ?
                            <TouchableOpacity style={[BottomStyle.realertBtn, { alignItems: 'center', borderColor: '#bdbdbd', borderWidth: 1, backgroundColor: '#eeeeee', width: "100vw" }]}
                                onPress={() => {
                                    this.props.onNoShow()
                                }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <Image style={{ width: 15, height: 15 }} source={NotShow} />
                                    <Text style={[PopupScreen.enterOTPtext, { color: '#495057' }]}>No Show</Text>
                                </View>
                            </TouchableOpacity> : ""
                    }
                </View>
            </Animated.View>
        )
    }
}

export default OTPpopup

const popupStyles = StyleSheet.create({
    backBtn: {
        position: 'absolute',
        top: 20,
        left: 30,
        padding: 10
    },
})

