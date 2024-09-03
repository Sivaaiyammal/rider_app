import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';


// images

import DriverActive from "../../Assets/HomeScreen/DriverActive.webp"
import DriverIdle from "../../Assets/HomeScreen/DriverIdle.webp"
import DriverBreak from "../../Assets/HomeScreen/DriverBreak.webp"
import CloseStatus from "../../Assets/HomeScreen/CloseStatus.webp"

// styles
import { homeStatusStyle } from "../../Styles/DriverStyle/StatusPopupStyle"
import DriverSTatus from './DriverStatus';
import { flexStyle } from '../../Styles/Common/Common'


const DriverStatusBarMenu = ({ onStatusChanged, activeIcon, showStatus, breakTimer, loading }) => {
    const [isPopupVisible, setPopupVisible] = useState(false);

    const togglePopup = () => {
        setPopupVisible(!isPopupVisible);
    };
    const icon = isPopupVisible ? CloseStatus : activeIcon == "online" ? DriverActive : activeIcon == "offline" ? DriverIdle : DriverBreak
    let iconBackground = activeIcon == "online" ? "#299865" : activeIcon == "offline" ? "tomato" : "#7268ff"
    return (
        <>
            {
                isPopupVisible &&
                <View style={[styles.optionsContainer, flexStyle.acjc]}>
                    <DriverSTatus onStatusChanged={(status, breakTime) => {
                        togglePopup()
                        onStatusChanged(status, breakTime)
                    }} currentStatus={activeIcon} />
                </View>
            }

            <View style={styles.container}>
                <View style={{justifyContent:'center',alignItems: 'center'}}>

                    {
                        loading ?
                            <ActivityIndicator size={"medium"} />
                            :
                            <TouchableOpacity
                                onPress={togglePopup}
                                style={[
                                    homeStatusStyle.button,
                                    { backgroundColor: iconBackground }
                                ]}>
                                <View style={homeStatusStyle.iconContainer}>
                                    <Image
                                        style={homeStatusStyle.icon}
                                        source={icon}
                                    />
                                </View>
                            </TouchableOpacity>
                    }
                </View>

            </View>
        </>
    )
}



const styles = StyleSheet.create({
    container: {
        position: 'relative',
        top: -25,
    },
    optionsContainer: {
        position: 'absolute',
        bottom: 100,
        width: '100%',
        left: 0,
    }
});

export default DriverStatusBarMenu;
