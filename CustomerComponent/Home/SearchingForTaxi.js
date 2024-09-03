import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';

// Custom Modules

import {NoTripFoundStyles} from '../../Styles/Home/Home'

// Images

import WarningImage from '../../Assets/HomeScreen/Warning.webp'
import NotFoundImage from '../../Assets/HomeScreen/NotFound.webp'
class SearchingForTaxi extends Component{

    constructor(props) {
        super(props);
        this.state = {
            locationAddress: "12, Kambar Street Alandur, Chennai - 600016",
        }
    }

    render(){

        return (<View style={[NoTripFoundStyles.container,{backgroundColor: "white"}]} >
            <View style={NoTripFoundStyles.warningContainer}>
                <Image style={NoTripFoundStyles.warningImage} source={WarningImage} />
                <Text style={NoTripFoundStyles.warningText}>Searching For Taxi</Text>
            </View>
            <View>
                <Text style={[NoTripFoundStyles.warningInfo,{fontWeight: "bold",fontSize:14}]}>
                    Pickup - 10:00 AM
                </Text>
                <Text style={NoTripFoundStyles.warningInfo}>
                    Your vehicle will be allocated in a while.
                </Text>
            </View>
            <Image style={NoTripFoundStyles.notFoundImage} source={NotFoundImage} />
        </View>)
    }

}

export default SearchingForTaxi;