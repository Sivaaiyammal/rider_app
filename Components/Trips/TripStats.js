import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { TripStyle } from '../../Styles/Trips/Trip'

class TripStats extends Component {
    render() {
        return (
            <View style={TripStyle.tripStats}>
                {
                    this.props.stats.map((stat, index) => {
                        return (
                            <View key={index}>
                                <Text style={TripStyle.tripStatsHeaderText}>{stat.header}</Text>
                                <Text style={TripStyle.tripStatsHeaderValueText}>{stat.value ?? "0"}</Text>
                            </View>
                        )

                    })
                }
            </View>
        )
    }
}

export default TripStats;
