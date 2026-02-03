import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { getVehicleImage } from '../../rideStatus/types/vehicleImd';
import { Fonts, colors } from '../../../constants/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TripPersonVehicle = ({
  driverName,
  driverPhoto,
  vehicleType,
  vehicleBrand,
  vehicleModel,
  vehicleNumber,
  vehicleColor,
  isElectricVehicle = false,
  layoutStyle,
  descriptonSize=16,
  usedScreen=null
}) => {
  const vehicleDetails = useMemo(() => (
    [vehicleBrand, vehicleModel, vehicleColor, vehicleNumber].filter(Boolean)
  ), [vehicleBrand, vehicleModel, vehicleColor, vehicleNumber]);

  return (
    <View style={[styles.container, layoutStyle==="row" && styles.rowContainer]}>
      <View style={styles.imagesRow}>
        {getVehicleImage(vehicleType, [styles.vehicleImg, driverPhoto && styles.vehicleImgOffset], 'ratingScreen')}
        {driverPhoto && ( <View style={[styles.profileWrapper, usedScreen==="MyRides" && styles.profileWrapperMyRides]}>
         
         
            <Image
              source={{ uri: driverPhoto }}
              style={[styles.profileImg, usedScreen==="MyRides" && styles.profileImgMyRides]}
            />
       
        </View>    )}
      </View>
      <View style={[
        layoutStyle==="row" && styles.detailsAlignStart,
        usedScreen==="MyRides" && styles.detailsAlignEnd,
      ]}>
        {usedScreen !== 'MyRides' && driverName && (
          <Text style={[styles.driverName, usedScreen==="MyRides" && styles.driverNameMyRides]}>
            {driverName}
          </Text>
        )}
        {usedScreen !== 'MyRides' && vehicleDetails.length > 0 && (
          <View
            style={[
              styles.vehicleDetailsWrap,
              layoutStyle==="row" && styles.vehicleDetailsWrapRow,
              usedScreen==="MyRides" && styles.vehicleDetailsWrapEnd,
            ]}
          >
            {vehicleDetails.map((detail, index) => (
              <Text
                key={`${detail}-${index}`}
                style={[styles.vehicleDesc, { fontSize: descriptonSize }]}
              >
                {detail}
                {index < vehicleDetails.length - 1 ? ' · ' : ''}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop:20,
   
   
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 15,
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
  vehicleImgOffset: {
    marginRight: -20,
  },
  profileWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
  },
  profileWrapperMyRides: {
    width: 60,
    height: 60,
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
  profileImgMyRides: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  electricBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
    zIndex: 3,
  },
  driverName: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    textAlign: 'center',
    marginTop: 4,
    color: colors.black,
  },
  driverNameMyRides: {
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  detailsAlignStart: {
    alignItems: 'flex-start',
   maxWidth: 220,
  },
  detailsAlignEnd: {
    alignItems: 'flex-end',
  },
  vehicleDetailsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 2,
    maxWidth: 210,
  },
  vehicleDetailsWrapRow: {
    justifyContent: 'flex-start',
    maxWidth: undefined,
  },
  vehicleDetailsWrapEnd: {
    justifyContent: 'flex-end',
  },
  vehicleDesc: {
    color: colors.black,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlign: 'center',
    flexShrink: 1,
  },
});

export default TripPersonVehicle; 