import { Text, View, TouchableOpacity } from 'react-native'
import React, { Component } from 'react'
import { GoOnlineStyle, GoOfflineStyle, GoBreakStyle } from "../../Styles/DriverStyle/StatusPopupStyle"

export class GoOffline extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        return (
            <View style={GoOfflineStyle.container}>
                <Text style={GoOfflineStyle.text}>Are you sure want to {'\n'} Go Offline</Text>
                <View style={GoOfflineStyle.buttonContainer}>
                    <TouchableOpacity style={GoOfflineStyle.cancelBtn} onPress={() => this.props.onCancel("idle")}>
                        <Text style={GoOfflineStyle.cancelBtnText}>No, Be online</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={GoOfflineStyle.confirmBtn} onPress={() => this.props.onSuccess('idle')}>
                        <Text style={GoOfflineStyle.confirmBtnText}>Yes, go offline</Text>
                    </TouchableOpacity>

                </View>
            </View>
        )
    }
}

export default GoOffline