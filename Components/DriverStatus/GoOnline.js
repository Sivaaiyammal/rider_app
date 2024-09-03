import { Text, View, TouchableOpacity } from 'react-native'
import React, { Component } from 'react'


import { GoOnlineStyle, GoOfflineStyle, GoBreakStyle } from "../../Styles/DriverStyle/StatusPopupStyle"

class GoOnline extends Component {
    constructor(props) {
        super(props)

        this.state = { }
    }
    render() {
        return (
            <View style={GoOnlineStyle.container}>
                <Text style={GoOnlineStyle.text}>Are you sure want to go online</Text>
                <Text style={GoOnlineStyle.text}>and ready to take trips</Text>
                <View style={GoOnlineStyle.buttonContainer}>
                    <TouchableOpacity style={GoOnlineStyle.cancelBtn} onPress={() => this.props.onCancel('online')}>
                        <Text style={GoOnlineStyle.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={GoOnlineStyle.confirmBtn} onPress={() => this.props.onSuccess('online')}>
                        <Text style={GoOnlineStyle.confirmBtnText}>Go Online</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

export default GoOnline