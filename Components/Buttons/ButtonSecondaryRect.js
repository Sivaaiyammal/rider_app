
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';


const defaultStyle = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5
}

export default function ButtonSecondaryRect(props) {
    let { name, onPress, bgColor, textColor, maxWidth,minWidth,borderColor,fontSize, iconName } = props;
    textColor = textColor || "black";
    maxWidth = maxWidth || "100%";

    return (
        <View style={[defaultStyle]}>
            <TouchableOpacity
                onPress={onPress}
                style={[
                    {
                        backgroundColor: bgColor,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderColor: borderColor || textColor,
                        borderWidth: 1,
                        maxWidth: maxWidth,
                        minWidth: minWidth,
                        borderRadius: 10,
                        marginVertical: 10,
                    },
                    defaultStyle
                ]}>
                    <Text style={{ color: textColor,fontWeight: 500,textTransform:"uppercase"  }}>{name}</Text>
                    {/* <Icon name={iconName || 'check'} size={fontSize || 18} color={textColor} /> */}
            </TouchableOpacity>
        </View>

    )
}