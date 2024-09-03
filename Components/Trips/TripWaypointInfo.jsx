import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { SearchAPI } from '../../Controllers/NEMap/Search'


// styles

import { TripSummaryStyle } from '../../Styles/Trips/Summary'
import { TripscreenStyles } from '../../Styles/NOTDriverStyles/TripStyles'

// images

import EndMarkerImage from '../../Assets/Trips/Summary/EndMarker.svg'
import StartMarkerImage from '../../Assets/Trips/Summary/StartMarker.webp'

export default function TripWaypointInfo({ showDetailedViewCallback,trip,pickupaddress, dropaddress }) {


    return (
        <View style={TripscreenStyles.tripInfoBox}>
            <View style={[TripSummaryStyle.location]}>
                <Text style={TripSummaryStyle.name}>Start Location</Text>
                <Text style={TripSummaryStyle.address}>{pickupaddress}</Text>
                <Image source={StartMarkerImage} style={[TripSummaryStyle.marker, { left: -9.5, top: -2 }]} />
            </View>

            <View style={[TripSummaryStyle.location, { borderLeftColor: 'transparent' }]}>
                <Text style={TripSummaryStyle.name}>End Location</Text>
                <Text style={TripSummaryStyle.address}>{dropaddress}</Text>
                <EndMarkerImage style={TripSummaryStyle.marker} />
            </View>
            {
                showDetailedViewCallback && <TouchableOpacity style={TripscreenStyles.arrowRight} onPress={() => showDetailedViewCallback(trip)}>
                    <Icon name="chevron-right" size={18} color="black" />
                </TouchableOpacity>
            }

        </View>
    )
}