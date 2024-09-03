import React from "react";
import { Component } from "react";
import { View, Text, Image } from 'react-native';

import FromImage from '../../Assets/Trips/From.webp';
import ToImage from '../../Assets/Trips/To.webp';
import { utils } from '../../Controllers/utils';

// styles

import { TripStyle } from '../../Styles/Trips/Trip'

class TripStartEnd extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }


    render() {

        let { tripDetails } = this.props;

        return (

            <View>
                <View style={TripStyle.location}>
                    <View>
                        <Image style={TripStyle.locationImage} source={FromImage} />
                    </View>
                    <View>
                        <Text style={TripStyle.locationText}>{tripDetails.startLocationName}</Text>
                        <Text style={TripStyle.locationTimeText}>{utils.formatDateAndTime(tripDetails.in_time || tripDetails.start_time)}</Text>
                    </View>
                </View>
                <View style={TripStyle.location}>
                    <View>
                        <Image style={TripStyle.locationImage} source={ToImage} />
                    </View>
                    <View>
                        <Text style={TripStyle.locationText}>{tripDetails.endLocationName}</Text>
                        <Text style={TripStyle.locationTimeText}>{utils.formatDateAndTime(tripDetails.out_time || tripDetails.end_time)}</Text>
                    </View>
                </View>
            </View>


        )
    }
}

export default TripStartEnd;