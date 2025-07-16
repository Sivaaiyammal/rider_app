import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getVehicleImage } from '../../rideStatus/types/vehicleImd';
import { Fonts, colors } from '../../../constants/constants';

const TripPersonVehicle = ({
  driver = { name: 'John Doe', profile: require('../../../assets/image/account/Profile.webp') },
  vehicle = { type: 'SEDAN', brand: 'Maruti Suzuki', model: 'Swift Dzire', number: 'TN 01 AB 1234' },
}) => (
  <View style={styles.container}>
    <View style={styles.imagesRow}>
      {getVehicleImage(vehicle.type, styles.vehicleImg)}
      <Image source={driver.profile} style={styles.profileImg} />
    </View>
    <Text style={styles.driverName}>{driver.name}</Text>
    <Text style={styles.vehicleDesc}>{vehicle.brand} {vehicle.model} 0 {vehicle.number}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vehicleImg: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: -20,
    zIndex: 1,
  },
  profileImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.white,
    zIndex: 2,
  },
  driverName: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    textAlign: 'center',
    marginTop: 4,
    color: colors.black,
  },
  vehicleDesc: {
    color: colors.black,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
});

export default TripPersonVehicle; 