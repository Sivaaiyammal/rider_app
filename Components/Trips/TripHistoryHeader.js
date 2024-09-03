import React from "react";
import { Component } from "react";

import { View, Text, Image, TouchableOpacity } from 'react-native';
// images

import LeftArrowImage from '../../Assets/HomeScreen/InstantTrips/LeftArrow.webp'

// styles
import { TripHeaderStyles } from '../../Styles/Trips/TripHeader'

class TripHistoryHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (<View style={TripHeaderStyles.container}>
            <Text style={TripHeaderStyles.text}>{this.props.headerText || "Trip History"}</Text>
            <TouchableOpacity
                onPress={() => this.props.onBackPress()}
                style={TripHeaderStyles.imageContainer}>
                <Image source={LeftArrowImage} style={TripHeaderStyles.image} />
            </TouchableOpacity>
        </View>)
    }
}

export default TripHistoryHeader;