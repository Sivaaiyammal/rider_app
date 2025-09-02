import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getVehicleImage } from '../../rideStatus/types/vehicleImd';
import { Fonts, colors } from '../../../constants/constants';
import { VEHICLE_LABELS } from '../../../constants/VehicleLabels';

const TripPersonVehicle = ({
  driverName,
  driverPhoto,
  vehicleType,
  vehicleBrand,
  vehicleModel,
  vehicleNumber,
  layoutStyle,
  descriptonSize=15,
  usedScreen=null
}) => (
  <View style={[styles.container,layoutStyle=="row"&&{flexDirection:"row",gap:15}]}>
    <View style={[styles.imagesRow]}>
      {getVehicleImage(vehicleType, [styles.vehicleImg,driverPhoto&&{marginRight:-20}],'ratingScreen')}
      {driverPhoto && <Image source={{uri:driverPhoto}} style={[styles.profileImg,usedScreen=="MyRides"&&{width:60,height:60}]} />}
    </View>
    <View style={[layoutStyle=="row"&&{alignItems:"flex-start"},usedScreen=="MyRides"&&{alignItems:"flex-end"}]}>
    {usedScreen !=="MyRides"&&driverName && <Text style={[styles.driverName,usedScreen=="MyRides"&&{fontSize:15,fontFamily:Fonts.regular}]}>{ driverName}</Text>}
    {usedScreen !=="MyRides"&&<Text style={[styles.vehicleDesc,{fontSize:descriptonSize}]}>{vehicleBrand} {vehicleModel} . {vehicleNumber}</Text>}
  
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
   
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
 
    
  },
  vehicleImg: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    
    zIndex: 1,
    transform: [{ scaleX: -1 }],
    
  },
  profileImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.grey_xdark,
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
    marginTop: 2,
  },
});

export default TripPersonVehicle; 