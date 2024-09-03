import React, { Component } from 'react';
import { View, Text } from 'react-native';
import TripHistoryHeader from '../../Components/Trips/TripHistoryHeader';
import TripHistory from '../Trips/TripHistory/TripHistory';
import UpcomingTrips from '../Trips/UpcomingTrips/UpcomingTrips';
import YourRidesFilter from './YourRidesFilter';

class YourRides extends Component {

    constructor(props) {
        super(props)
        this.state = {
            activeTab: 'tripHistory'
        }
    }

    toggleTab(tab) {
        this.setState({
            activeTab: tab
        })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <TripHistoryHeader headerText="Your Rides" />
                <YourRidesFilter
                    onTripHistorySelected={() => { this.toggleTab('tripHistory') }}
                    onUpcomingTripsSelected={() => { this.toggleTab('upcomingTrips') }} />
                {
                    this.state.activeTab == 'tripHistory' ? <TripHistory /> : <UpcomingTrips />
                }
            </View>
        );
    }
}

export default YourRides;
