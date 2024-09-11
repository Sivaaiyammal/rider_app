import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import NavBar from '../components/NavBar';
import {useStackScreenStore} from '../store/useStackScreenStore';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';
import BottomSheet from '../components/BottomSheet';
import {vehicleDetailsStyles} from '../styles/VehicleDetails';
import PeopleBlack from '../assets/image/peopleBlack.svg';
import DurationBlack from '../assets/image/durationBlack.svg';
import FareGreen from '../assets/image/fareGreen.svg';
import useLocationStore from '../store/useLocationStore';
import Rocket from '../assets/image/svgIcons/rocket.svg';
import EndBlack from '../assets/image/svgIcons/end_black.svg';

const SelectedVehicle = () => {
  const {goBack} = useStackScreenStore();
  const {selectedVehicle} = useSelectedVehicleStore();
  const {directions} = useLocationStore();

  console.log('hari-->selectedVehicle-->>', directions);

  const onBackPress = () => {
    goBack();
  };

  const getLocationIcon = item => {
    switch (item.name) {
      case 'Start':
        return <Rocket />;
      case 'End':
        return <EndBlack />;
    }
  };

  return (
    <>
      <NavBar withBg title={'Choose Your Ride'} onBackPress={onBackPress} />
      <BottomSheet>
        <View style={vehicleDetailsStyles.detailsContainer}>
          <Image
            source={selectedVehicle.Image}
            style={{width: 120, aspectRatio: 1}}
          />
          <View>
            <Text style={vehicleDetailsStyles.name}>
              {selectedVehicle.name}
            </Text>
            <Text style={vehicleDetailsStyles.durationTxt}>
              {' '}
              <DurationBlack /> {selectedVehicle.duration}
            </Text>
            <Text style={vehicleDetailsStyles.durationTxt}>
              {' '}
              <PeopleBlack /> {selectedVehicle.count}
            </Text>
            <Text style={vehicleDetailsStyles.fareTxt}>
              <FareGreen /> {selectedVehicle.total_price}
            </Text>
          </View>
        </View>
        <View style={vehicleDetailsStyles.locationContainer}>
          {directions.map(item => {
            return (
              <View style={vehicleDetailsStyles.locationNames}>
                {getLocationIcon(item)}
                <Text style={vehicleDetailsStyles.locationTxt}>
                  {item.locationName}
                </Text>
              </View>
            );
          })}
        </View>
        <TouchableOpacity style={vehicleDetailsStyles.paymentContainer}>
          <Text style={vehicleDetailsStyles.paymentTxt}>Payment Method</Text>
        </TouchableOpacity>
        <TouchableOpacity style={vehicleDetailsStyles.cnfrmBtn}>
          <Text style={vehicleDetailsStyles.cnfrmBtnTxt}>Confirm {selectedVehicle.name} Ride</Text>
        </TouchableOpacity>
      </BottomSheet>
    </>
  );
};

export default SelectedVehicle;
