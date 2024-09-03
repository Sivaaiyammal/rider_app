import React from "react";
import { Component } from "react";
import { View, Text, Image, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';

import TripStartEnd from './TripStartEnd';

import FromImage from '../../Assets/Trips/From.webp';
import ToImage from '../../Assets/Trips/To.webp';
import ToggleUpImage from '../../Assets/Trips/ToggleUp.webp';
import ToggleDownImage from '../../Assets/Trips/ToggleDown.webp';
import { utils } from '../../Controllers/utils';
import { SearchAPI } from '../../Controllers/NEMap/Search';

// styles

import { TripStyle } from '../../Styles/Trips/Trip'
import TripStatus from "./TripStatus";

class UpcomingTrip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDetails: this.props.showDetails || false,
            trip: props.trip,
            isLoading: false,
        }
        this.searchAPI = new SearchAPI()
        this.handleToggle = this.handleToggle.bind(this);

    }

    async componentDidMount() {
        // console.log(this.props.trip)
        await this.fetchTrip();
        this.setState({
            trip: this.props.trip
        })
    }

    async fetchTrip() {

        const { trip } = this.props;

        try {
            let startLocationName = await this.searchAPI.reverseGeocode([trip.start_location['x'], trip.start_location['y']]);
            let endLocationName = await this.searchAPI.reverseGeocode([trip.end_location['x'], trip.end_location['y']]);

            // this.props.trip.startLocationName = startLocationName;
            // this.props.trip.endLocationName = endLocationName;

            if (startLocationName != undefined) {
                let { name, country, state, city } = startLocationName.properties;
                let address = (country || '')
                address += state ? ', ' + state : ''
                this.props.trip.startLocationName = name + ',' + city + ',' + state + ',' + country

            }

            if (endLocationName != undefined) {
                let { name, country, state, city } = endLocationName.properties;
                let address = (country || '')
                address += state ? ', ' + state : ''
                this.props.trip.endLocationName = name + ',' + city + ',' + state + ',' + country

            } else {
                // this.props.trip.startLocationName = startLocationName;
                // this.props.trip.endLocationName = endLocationName;
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                // leave abort error no need to handle it
            } else {
                throw error;
            }
        }


    }

    async handleCancelTrip(trip) {
        this.setState({
            isLoading: true
        })

        let data = await this.props.onCacelTrip(trip || {})

        if (data) {
            this.setState({
                isLoading: false
            })
        }
    }

    handleToggle() {
        this.setState({
            showDetails: !this.state.showDetails
        })
    }

    render() {

        let trip = this.state.trip || {}

        return (
            <View style={[TripStyle.container]}>
                <View style={TripStyle.innerContainer}>
                    <View>
                        <Text style={TripStyle.tripId}>Pickup/Checkin</Text>
                        <Text style={TripStyle.tripTime}>{utils.formatISOTo12HourClock(trip.pickuptime)}</Text>
                    </View>
                    <TripStatus />
                    {
                        this.state.showDetails ?

                            <View>
                                <TripStartEnd tripDetails={trip} />
                            </View>

                            :

                            null
                    }

                </View>
                {
                    this.state.showDetails ?
                        <Pressable style={[TripStyle.button, { backgroundColor: "#ffd6d6", width: 150 }]} onPress={() => { this.handleCancelTrip(trip) }}>
                            {this.state.isLoading ? <ActivityIndicator size="small" color="#fff" /> :
                                <Text style={[TripStyle.buttonText, { color: "red" }]}>Cancel Trip</Text>}
                        </Pressable>
                        :
                        null
                }
                <TouchableOpacity style={TripStyle.toggleIconContainer} onPress={() => this.handleToggle()}>
                    <Image style={TripStyle.toggleIcon} source={this.state.showDetails ? ToggleUpImage : ToggleDownImage} />
                </TouchableOpacity>
            </View>
        )
    }
}

export default UpcomingTrip;