
import React from 'react';
import { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

// Modules


import { HomeScreenContext } from '../HomeScreen'


// Styles

import { InstantTripsStyles } from '../../../Styles/Home/InstantTrips'
import { MapIconsStyle } from '../../../Styles/Home/Home'


// images

import NotificationImage from '../../../Assets/HomeScreen/Notification.webp'
import LeftArrowImage from '../../../Assets/LeftArrow.svg';



class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
         
        }
        console.log("header")
    }

    onBackPress() {
        this.props.onBack_press('goBack');
      }

    back_handler(context) {
        if (this.props.isBottomSheetHandler){
            this.onBackPress()
        }
        else{
            context.changeScreen('Home')
        }
    }

   

    render() {
        return (<HomeScreenContext.Consumer>
            {
                context => 
                    <View style={InstantTripsStyles.instantTripCreateHeader}>
                        {!(this.props.text == 'Finding Taxi' || this.props.text == 'Driver Assigned' || this.props.text == '') ? 
                        <TouchableOpacity
                            onPress={() =>this. back_handler(context)}
                            style={[MapIconsStyle.iconContainer, { marginBottom: 0 }]}>
                            <LeftArrowImage width={15} height={15} />
                        </TouchableOpacity>
                        : <View />}
                        <Text style={InstantTripsStyles.instantTripCreateHeaderText}>{this.props.text}</Text>
                        {/* <TouchableOpacity style={[MapIconsStyle.iconContainer, { marginBottom: 0 }]} onPress={()=>context.changeScreen('Notifications')}>
                            <Image style={MapIconsStyle.icon} source={NotificationImage} />
                        </TouchableOpacity> */}
                        <View />
                    </View>
            }
        </HomeScreenContext.Consumer>)
    }
}

export default Header;