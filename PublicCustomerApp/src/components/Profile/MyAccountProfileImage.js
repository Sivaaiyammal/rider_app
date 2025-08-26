import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Dimensions, useColorScheme, Appearance } from "react-native";

import BackArrow from '../../assets/image/backArrow.svg';
import ProfileImage from '../../assets/image/account/Profile.webp';

import { Colors } from 'react-native/Libraries/NewAppScreen'
import { styles } from '../../styles/Account/account'
import { lightThemeStyles, darkThemeStyles } from '../../styles/ColorSet'
import { Fonts } from '../../constants/constants';

const MyAccountProfileImage = (props) => {

    const { id, name } = props

    const ColorSet = Appearance.getColorScheme() === 'light' ? lightThemeStyles : lightThemeStyles;


    return (
        <>
            <View style={[styles.container, { zIndex: 100 }]}>
                <View style={styles.profileImgContainer}>
                    <Image style={styles.profileImg} source={ProfileImage} />
                </View>
            </View>
            <View style={[styles.container, { borderTopLeftRadius: 10, borderTopRightRadius: 10 ,paddingBottom:20}]}>

                <Text style={{ fontSize: 24, fontFamily:Fonts.semi_bold, color: ColorSet.black, marginTop: 60 }}>{name}</Text>
                {/* <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6c63ff' }}>{id}</Text> */}
            </View>
        </>
    )
}

export default MyAccountProfileImage;