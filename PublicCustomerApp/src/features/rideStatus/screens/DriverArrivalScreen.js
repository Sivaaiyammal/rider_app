        import React, { useRef, useState,useEffect     } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Linking } from 'react-native';
import { Fonts, colors } from '../../../constants/constants';
import { getVehicleImage } from '../types/vehicleImd';
import useTrackHook from '../hooks/useTrackHook';

import Icon from 'react-native-vector-icons/MaterialIcons';

import {useStackScreenStore} from '../../../store/useStackScreenStore';
import  LocationTypes  from '../../booking/types/LocationTypes.json';
import useAssignedDriverInfoStore from '../store/useAssignedDriverInfoStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import { changeStopLocation } from '../services/StopLocationChangeService';
import {showNotification} from '../../../components/NotificationManger';
import useMapStyleStore from '../../../store/useMapStyleStore';
import { useTranslation } from 'react-i18next';
import useWayPointReorderStore from '../../booking/store/useWayPointReorderStore';
import TripDetailsModal from '../../../components/TripDetailsModal';
import { height } from '../../../utils/Utils';
import useRouteDraw from '../hooks/useRouteDraw';
import MapIcon from '../../../components/Map/MapIcon';
import StatusConatainerWrapper from '../component/StatusConatainerWrapper';
import useStopsMarkerHook from '../hooks/useStopsMarkerHook';

  const DriverArrivalScreen = ({onCancel,handleOverlay}) => {
  // Dummy data
  const {driverName,rating,vehicleNumber,model,brand,color,driverPhoto,phone,driverLatitude,driverLongitude} = useAssignedDriverInfoStore();
  const {stops,otp,duration,totalDistance,vehicleType,estimatedFare} = useCurrentRideInfoStore();
  const {goBack,setStackScreen} = useStackScreenStore();
  const {setMapStyle} = useMapStyleStore();
  const {t} = useTranslation();
  const {waitingForDriverApproval} = useWayPointReorderStore();
  // Initialize tracking hook for driver arrival screen with polyline support

  const {markersList} = useStopsMarkerHook(null,driverLatitude,driverLongitude,vehicleType);
  const {estimatedDuration,remainingDistance,SetViewBoundingBox} = useRouteDraw({destinationlat:stops[0].location[1],destinationlon:stops[0].location[0],driverLat:driverLatitude,driverLon:driverLongitude})  
  

  

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
  const toggleExpand = () => {
    expanded ? handleOverlay('close') : handleOverlay('open');
    setExpanded(prev => !prev);
  };

  const chevronRotation = expanded ? '90deg' : '0deg';

  // Check if driver photo URL is valid
  const driverPhotoUri = driverPhoto && driverPhoto.trim() !== '' ? driverPhoto : null;

    return (
        <StatusConatainerWrapper backgroundColor='black' onMapIconPress={()=>{
            SetViewBoundingBox()
        }}> 
       
           
                
      <View style={[styles.containerTop]}>
       
        <Text style={styles.topBarText}>{t('your_driver_will_arrive_in')}</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{estimatedDuration || '--'} Mins</Text>
            </View>
        
    </View>
    <View style={[styles.root,{backgroundColor:'white'}]}>
    
      {/* Vehicle details */}
      <View style={styles.vehicleCard}>
        {getVehicleImage(vehicleType,styles.vehicleImg)}
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


            
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',paddingHorizontal:5}}>
        <View style={{flex:1,gap:5,paddingVertical:10}}>
          <Text style={{ color: '#888', fontSize: 13,fontFamily:Fonts.regular }}>{t('pickup_location')}</Text>
          <Text style={{ color: '#222', fontSize: 15,maxWidth:"90%",fontFamily:Fonts.regular,textAlign:'left' }} numberOfLines={1} ellipsizeMode="tail">
            {stops[0]?.address}
          </Text>
        </View>
          <TouchableOpacity style={{borderColor: '#4289e5', borderWidth:1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 }} onPress={()=>{
            handleChangeLocation(stops[0])
          }}>
          <Text style={{ color:colors.blue, fontSize: 14, fontFamily:Fonts.regular }}>{t('change')}</Text>
        </TouchableOpacity>
      </View>
  
      <TouchableOpacity style={styles.tripDetailsRow} onPress={toggleExpand} activeOpacity={0.7}>
          <Text style={styles.tripDetailsLabel}>{t('trip_details')}</Text>
          <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
          {
            waitingForDriverApproval === "PENDING" &&
            <View style={styles.driverWaitingApprovalContainer}>
                <Text style={styles.driverWaitingApprovalText}>{t('waiting_for_driver_approval')}</Text>
                
            </View>
          }
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <Icon name="keyboard-arrow-right" size={25} color="#000" />
          </Animated.View>
          </View>
        </TouchableOpacity>
  
 
   
      {/* Trip Details Modal */}
      <TripDetailsModal
        visible={expanded}
        onClose={toggleExpand}
        stops={stops}
        waitingForDriverApproval={waitingForDriverApproval}
        height={height} // You can adjust this value or import height from utils
        onCancel={onCancel}
      >
        <View style={{ flexDirection: 'row', flex: 1, marginBottom: 20 }}>
          <View style={styles.rideInfoItem}>
            <Text style={styles.rideInfoLabel}>{t('duration')}</Text>
            <Text style={styles.rideInfoValue}>{duration || '--'} Min</Text>
          </View>
          <View style={styles.rideInfoItem}>
            <Text style={styles.rideInfoLabel}>{t('distance')}</Text>
            <Text style={styles.rideInfoValue}>{totalDistance || '--'} Km</Text>
          </View>
          <View style={styles.rideInfoItem}>
            <Text style={styles.rideInfoLabel}>{t('est_price')}</Text>
            <Text style={styles.rideInfoValue}>₹{estimatedFare || '--'}</Text>
          </View>
        </View>
       
      </TripDetailsModal>

      {/* Action buttons */}
      <View style={styles.actionRow}>
     
        <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
          <Icon name="phone" size={20} color={colors.white} />
             <Text style={styles.callBtnText}>{t('call_driver')}</Text> 
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share" size={25} color={colors.white} />
        </TouchableOpacity> */}
         
      </View>
    </View>
      

   
    </StatusConatainerWrapper>
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
  
  containerTop_inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  containerTop_inner_text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
    textAlign: 'center',
    zIndex: 1,
  },
  container_inner: {
    backgroundColor:'#0f223c',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
   
    
  },
  currentLocationIcon: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'white',
    elevation: 10,
    top:-10
  },
  containerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   
    paddingHorizontal: 15,
    paddingVertical: 10,
   
    zIndex: 0,
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
    backgroundColor: colors.grey,
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
    gap:15,
   
  },
  callBtn: {
    flexDirection: 'row',
    gap: 10,
    padding:15,

    backgroundColor: '#00770d',
   
    borderWidth: 1,
    borderColor: '#00770d',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
 
    flex:1,
    
  },
  callBtnText: {

    color: colors.white,
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
    paddingHorizontal: 5,
    paddingTop: 14,
    paddingBottom: 5,
   
   
    flex:1,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  
    marginVertical:5,
    
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
  cancelBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
});
  
  export default DriverArrivalScreen;
  