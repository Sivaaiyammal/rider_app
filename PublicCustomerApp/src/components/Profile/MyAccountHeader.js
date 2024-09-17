import { ScrollView, Text, TextInput, ImageBackground, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState, useCallback } from 'react';

import BackArrow from '../../assets/image/backArrow.svg';
import OverlapImage from '../../assets/image/account/mask_group.jpg';

import { Colors } from 'react-native/Libraries/NewAppScreen'
import { styles } from '../../styles/Account/account'


const MyAccountHeader = (props) => {

    const { title, onBackClick } = props


    return (
        <ImageBackground
            source={OverlapImage}
            resizeMode="cover"
            style={{ height: 180 }}
        >
            <View style={[styles.tripHeaderContainer]}>
                <TouchableOpacity onPress={() => onBackClick()}>
                    <View style={styles.tripHeaderBackBtn}>
                        <Text style={{ fontSize: 24, color: Colors.black }} >{"<"}</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.tripHeaderText} >{title}</Text>
                <TouchableOpacity>
                    <View style={styles.tripHeaderAlarmBtn}>
                        <Text style={{ fontSize: 18 }} >🔔</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    )
}

export default MyAccountHeader;