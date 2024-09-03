
import React, { Component } from 'react';
import { View } from 'react-native';
import NoTripsFound from '../Trips/NoTripsFound';

class AppCrashed extends Component {
    render() {
        return (
            <View>
                <NoTripsFound text="App Crashed due to some technical issues" />
            </View>
        );
    }
}

export default AppCrashed;
