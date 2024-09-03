import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';
import {utils} from '../../../Controllers/utils';
import {vehicleListStyles} from '../../../Styles/Home/RideNow';
import DurationIcon from '../../../Assets/HomeScreen/RideNow/time.png';
import UserCapacityIcon from '../../../Assets/HomeScreen/RideNow/user.png';

import AutoIcon from '../../../Assets/HomeScreen/Vehicles/auto.png';
import BikeIcon from '../../../Assets/HomeScreen/Vehicles/bike.png';
import HatchbackIcon from '../../../Assets/HomeScreen/Vehicles/hatchback.png';
import SedanIcon from '../../../Assets/HomeScreen/Vehicles/sedan.png';
import SUVIcon from '../../../Assets/HomeScreen/Vehicles/suv.png';
import Luxury_SedanIcon from '../../../Assets/HomeScreen/Vehicles/luxury_Sedan.png';

export default class VehicleList extends Component {

  getVechicleImg = (vehicleType,fare, duration) => {
    switch (vehicleType) {
      case '0':
        return {name: 'bike', image: BikeIcon, capacity: 1,color: '#9b3e3e', fare:fare, duration:duration};
      case '1':
        return {name: 'Auto Rickshaw', image: AutoIcon, capacity: 3,color: '#ffd100',fare:fare,duration:duration};
      case '2':
        return {name: 'Hatchback', image: HatchbackIcon, capacity: 5,color: '#4b48ab',fare:fare,duration:duration};
      case '3':
        return {name: 'Sedan', image: SedanIcon, capacity: 4, color: '#48abab',fare:fare,duration:duration};
      case '4':
        return {name: 'SUV', image: SUVIcon, capacity: 6,color: '#69466a',fare:fare,duration:duration};
      case '5':
        return {name: 'MUV', image: Luxury_SedanIcon, capacity: 6,color: '#444953',fare:fare,duration:duration};
      case '6':
        return {name: 'luxury_sedan', image: Luxury_SedanIcon, capacity: 6,color: '#444953',fare:fare,duration:duration};
      case '7':
        return {name: 'bike', image: BikeIcon, capacity: 1,color: '#9b3e3e',fare:fare,duration:duration};
      default:
        return {name: 'auto', image: AutoIcon, capacity: 3,fare:fare,duration:duration};
    }
  };

  onSelectVehicleFare = option => {
    const data = option;
    data.label = this.getVechicleImg(option.type).name
    data.capacity = this.getVechicleImg(option.type).capacity;
    data.image = this.getVechicleImg(option.type).image;
    this.props.onVehicleSelect(data);
  };

  render() {

    const itemsdata = this.props.itemData;
    // // to move auto, bike to end of the list
    const items = [...itemsdata.slice(2), ...itemsdata.slice(0, 2)];

    return (
      <View>
        {items.length === 0 ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
            }}>
            <Image
              source={require('../../../Assets/Trips/tripDetails/emptyTrips.png')}
              style={{width: 150, height: 250}}
            />
            <Text style={{fontSize: 20, fontWeight: 'bold', color: '#a9a9a9'}}>
              No Vehicles Found
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={vehicleListStyles.scrollViewContent}>
            {items?.map((option, index) => (
              <TouchableOpacity
                key={`searched-vehicle-fare-${index}`}
                style={[vehicleListStyles.vehicleItem,{backgroundColor:'#fafafa',alignItems:'center',paddingBottom:20}]}
                onPress={() => this.onSelectVehicleFare(option)}>
                <View style={vehicleListStyles.vehicleInfoContainer}>
                  <View style={vehicleListStyles.vehicleImageContainer}>
                    <View
                      style={[
                        vehicleListStyles.vehicleColorOverlay,
                        {backgroundColor: this.getVechicleImg(option.type).color},
                      ]}
                    />
                    <Image
                      source={this.getVechicleImg(option.type).image}
                      style={vehicleListStyles.vehicleImage}
                    />
                  </View>
                  <View style={vehicleListStyles.vehicleDetailsContainer}>
                    <Text style={vehicleListStyles.vehicleLabel}>
                      {this.getVechicleImg(option.type).name}
                    </Text>
                    <View style={vehicleListStyles.vehicleDetails}>
                      <View style={vehicleListStyles.detailsRow}>
                        <View style={vehicleListStyles.detailsIconContainer}>
                          <Image
                            source={DurationIcon}
                            style={vehicleListStyles.detailsIcon}
                          />
                        </View>
                        <Text style={vehicleListStyles.detailsText}>
                        {utils.convertSecondsToReadable(option.duration)} away
                        </Text>
                      </View>
                    </View>
                       <View style={vehicleListStyles.detailsRow}>
                        <View style={vehicleListStyles.detailsIconContainer}>
                          <Image
                            source={UserCapacityIcon}
                            style={vehicleListStyles.detailsIcon}
                          />
                        </View>
                        <Text style={vehicleListStyles.detailsText}>
                        {this.getVechicleImg(option.type).capacity}
                        </Text>
                      </View>
                  </View>
                  
                </View>
                <View style={[vehicleListStyles.fareContainer,{marginTop:10,paddingLeft:4}]}>
                  <Text style={vehicleListStyles.fareText}>₹{this.getVechicleImg(option?.type,option?.fare)?.fare?.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
}
