import {Image, Text, TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';

import {RideNowTripsStyles} from '../../../../Styles/Home/RideNow';
// import {buttonStyles} from '../../../Styles/Home/Home';
// import {bottomSheetView} from '../../../Styles/Home/RideNow';

import PickuptimeImage from '../../../../Assets/HomeScreen/RideNow/pickuptime.png';
import TriptypeImage from '../../../../Assets/HomeScreen/RideNow/triptype.png';
import DropdownImage from '../../../../Assets/HomeScreen/RideNow/dropdown.png';

import {utils} from '../../../../Controllers/utils';

export default class RideTypeButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onSelectOptionType(type) {
    this.props.onSelectOptionType(type);
  }

  render() {
    return (
      <View style={RideNowTripsStyles.ridenowTopSelectContainer}>
        <TouchableOpacity
          onPress={() => this.onSelectOptionType('pickuptime')}
          style={RideNowTripsStyles.ridenowTopSelectOption}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              justifyContent: 'space-between',
            }}>
            <Image
              style={RideNowTripsStyles.ridenowTopSelectOptionIcon}
              source={PickuptimeImage}
            />
            <Text style={{color: 'white'}}>
              {this.props.screenType === 'Schedule'
                ? `${this.props.scheduleTripDetials.date.month}  ${this.props.scheduleTripDetials.date.day}, ${utils.timestampTo12HourFormat(
                  this.props.scheduleTripDetials.time,
                )}`
                : this.props.selectedPickupType.title}
            </Text>
            <Image
              style={RideNowTripsStyles.ridenowTopSelectDropdownIcon}
              source={DropdownImage}
            />
          </View>
          {/* {this.props.screenType === 'Schedule' && (
            <View
              style={[
                {
                  alignSelf: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Text style={{color: 'white', fontSize: 10}}>
                {this.props.scheduleTripDetials.date.month}{' '}
                {this.props.scheduleTripDetials.date.day},{' '}
                {utils.timestampTo12HourFormat(
                  this.props.scheduleTripDetials.time,
                )}
              </Text>
            </View>
          )} */}
        </TouchableOpacity>
        {/* <TouchableOpacity
            onPress={() => this.onSelectOptionType('triptype')}
            style={RideNowTripsStyles.ridenowTopSelectOption}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}>
              <Image
                style={RideNowTripsStyles.ridenowTopSelectOptionIcon}
                source={TriptypeImage}
              />
              <Text style={{color: 'white'}}>
                {this.state.selectedTripType.title || 'One Way'}
              </Text>
              <Image
                style={RideNowTripsStyles.ridenowTopSelectDropdownIcon}
                source={DropdownImage}
              />
            </View>
          </TouchableOpacity> */}
      </View>
    );
  }
}
