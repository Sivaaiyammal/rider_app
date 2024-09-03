
import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import emptyTrips from '../../Assets/Trips/tripDetails/emptyTrips.png'

class NoTripsFound extends Component {
    render() {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 }}>
                <Image
                    source={this.props.img || emptyTrips}
                    style={{ width: 300, height: 500 }}
                />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#a9a9a9' }}>{this.props.text || "No Trips Found"}</Text>
            </View>
        );
    }
}

export default NoTripsFound;
