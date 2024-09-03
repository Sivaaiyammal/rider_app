import React, { Component } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';

import TicketIcon from '../../Assets/Tickets/TicketIcon.png'
class TicketSubmission extends Component {


    render() {
        return (
            <View style={{ backgroundColor: "white", padding: 10,borderRadius:50,position: 'absolute', top: 10,left:3 }}>
                <TouchableOpacity
                    onPress={this.props.onClick}
                >
                    <Image source={TicketIcon} style={{ height: 25, width: 25 }} />
                </TouchableOpacity>
            </View>
        );
    }
}

export default TicketSubmission;
