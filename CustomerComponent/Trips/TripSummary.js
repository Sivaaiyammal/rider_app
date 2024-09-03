import React, { Component } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { Rating } from 'react-native-ratings';

import NEMap from '../../Components/Native/NEMap';

// images
import DistanceImage from '../../Assets/Trips/Summary/Distance.webp'
import DurationImage from '../../Assets/Trips/Summary/Duration.webp'
import RideTypeImage from '../../Assets/Trips/Summary/RideType.webp'
import EscortImage from '../../Assets/Trips/Summary/Escort.webp'
import LeftArrowImage from '../../Assets/HomeScreen/InstantTrips/LeftArrow.webp'
import { utils } from '../../Controllers/utils';

// styles

import { TripSummaryStyle } from '../../Styles/Trips/Summary'
import TripSummaryWaypoints from './TripSummaryWaypoints';



class TripSummary extends Component {
    render() {

        let { data } = this.props;

        return (
            <View style={TripSummaryStyle.container}>
                <View style={{ padding: 20 }}>
                    <TouchableOpacity onPress={this.props.onClose}>
                        <Image source={LeftArrowImage} style={{ width: 16, height: 16 }} />
                    </TouchableOpacity>
                </View>
                <NEMap mapStyle={TripSummaryStyle.map} />
                <ScrollView>
                    <View style={TripSummaryStyle.header}>
                        <Text style={TripSummaryStyle.date}>{utils.formatDateAndTime(data.start_time)}</Text>
                        <Text style={TripSummaryStyle.tripId}>Trip ID : {data.request_id}</Text>

                    </View>
                    <View style={[TripSummaryStyle.header, { marginTop: 20 }]}>
                        <Text style={TripSummaryStyle.date}>Location Details</Text>
                    </View>


                    <View style={TripSummaryStyle.locationDetails}>

                        <TripSummaryWaypoints tripDetails={data} />


                    </View>

                    <View style={TripSummaryStyle.header}>
                        <Text style={TripSummaryStyle.date}>Trip Details</Text>
                    </View>

                    <View style={TripSummaryStyle.tripDetails}>
                        {/* Distance */}
                        <View style={TripSummaryStyle.detailRow}>
                            <Image source={DistanceImage} style={TripSummaryStyle.tripDetailIcon} />
                            <Text style={TripSummaryStyle.detailLabel}>Distance</Text>
                            <Text style={TripSummaryStyle.detailValue}>{data.distance} km</Text>
                        </View>

                        {/* Duration */}
                        <View style={[TripSummaryStyle.detailRow, { backgroundColor: 'rgba(255, 153, 0, 0.1)' }]}>
                            <Image source={DurationImage} style={TripSummaryStyle.tripDetailIcon} />
                            <Text style={TripSummaryStyle.detailLabel}>Duration</Text>
                            <Text style={TripSummaryStyle.detailValue}>{data.duration} min</Text>
                        </View>

                        {/* Ride Type */}
                        <View style={[TripSummaryStyle.detailRow, { backgroundColor: 'rgba(41, 152, 101, 0.1)' }]}>
                            <Image source={RideTypeImage} style={TripSummaryStyle.tripDetailIcon} />

                            <Text style={TripSummaryStyle.detailLabel}>Ride Type</Text>
                            <Text style={TripSummaryStyle.detailValue}>{data.trip_type}</Text>
                        </View>

                        {/* Escort */}
                        <View style={[TripSummaryStyle.detailRow, { backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}>
                            <Image source={EscortImage} style={[TripSummaryStyle.tripDetailIcon]} />

                            <Text style={TripSummaryStyle.detailLabel}>Escort</Text>
                            <Text style={TripSummaryStyle.detailValue}>Yes</Text>
                        </View>

                        {/* Any additional details you want to include */}
                        {/*...*/}
                    </View>

                    <View style={TripSummaryStyle.header}>
                        <Text style={TripSummaryStyle.date}>Rating</Text>

                    </View>

                    <View style={TripSummaryStyle.profile}>
                        <Image source={EscortImage} style={TripSummaryStyle.profilePic} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Ezio Auditore</Text>
                    </View>

                    <View style={TripSummaryStyle.ratingContainer}>
                        <Rating
                            type="star"
                            ratingCount={5}
                            imageSize={30}
                            onFinishRating={(rating) => {
                                console.log("Rated:", rating);
                            }}
                        />
                        <TextInput
                            style={TripSummaryStyle.textArea}
                            underlineColorAndroid="transparent"
                            placeholder="Comments"
                            placeholderTextColor="grey"
                            numberOfLines={10}
                            multiline={true}
                            onChangeText={(value) => setText(value)}
                        />
                        <TouchableOpacity style={TripSummaryStyle.submitButton} onPress={this.props.onClose}>
                            <Text style={TripSummaryStyle.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>



                    <TouchableOpacity style={TripSummaryStyle.homeButton}>
                        <Text style={TripSummaryStyle.buttonText}>Home</Text>
                    </TouchableOpacity>
                </ScrollView>

            </View>
        );
    }
}


export default TripSummary;
