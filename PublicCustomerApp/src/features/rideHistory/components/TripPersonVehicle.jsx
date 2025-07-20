import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getVehicleImage } from '../../rideStatus/types/vehicleImd';
import { Fonts, colors } from '../../../constants/constants';

const TripPersonVehicle = ({
  driverName,
  driverPhoto,
  vehicleType,
  vehicleBrand,
  vehicleModel,
  vehicleNumber,
  layoutStyle,
  descriptonSize=15
}) => (
  <View style={[styles.container,layoutStyle=="row"&&{flexDirection:"row",gap:15}]}>
    <View style={styles.imagesRow}>
      {getVehicleImage(vehicleType, styles.vehicleImg)}
      <Image source={{uri:driverPhoto}} style={styles.profileImg} />
    </View>
    <View style={layoutStyle=="row"&&{alignItems:"flex-start"}}>
    <Text style={styles.driverName}>{ driverName}</Text>
    <Text style={[styles.vehicleDesc,{fontSize:descriptonSize}]}>{vehicleBrand} {vehicleModel} . {vehicleNumber}</Text>
    </View>
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
    transform: [{ scaleX: -1 }],
    
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