import { View, Text } from 'react-native'
import React from 'react'
import { Picker } from '@react-native-picker/picker';

import { noShowStyles } from "../../Styles/DriverStyle/OTPstyle"

export default function DropDownSelect({ data, handleOnChangeValue, value, text }) {

    return (
        <View style={{width:"100%"}}>
            {
                text ? <Text style={{ color: '#212121',marginLeft:20,fontSize:16 }}>{text}</Text> : null
            }
            <View>
                <Picker
                    style={noShowStyles.pickerStyle}
                    selectedValue={value}
                    onValueChange={(itemValue) => {
                        handleOnChangeValue(itemValue);
                    }}
                >
                    {
                        data.map((data, index) => (
                            <Picker.Item key={index} color='black' label={data.label} value={data.value} />
                        ))
                    }
                </Picker>
            </View>

        </View>
    )
}
