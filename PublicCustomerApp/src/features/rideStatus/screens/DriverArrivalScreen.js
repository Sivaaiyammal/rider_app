        import React, { useRef, useState,useEffect     } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing, Linking } from 'react-native';
import { Fonts, colors } from '../../../constants/constants';
import { getVehicleImage } from '../types/vehicleImd';
import AddressContainer from '../../../components/Trips/AddressContainer';
import useTrackHook from '../hooks/useTrackHook';

import Icon from 'react-native-vector-icons/MaterialIcons';

import {useStackScreenStore} from '../../../store/useStackScreenStore';
import  LocationTypes  from '../../booking/types/LocationTypes.json';
import useAssignedDriverInfoStore from '../store/useAssignedDriverInfoStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import { changeStopLocation } from '../services/StopLocationChangeService';
import {showNotification} from '../../../components/NotificationManger';
  const DriverArrivalScreen = ({onCancel}) => {
  // Dummy data
  const {driverName,rating,vehicleNumber,model,brand,color,driverPhoto,phone} = useAssignedDriverInfoStore();
  const {stops,otp,minFare,maxFare,duration,totalDistance,estimatedPickuoMins} = useCurrentRideInfoStore();
  const {goBack,setStackScreen} = useStackScreenStore();

  // Initialize tracking hook for driver arrival screen with polyline support
  const { cleanupMarkers } = useTrackHook('arrival');

  // Cleanup markers and polylines when component unmounts
  useEffect(() => {
    return () => {
      cleanupMarkers();
    };
  }, [cleanupMarkers]);

    const handlePickLocation = async (item) => {
      try {
        const res =  await changeStopLocation(item)
        if (res.success) {
          showNotification('Pickup Location', 'Updated successfully', 'success');
          goBack()
        }
      } catch (error) {
        console.log('error',error);
      }
    }

  const handleChangeLocation = (item) => {
    setStackScreen('PickLocationScreen',{
      onPickLocationResultCallback:handlePickLocation,
      locationType:LocationTypes.START_LOCATION,
      defaultLocation:item
    })
  }

  const handleCallDriver = () => {
    console.log('driverPhone',phone);
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  }


  // Animation state for trip details
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const toggleExpand = () => {
    setExpanded(prev => {
      Animated.timing(animation, {
        toValue: prev ? 0 : 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
      return !prev;
    });
  };

  // Interpolate height for animation
  const rideInfoHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250], // adjust 60 to fit your content
  });
  const chevronRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  // Check if driver photo URL is valid
  const driverPhotoUri = driverPhoto && driverPhoto.trim() !== '' ? driverPhoto : null;

    return (
        <> 
        <View style={[styles.containerTop,{backgroundColor:'#0f223c'}]}>
       
        <Text style={styles.topBarText}>Your driver will arrive in</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{estimatedPickuoMins || '--'} Mins</Text>
            </View>
        
    </View>
    <View style={[styles.root,{backgroundColor:'white'}]}>
    
      {/* Vehicle details */}
      <View style={styles.vehicleCard}>
        {getVehicleImage(vehicleNumber,styles.vehicleImg)}
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleNum}>{vehicleNumber}</Text>
          <Text style={styles.vehicleDesc}>{brand} {model}  .  {color}</Text>
              </View>
            </View>
  
      {/* Driver details and OTP */}
      <View style={styles.driverRow}>
        <View style={styles.driverProfile}>
              <Image source={{uri:driverPhotoUri}} style={styles.driverImg} resizeMode='cover' />
          
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driverName}</Text>
        
        </View>
        <View style={styles.otpBox}>
          <Text style={styles.otpLabel}>OTP</Text>
          <View style={styles.otpRow}>
            {otp?.split('').map((d, i) => (
              <Text key={i} style={styles.otpDigit}>{d}</Text>
                  ))}
                </View>
              </View>
            </View>


            {!expanded && (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',paddingHorizontal:5}}>
        <View style={{flex:1,gap:5,paddingVertical:10}}>
          <Text style={{ color: '#888', fontSize: 13,fontFamily:Fonts.regular }}>Pickup Location</Text>
          <Text style={{ color: '#222', fontSize: 15,maxWidth:"90%",fontFamily:Fonts.regular,textAlign:'left' }} numberOfLines={1} ellipsizeMode="tail">
            {stops[0]?.address}
          </Text>
        </View>
          <TouchableOpacity style={{borderColor: '#4289e5', borderWidth:1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 }} onPress={()=>{
            handleChangeLocation(stops[0])
          }}>
          <Text style={{ color:colors.blue, fontSize: 14, fontFamily:Fonts.regular }}>Change</Text>
        </TouchableOpacity>
      </View>
    )}   
  
      {/* Trip Details row with chevron */}
      <TouchableOpacity style={styles.tripDetailsRow} onPress={toggleExpand} activeOpacity={0.7}>
        <Text style={styles.tripDetailsLabel}>Trip Details</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Icon name="keyboard-arrow-right" size={25} color={colors.black} />
        </Animated.View>
      </TouchableOpacity>
      {/* Animated Ride Info */}
      
   
      <Animated.View style={[ { height: rideInfoHeight, overflow: 'hidden' }]}> 
    
    {expanded && (
      <>
      <AddressContainer directions={stops} edit={false} />
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {/* <View style={styles.rideInfoItem}>
          <Text style={styles.rideInfoLabel}>Arrival</Text>
          <Text style={styles.rideInfoValue}>{estDropTime || '--'}</Text>
        </View> */}
        <View style={styles.rideInfoItem}>
          <Text style={styles.rideInfoLabel}>Duration</Text>
          <Text style={styles.rideInfoValue}>{duration || '--'} Min</Text>
        </View>
        <View style={styles.rideInfoItem}>
          <Text style={styles.rideInfoLabel}>Distance</Text>
          <Text style={styles.rideInfoValue}>{totalDistance || '--'} Km</Text>
        </View>
        <View style={styles.rideInfoItem}>
          <Text style={styles.rideInfoLabel}>Est. Price</Text>
          <Text style={styles.rideInfoValue}>₹{minFare || '--'} - ₹{maxFare || '--'}</Text>
        </View>
      </View>
      </>
    )}
  </Animated.View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
          <Icon name="phone" size={20} color={colors.white} />
          <Text style={styles.callBtnText}>CALL DRIVER</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share" size={25} color={colors.white} />
        </TouchableOpacity> */}
          <TouchableOpacity style={styles.cancelBtn} onPress={()=>{
            onCancel();
          }}>
          <Icon name="close" size={25} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>

   
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  
    padding: 16,
    justifyContent: 'flex-start',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  containerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   
    paddingHorizontal: 15,
    paddingVertical: 10,
   
    zIndex: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  topBar: {
    backgroundColor: '#174EA6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Fonts.regular,
    
  },
  timeBox: {
    backgroundColor: colors.white+'30',
   
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  timeText: {
    color: colors.white,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    justifyContent: 'center',
    gap: 20,
  },
  vehicleInfo: {
   
    justifyContent: 'center',

  },
  vehicleImg: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
   
  },
  vehicleNum: {
    fontFamily: Fonts.semi_bold,
    fontSize: 24,
    marginBottom: 2,
    color: colors.black,
  },
  vehicleDesc: {
    color: '#616161',
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  driverProfile: {
    alignItems: 'center',
    
    marginRight: 10,
  },
  driverImg: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  
    position: 'absolute',
    bottom: -5,
    elevation: 5,
   
  

 
    
  },
  star: {
    color: '#FFD700',
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  driverName: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    marginBottom: 2,
    color: colors.black,
  },
  driverLabel: {
    color: '#888',
    fontSize: 13,
  },
  otpBox: {
    alignItems: 'center',
    marginLeft: 10,
  },
  otpLabel: {
    color: '#888',
    fontFamily: Fonts.regular,
    fontSize: 13,
    marginBottom: 5,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 2,
  },
  otpDigit: {
    backgroundColor: '#ffeda7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: Fonts.regular,
    fontSize: 18,
    marginHorizontal: 1,
    color: colors.black,
  },
  rideInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginBottom: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  rideInfoItem: {
    padding: 10,
    alignItems: 'center',
    flex: 1,
  },
  rideInfoLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
    fontFamily:Fonts.regular,
  },
  rideInfoValue: {
   
    fontSize: 15,
    fontFamily:Fonts.medium,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:10,
   
  },
  callBtn: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    backgroundColor: '#329782',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    marginRight: 8,
  },
  callBtnText: {

    color: '#fff',
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  shareBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#4289e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  tripDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 14,
    marginHorizontal:5,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
   
    marginTop: 10,
  },
  tripDetailsLabel: {
    color: '#757575',
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  chevron: {
    fontSize: 20,
    color: '#888',
    fontFamily: Fonts.medium,
    marginLeft: 8,
  },
});
  
  export default DriverArrivalScreen;
  