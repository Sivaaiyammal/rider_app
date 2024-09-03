import React from 'react'
import { View, Text } from 'react-native'

class NoInternetWarning extends React.Component {
    render() {
        return (
            <View style={{
                width: "100%",
                zIndex: 80000000,
                bottom: 10,
                backgroundColor: "tomato",
                alignItems: "center",
                height: 50,
                justifyContent: "center"
            }}>
                <Text style={{
                    color: "white",
                    fontWeight: "bold"
                }}>You are Offline, Please connect to Internet</Text>
            </View>
        )
    }
}

export default NoInternetWarning