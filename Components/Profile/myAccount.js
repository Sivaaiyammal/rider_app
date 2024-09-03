import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Dimensions, useColorScheme, Appearance } from "react-native";
import { HomeScreenContext } from '../HomeScreen'
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { styles as styled, lightThemeStyles, darkThemeStyles } from '../../Styles/Account/account'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { withTheme } from 'react-native-paper';


import overlapImage from '../../Assets/account/mask_group.jpg'
import profileImage from '../../Assets/HomeScreen/Profile.webp'
import timeImage from '../../Assets/Trips/tripDetails/watch_black.webp';
import locationImage from '../../Assets/Trips/tripDetails/trapLocation.webp';
import personImage from '../../Assets/account/person.webp';
import mainPersonImage from '../../Assets/account/MainPerson.webp';
import genderImage from '../../Assets/account/gender.webp';
import emailIcon from '../../Assets/account/email.webp';
import phoneIcon from '../../Assets/account/phone.webp';
import addressIcon from '../../Assets/account/location.webp';
import department from '../../Assets/account/department.webp';
import empIdImage from '../../Assets/account/Emp_id.webp';
import starImage from '../../Assets/account/Star.webp';
import person_mImage from '../../Assets/account/person_m.png';
import caseImage from '../../Assets/account/Case.webp';
import stearingWheelImage from '../../Assets/account/StearingWheel.webp';
import cardImage from '../../Assets/account/Card.webp';
import { ScrollView } from "react-native-gesture-handler";

class MyAccountScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            animation: new Animated.Value(0),
            opacity: new Animated.Value(1),

            translateX: 0,

            theme: Appearance.getColorScheme()

        };

        Appearance.addChangeListener(({ colorScheme }) => {
            this.setState({ theme: colorScheme });
        });

        this.handlePress = this.handlePress.bind(this);

    }

    handlePress = () => {
        this.state.animation.setValue(0);
        this.state.opacity.setValue(1);

        Animated.timing(this.state.animation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
        }).start((finished) => {
            if (finished) {
                Animated.timing(this.state.opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }).start();
            }
        });
    }


    onGestureEvent = (event) => {
        // console.log(event.nativeEvent.translationX);
        const offsetX = event.nativeEvent.translationX;
        this.setState({ translateX: offsetX });
    };

    onHandlerStateChange = ({ nativeEvent }) => {
        const { oldState, state, translationX } = nativeEvent;
        const screenWidth = Dimensions.get('window').width;
        const threshold = 0.8 * 0.55 * screenWidth;

        console.log("screenWidth => ", screenWidth);
        console.log("threshold => ", threshold);
        if (oldState === State.ACTIVE) {
            this.setState({ translateX: 0 });
        }

        if (state === State.END && translationX > threshold) {
            console.log("Logged out");
            // Perform your logout action here
            this.props.navigation.navigate("AuthenticationScreen");
        }
    };

    driverUI = () => {
        return (
            <>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={mainPersonImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Full Name</Text>
                        <Text style={styles.profileItemText}>John Doe</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={personImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Gender</Text>
                        <Text style={styles.profileItemText}>Male</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={phoneIcon} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Phone Number</Text>
                        <Text style={styles.profileItemText}>9876543210</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={emailIcon} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Email Address</Text>
                        <Text style={styles.profileItemText}>ezioauditore@virtualmaze.com</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={cardImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Aadhar ID Number</Text>
                        <Text style={styles.profileItemText}>123456789012</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={cardImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>PAN Number</Text>
                        <Text style={styles.profileItemText}>ABCDE0000F</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={empIdImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>License Number</Text>
                        <Text style={styles.profileItemText}>TN0000000001</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={locationImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Address</Text>
                        <Text style={styles.profileItemText}>#8/25, 2nd Floor, Kambar Street,Alandur, Chennai - 600 016</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <View style={styles.track}>
                        <PanGestureHandler
                            onGestureEvent={this.onGestureEvent}
                            onHandlerStateChange={this.onHandlerStateChange}
                            maxPointers={1}>
                            {/* <View style={styles.square}/> */}
                            <View style={[styles.thumb, { transform: [{ translateX: this.state.translateX }] }]}>
                                <Text style={{ fontSize: 24, color: Colors.black }} >{">"}</Text>
                            </View>
                        </PanGestureHandler>
                        <Text style={styles.text}>SWIPE TO LOGOUT</Text>
                    </View>
                </View>
            </>
        )
    }

    employeeUI = () => {
        return (
            <>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={genderImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Full Name</Text>
                        <Text style={styles.profileItemText}>John Doe</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={personImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Gender</Text>
                        <Text style={styles.profileItemText}>Male</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={phoneIcon} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Phone Number</Text>
                        <Text style={styles.profileItemText}>9876543210</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={department} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Department</Text>
                        <Text style={styles.profileItemText}>Design</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={emailIcon} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Email Address</Text>
                        <Text style={styles.profileItemText}>ezioauditore@virtualmaze.com</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={EmpIdImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>EMP ID</Text>
                        <Text style={styles.profileItemText}>EMP01234</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={locationImage} />
                    </View>
                    <View>
                        <Text style={styles.profileItemHead}>Address</Text>
                        <Text style={styles.profileItemText}>#8/25, 2nd Floor, Kambar Street,Alandur, Chennai - 600 016</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <View style={styles.track}>
                        <PanGestureHandler
                            onGestureEvent={this.onGestureEvent}
                            onHandlerStateChange={this.onHandlerStateChange}
                            maxPointers={1}>
                            {/* <View style={styles.square}/> */}
                            <View style={[styles.thumb, { transform: [{ translateX: this.state.translateX }] }]}>
                                <Text style={{ fontSize: 24, color: Colors.black }} >{">"}</Text>
                            </View>
                        </PanGestureHandler>
                        <Text style={styles.text}>SWIPE TO LOGOUT</Text>
                    </View>
                </View>
            </>
        )
    }

    customerUI = () => {
        return (
            <>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={genderImage} />
                    </View>
                    <View>
                        <Text style={{ color: '#757575', fontSize: 10 }}>Full Name</Text>
                        <Text style={styles.profileItemText}>John Doe</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={personImage} />
                    </View>
                    <View>
                        <Text style={{ color: '#757575', fontSize: 10 }}>Gender</Text>
                        <Text style={styles.profileItemText}>Male</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={phoneIcon} />
                    </View>
                    <View>
                        <Text style={{ color: '#757575', fontSize: 10 }}>Phone Number</Text>
                        <Text style={styles.profileItemText}>9876543210</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={department} />
                    </View>
                    <View>
                        <Text style={{ color: '#757575', fontSize: 10 }}>Department</Text>
                        <Text style={styles.profileItemText}>Design</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={emailIcon} />
                    </View>
                    <View>
                        <Text style={{ color: '#757575', fontSize: 10 }}>Email Address</Text>
                        <Text style={styles.profileItemText}>ezioauditore@virtualmaze.com</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={EmpIdImage} />
                    </View>
                    <View>
                        <Text style={{ color: '#757575', fontSize: 10 }}>EMP ID</Text>
                        <Text style={styles.profileItemText}>EMP01234</Text>
                    </View>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.profileItemImageContainer}>
                        <Image style={styles.profileItemImage} source={locationImage} />
                    </View>
                    <View>
                        <Text style={{ color: '#757575', fontSize: 10 }}>Address</Text>
                        <Text style={styles.profileItemText}>#8/25, 2nd Floor, Kambar Street,Alandur, Chennai - 600 016</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <View style={styles.track}>
                        <PanGestureHandler
                            onGestureEvent={this.onGestureEvent}
                            onHandlerStateChange={this.onHandlerStateChange}
                            maxPointers={1}>
                            <View style={[styles.thumb, { transform: [{ translateX: this.state.translateX }] }]}>
                            </View>
                        </PanGestureHandler>
                        <Text style={styles.text}>SWIPE TO LOGOUT</Text>
                    </View>
                </View>
            </>
        )
    }


    // styles = this.props.theme === 'light' ? lightThemeStyles : darkThemeStyles;
    render() {
        let styles = Appearance.getColorScheme() === 'light' ? lightThemeStyles : darkThemeStyles;
        // console.log("state of myAccount", this.state)

        return (
            <HomeScreenContext.Consumer>

                {
                    context => (
                        <ScrollView>
                            <View style={styles.tripContainer}>
                                <ImageBackground source={overlapImage} resizeMode="cover" style={{ height: 180 }}>
                                    <View style={[styles.tripHeaderContainer]}>
                                        <TouchableOpacity onPress={() => { context.changeScreen("Home") }}>
                                            <View style={styles.tripHeaderBackBtn}>
                                                <Text style={{ fontSize: 24, color: Colors.black }} >{"<"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <Text style={styles.tripHeaderText} >My Account</Text>
                                        <TouchableOpacity>
                                            <View style={styles.tripHeaderAlarmBtn}>
                                                <Text style={{ fontSize: 18 }} >🔔</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </ImageBackground>
                                <View style={[styles.container, { zIndex: 100 }]}>
                                    <View style={styles.profileImgContainer}>
                                        <Image style={styles.profileImg} source={profileImage} />
                                    </View>
                                </View>
                                <View style={[styles.container, { borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>

                                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: styles.colors.text, marginTop: 60 }}>John Doe</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6c63ff' }}>EMP1234</Text>
                                </View>
                                <View style={styles.distanceContainer}>
                                    <View style={styles.distanceItem}>
                                        <Image style={styles.distanceItemImage} source={starImage} />
                                        <Text style={styles.distanceItemText}>4.5  <Image source={person_mImage} /> 200 </Text>
                                    </View>
                                    <View style={styles.distanceItem}>
                                        <Image style={styles.distanceItemImage} source={caseImage} />
                                        <Text style={styles.distanceItemText}>20</Text>
                                    </View>
                                    <View style={styles.distanceItem}>
                                        <Image style={styles.distanceItemImage} source={timeImage} />
                                        <Text style={styles.distanceItemText}>20 Hrs</Text>
                                    </View>
                                    <View style={styles.distanceItem}>
                                        <Image style={styles.distanceItemImage} source={stearingWheelImage} />
                                        <Text style={styles.distanceItemText}>2 Years</Text>
                                    </View>
                                    <View style={styles.distanceItem}>
                                        <Image style={styles.distanceItemImage} source={locationImage} />
                                        <Text style={styles.distanceItemText}>30 Km</Text>
                                    </View>
                                </View>
                                <Text style={styles.generalText}>The above data is calculated from 01 Jan 2022</Text>
                                <View style={[styles.sizeBox, { borderColor: '#9e9e9e', borderWidth: .8, borderStyle: 'dashed', margin: 30 }]} />
                                {/* (this.props.user === 'driver') ? ( this.driverUI() ) ? ( this.props.user === 'employee' ? ( this.employeeUI() ) : (this.customerUI() ) ) */}
                            </View>
                        </ScrollView>
                    )
                }
            </HomeScreenContext.Consumer>
        );
    }
}

export default MyAccountScreen;
