import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Dimensions, useColorScheme, Appearance } from "react-native";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { styles } from '../../Styles/Account/account'
import { lightThemeStyles, darkThemeStyles } from '../../Styles/ColorSet'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import GoBackSvg from '../../Assets/SvgIcons/GobackSvg.svg'


import overlapImage from '../../Assets/account/mask_group.jpg'


class MyAccountHeader extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        // let styles = Appearance.getColorScheme() === 'light' ? lightThemeStyles : darkThemeStyles;
        // console.log("state of myAccount", this.state)
        return (
            <ImageBackground source={overlapImage} resizeMode="cover" style={{ height: 180 }}>
                <View style={[styles.tripHeaderContainer]}>
                    <TouchableOpacity onPress={() => { this.props.onBackClick() }}>
                        <View style={styles.tripHeaderBackBtn}>
                            {/* <Text style={{ fontSize: 24, color: Colors.black }} >{"<"}</Text> */}
                            <GoBackSvg height={12} width={12} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.tripHeaderText} >{this.props.title}</Text>
                    <TouchableOpacity style={{ position: 'relative' }} onPress={() => this.props.onClickNotification()}>
                        <View style={styles.tripHeaderAlarmBtn}>
                            <Text style={{ fontSize: 18 }} >🔔</Text>
                        </View>
                        { this.props.notification.length !== 0 &&
                             <View style={notiStyles.notificationContainer}>
                                <Text style={{ color: '#fff', fontSize: 12 }}>{this.props.notification.length}</Text>
                            </View>
                        }

                    </TouchableOpacity>
                </View>
            </ImageBackground>

        );
    }
}

export default MyAccountHeader;

const notiStyles = StyleSheet.create({
    notificationContainer: { 
        position: 'absolute', 
        top: -5, right: -3, 
        backgroundColor: 'red', 
        borderRadius: 9, 
        height: 18, 
        width: 18, 
        alignItems: 'center', 
        justifyContent: 'center' 
    }
})
