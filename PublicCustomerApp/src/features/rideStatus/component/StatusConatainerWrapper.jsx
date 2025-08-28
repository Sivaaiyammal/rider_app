import React from "react";
import { View, TouchableOpacity } from "react-native";
import MapIcon from "../../../components/Map/MapIcon";
import { StyleSheet } from "react-native";
import { Fonts ,colors} from "../../../constants/constants";
import CurrentLocationIcon from "../../../assets/icons/CurrentLocationIcon.svg";

const StatusConatainerWrapper = ({ children,backgroundColor ,onMapIconPress}) => {
    return (
        <>
            <View style={[styles.containerTop]}>
                <View style={[styles.containerTop_inner]}>
                    <MapIcon />

                    <TouchableOpacity onPress={onMapIconPress} style={styles.currentLocationIcon}  >
                        <CurrentLocationIcon />
                    </TouchableOpacity>

                </View>
            </View>
            <View style={[styles.container_inner, { backgroundColor: backgroundColor }]}>


                    {children}
                
            </View>
        </>
    )
}

export default StatusConatainerWrapper;

const styles = StyleSheet.create({
    containerTop: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
      containerTop_inner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        paddingVertical:5
      
    
      },
      containerTop_inner_text: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: colors.black,
        textAlign: 'center',
        zIndex: 1,
      },
      container_inner: {
        backgroundColor:'#0f223c',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
       
        
      },
      currentLocationIcon: {
        backgroundColor: 'white',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'white',
        elevation: 10,
        padding:10,
        top:-10
       
      },
})