import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import PropTypes from 'prop-types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, Fonts } from '../../../../constants/constants';
import useRideVehicleStore from '../../store/useRideVehicleStore';
import { VEHICLE_LABELS } from '../../../../constants/VehicleLabels';
import AUTO from "../../../../assets/vehicle/AUTO.webp"
import BIKE from "../../../../assets/vehicle/BIKE.webp"
import HATCHBACK from "../../../../assets/vehicle/HATCHBACK.webp"
import SEDAN from "../../../../assets/vehicle/SEDAN.webp"
import SUV from "../../../../assets/vehicle/SUV.webp"
import ExSEDAN from "../../../../assets/vehicle/ExSEDAN.webp"
import SkeletonLoader from '../../../../components/Loaders/SkeletonLoader';
import LinearGradient from 'react-native-linear-gradient';

const VEHICLE_IMAGES = { AUTO, BIKE, HATCHBACK, SEDAN, SUV, ExSEDAN };

const VehicleList = ({ isLoading = false }) => {
  const {availableVehicles,selectedVehicle,setSelectedVehicle} = useRideVehicleStore()
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate the component in
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const getVehicleImage = (type) => {
    return VEHICLE_IMAGES[type] || ExSEDAN;
  };

  const renderSkeletonLoader = () => {
    const skeletonItems = Array.from({ length: 4 }, (_, index) => index);
    
    return (
      <View style={styles.container}>
        {skeletonItems.map((_, index) => (
          <View key={index} style={styles.vehicleCard}>
            <View style={styles.vehicleImageContainer}>
              <SkeletonLoader width={56} height={56} borderRadius={8} />
            </View>
            <View style={styles.vehicleInfoContainer}>
              <View style={styles.rowBetween}>
                <SkeletonLoader width="60%" height={16} borderRadius={4} />
                <SkeletonLoader width="30%" height={16} borderRadius={4} />
              </View>
              <View style={styles.rowBetween}>
                <View style={styles.timeRow}>
                  <SkeletonLoader width={16} height={16} borderRadius={8} />
                  <SkeletonLoader width="40%" height={13} borderRadius={4} />
                  <SkeletonLoader width={8} height={8} borderRadius={4} />
                  <SkeletonLoader width="30%" height={13} borderRadius={4} />
                </View>
                <View style={styles.passengerRow}>
                  <SkeletonLoader width={16} height={16} borderRadius={8} />
                  <SkeletonLoader width={20} height={13} borderRadius={4} />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return renderSkeletonLoader();
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0]
              })
            }
          ]
        }
      ]}
    >
      
      
      {availableVehicles.map((vehicle) => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        return (
          <TouchableOpacity
            key={vehicle.id}
            onPress={() => handleVehicleSelect(vehicle)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isSelected ? ['#ffffff00','#fff5cc'] : ['#FFFFFF', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.vehicleCard, isSelected && styles.selectedVehicleCard]}
            >
              <View style={styles.vehicleImageContainer}>
                <Image
                  source={getVehicleImage(vehicle.type)}
                  style={styles.vehicleImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.vehicleInfoContainer}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.vehicleName]}>{VEHICLE_LABELS[vehicle.type] || vehicle.name}</Text>
                  <Text style={[styles.price]}>{vehicle.maxPrice ? `₹${vehicle.basePrice} - ₹${vehicle.maxPrice}` : `₹${vehicle.basePrice}`}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <View style={styles.timeRow}>
                    <MaterialCommunityIcons name="clock" size={16} color={"#757575"} />
                    <Text style={[styles.timeText]}>{vehicle.timeToPickup} min</Text>
                    <Text style={[styles.dot]}>·</Text>
                    <Text style={[styles.dropTime]}>{vehicle.dropat}</Text>
                  </View>
                  <View style={styles.passengerRow}>
                    <MaterialCommunityIcons name="account" size={16} color={ "#757575"} />
                    <Text style={[styles.passengerText]}>{vehicle.capacity}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
      
   
    </Animated.View>
  );
};

VehicleList.propTypes = {
  initialValue: PropTypes.object,
  availableVehicles: PropTypes.array,
  isLoading: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    width:"100%",
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  header: {
    fontSize: 18,
    fontWeight: Fonts.bold,
    color: colors.black,
   
    textAlign: 'center',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
   
    borderColor: '#E0E0E0',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 5,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  
  },
  selectedVehicleCard: {
    borderWidth:1,
    borderColor: '#0f223c',
  
   
  },
  selectedText: {
    color: colors.white,
  },
  vehicleImageContainer: {
    width: 56,
    height: 56,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleImage: {
    width: 65,
    height: 65,
  },
  vehicleInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:5
  },
  vehicleName: {
    fontSize: 16,
    fontFamily:Fonts.regular,
    color: colors.black,
  },
  price: {
    fontSize: 16,
    fontFamily:Fonts.medium,
    color: colors.black,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: "#757575",
    marginLeft: 4,
    fontFamily:Fonts.regular,
  },
  dot: {
    fontSize: 16,
    color: "#757575",
    marginHorizontal: 6,
    fontFamily:Fonts.bold,
  },
  dropTime: {
    fontSize: 13,
    color: "#757575",
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerText: {
    fontSize: 13,
    color: "#757575",
    marginLeft: 4,
  },
  confirmButton: {
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: Fonts.bold,
    color: colors.white,
  },
});

export default VehicleList;
