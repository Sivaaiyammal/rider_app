import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Dimensions, useColorScheme, Appearance } from "react-native";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { styles } from '../../Styles/Account/account'
import { lightThemeStyles , darkThemeStyles } from '../../Styles/ColorSet'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { withTheme } from 'react-native-paper';


import profileImage from '../../Assets/HomeScreen/Profile.webp'


class MyAccountProfileImage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        // let styles = Appearance.getColorScheme() === 'light' ? lightThemeStyles : darkThemeStyles;
        let ColorSet = Appearance.getColorScheme() === 'light' ? lightThemeStyles : lightThemeStyles;


        return (
            <>
                <View style={[styles.container, { zIndex: 100 }]}>
                    <View style={styles.profileImgContainer}>
                        <Image style={styles.profileImg} source={profileImage} />
                    </View>
                </View>
                <View style={[styles.container, { borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>

                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: ColorSet.black, marginTop: 60 }}>{this.props.name}</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6c63ff' }}>{this.props.id}</Text>
                </View>
            </>
        );
    }
}

export default MyAccountProfileImage;
