import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';


// styles

import { TripSummaryStyle } from '../../Styles/Trips/Summary'
import { utils } from '../../Controllers/utils';

// images

// import MarkerImage from '../../Assets/Trips/Summary/Marker.webp'
// import EndMarkerImage from '../../Assets/Trips/Summary/EndMarker.webp'
// import StartMarkerImage from '../../Assets/Trips/Summary/StartMarker.webp'

class TripSummaryWaypoints extends Component {
    render() {

        let { tripDetails } = this.props;

        return (
            <View style={TripSummaryStyle.locations}>
                <View style={[TripSummaryStyle.location]}>
                    <Text style={TripSummaryStyle.name}>Start Location</Text>
                    <Text style={TripSummaryStyle.address}>{tripDetails.startLocationName}</Text>
                    <Text style={TripSummaryStyle.time}>{utils.formatDateAndTime(tripDetails.start_time)}</Text>
                    {/* <Image source={StartMarkerImage} style={TripSummaryStyle.marker} /> */}
                </View>
                {

                    tripDetails.waypoints.map((location, index) => {
                        let last = tripDetails.waypoints.length - 1 === index;
                        return (
                            <View style={[TripSummaryStyle.location]} key={index}>
                                <Text style={TripSummaryStyle.name}>WayPoint - {index + 1}</Text>
                                <Text style={TripSummaryStyle.address}>{location.location_info}</Text>
                                <Text style={TripSummaryStyle.time}>{utils.formatDateAndTime(location.arrival_time)}</Text>
                                {/* <Image source={MarkerImage} style={TripSummaryStyle.marker} /> */}
                            </View>
                        )
                    })
                }

                <View style={[TripSummaryStyle.location, { borderLeftColor: 'transparent' }]}>
                    <Text style={TripSummaryStyle.name}>End Location</Text>
                    <Text style={TripSummaryStyle.address}>{tripDetails.endLocationName}</Text>
                    <Text style={TripSummaryStyle.time}>{utils.formatDateAndTime(tripDetails.end_time)}</Text>
                    {/* <Image source={EndMarkerImage} style={TripSummaryStyle.marker} /> */}
                </View>

            </View>
        );
    }
}

export default TripSummaryWaypoints;
