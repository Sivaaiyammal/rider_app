import React from "react";
import { Component } from "react";
import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native';
import { SearchAPI } from '../../Controllers/NEMap/Search';
import { utils } from '../../Controllers/utils';

import TripStartEnd from './TripStartEnd';

import FromImage from '../../Assets/Trips/From.webp';
import ToImage from '../../Assets/Trips/To.webp';
import ToggleUpImage from '../../Assets/Trips/ToggleUp.webp';
import ToggleDownImage from '../../Assets/Trips/ToggleDown.webp';

// styles

import { TripStyle } from '../../Styles/Trips/Trip'
import TripStats from "../../Components/Trips/TripStats";

class Trip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDetails: this.props.showDetails || false,
            trip: props.trip,
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

    handleToggle() {
        this.setState({
            showDetails: !this.state.showDetails
        })
    }

    render() {

        let trip = this.state.trip || {}

        return (
            <View style={TripStyle.container}>
                <View style={TripStyle.innerContainer}>
                    <View>
                        <Text style={TripStyle.tripId}>Trip ID : {trip.request_id}</Text>
                        <Text style={TripStyle.tripTime}>{utils.formatDateAndTime(trip.start_time)} - {utils.formatDateAndTime(trip.end_time)}</Text>
                    </View>
                    {
                        this.state.showDetails ?

                            <View>
                                <TripStats stats={[
                                    { header: 'Distance', value: '12 Km' },
                                    { header: 'Duration', value: '20 mins' },
                                    { header: 'Type', value: trip.trip_type },
                                    { header: 'Fare', value: 'Rs 100.0' }
                                ]} />
                                <TripStartEnd tripDetails={trip} />
                            </View>

                            :

                            null
                    }

                </View>
                {
                    this.state.showDetails ?
                        <Pressable style={TripStyle.button}>
                            <Text
                                onPress={() => this.props.detailedViewCallback(trip)}
                                style={TripStyle.buttonText}
                            >Check Detailed View</Text>
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

export default Trip;