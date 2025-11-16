import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
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
import ELECTRIC_AUTO from "../../../../assets/vehicle/AUTO.webp"
import ELECTRIC_BIKE from "../../../../assets/vehicle/BIKE.webp"
import ELECTRIC_HATCHBACK from "../../../../assets/vehicle/HATCHBACK.webp"
import ELECTRIC_SEDAN from "../../../../assets/vehicle/SEDAN.webp"
import ELECTRIC_SUV from "../../../../assets/vehicle/SUV.webp"
import ExSEDAN from "../../../../assets/vehicle/ExSEDAN.webp"
import SkeletonLoader from '../../../../components/Loaders/SkeletonLoader';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AdaptiveText from '../../../../components/Common/AdaptiveText';
import VehicleSearchIcon from '../../../../assets/image/svgIcons/vehicleSearch.svg'

const VEHICLE_IMAGES = { AUTO, BIKE, HATCHBACK, SEDAN, SUV, ELECTRIC_AUTO, ELECTRIC_HATCHBACK, ELECTRIC_SEDAN, ELECTRIC_SUV,ELECTRIC_BIKE };

const VehicleList = ({ availableVehicles, isLoading, isEstimationError }) => {
  const { t } = useTranslation();
  const {selectedVehicle,setSelectedVehicle} = useRideVehicleStore()
  const [slideAnim] = useState(new Animated.Value(0));
  const firstRenderStartRef = useRef(null);

  useEffect(() => {
    if (typeof console.time === 'function') {
      console.time('availableVehicles->firstRender');
    } else {
      firstRenderStartRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    // Animate the component in only when vehicles are loaded
    if (availableVehicles && availableVehicles.length > 0) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200, // Reduced duration for faster rendering
        useNativeDriver: true,
      }).start();
    }
  }, [availableVehicles]);

  

  // Removed redundant vehicle selection - handled by parent component

  const handleVehicleSelect = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
  }, [setSelectedVehicle]);



  

  const getVehicleImage = useCallback((type) => {
    return VEHICLE_IMAGES[type] || ExSEDAN;
  }, []);

  // Memoize filtered vehicles to prevent unnecessary re-renders
  

  const renderSkeletonLoader = () => {
    const skeletonItems = Array.from({ length: 4 }, (_, index) => index);
    
    return (
      <View style={styles.container}>
        {skeletonItems.map((_, index) => (
          <View key={index} style={[styles.vehicleCard,{backgroundColor:colors.grey_xxlight}]}>
            <View style={styles.vehicleImageContainer}>
              <SkeletonLoader width={56} height={56} borderRadius={8} />
            </View>
            <View style={styles.vehicleInfoContainer}>
              <View style={styles.rowBetween}>
                <SkeletonLoader width="60%" height={16} borderRadius={4} />
                <SkeletonLoader width="30%" height={16} borderRadius={4} />
              </View>
              <View style={styles.rowBetween}>
                <View style={[styles.timeRow,{gap:2}]}>
                  <SkeletonLoader width={16} height={16} borderRadius={8} />
                
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

  if (availableVehicles?.length === 0 || availableVehicles == null) {
    if (isLoading || !isEstimationError) {
      return renderSkeletonLoader();
    }
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 }]}> 
        <View style={styles.emptyWrapper}>
          <VehicleSearchIcon width={80} height={80} />
          <AdaptiveText style={styles.emptyText}>{t('no_vehicles_available')}</AdaptiveText>
        </View>
      </View>
    );
  }
  const isEv = (vehicleType) => {
    return typeof vehicleType === 'string' && vehicleType.includes("ELECTRIC");
  };



  return (
    <View 
      style={styles.container}
      
    >
      
      
      {availableVehicles?.map((vehicle) => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        return (
          <TouchableOpacity
            key={vehicle.id}
            onPress={() => handleVehicleSelect(vehicle)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isSelected ? ['#ffffff00','#fff5cc'] : ['transparent', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.vehicleCard, isSelected ? styles.selectedVehicleCard : {backgroundColor:colors.grey_xxlight}]}
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
                  <View style={styles.vehicleNameContainer}>
                
                  <Text style={[styles.vehicleName]}>{VEHICLE_LABELS[vehicle.type] || vehicle.name}</Text>
                  {isEv(vehicle.type) && <View style={styles.evContainer}>
                    <Text style={[styles.evText]}>EV</Text>
                    <Icon name="bolt" size={12} color="white"/>
                  </View>
                  }
                  </View>
                  <Text style={[styles.price]}>
                    {vehicle.minFare != null && vehicle.maxFare != null
                      ? `₹${vehicle.minFare.toFixed(0)} - ₹${vehicle.maxFare.toFixed(0)}`
                      : t && typeof t === 'function'
                        ? "--"// fallback if translation function exists
                        : '--'}
                  </Text>
                 
                </View>
                <View style={styles.rowBetween}>
                  <View style={styles.timeRow}>
                    <MaterialCommunityIcons name="clock" size={16} color={"#757575"} />
                    <AdaptiveText style={[styles.timeText,{fontSize:13}]}>{vehicle.estimatedDuration} {t('min')}</AdaptiveText>
                    {/* <Text style={[styles.dot]}>·</Text>
                    <Text style={[styles.dropTime]}>{vehicle.dropat}</Text> */}
                  </View>
                  {/* <View style={styles.passengerRow}>
                    <MaterialCommunityIcons name="account" size={16} color={ "#757575"} />
                    <AdaptiveText style={[styles.passengerText]}>{vehicle.capacity}</AdaptiveText>
                  </View> */}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
      
   
    </View>
  );
};

VehicleList.propTypes = {
  initialValue: PropTypes.object,
  availableVehicles: PropTypes.array,
  isLoading: PropTypes.bool,
  isEstimationError: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    marginBottom: 40,
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
  vehicleNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:5,
    marginTop:5,
    flex:1
  },
  evContainer: {
    backgroundColor: "green",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap:2,
  },
  evText: {
    fontSize: 10,
    fontFamily:Fonts.semi_bold,
    color: colors.white,
    letterSpacing:1,
   
  },
  vehicleNameText: {
    fontSize: 16,
    fontFamily:Fonts.regular,
    color: colors.black,
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
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grey_xxlight,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: '85%',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
});

export default VehicleList;
