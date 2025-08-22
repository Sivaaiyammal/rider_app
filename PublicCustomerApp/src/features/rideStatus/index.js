import React, { useState,useEffect } from 'react';
import DriverArrivalScreen from './screens/DriverArrivalScreen';
import OnRideScreen from './screens/OnRideScreen';
import DriverSearchScreen from './screens/DriverSearchScreen';
import CompletedRideScreen from './screens/RideCompletedScreen';
import { TripStatus } from './types/TripStatus';
import useCurrentRideInfoStore from './store/useCurrentRideInfoStore';
import NavBar from '../../components/NavBar';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Fonts } from '../../constants/constants';
import { colors } from '../../constants/constants';
import MapIcon from '../../components/Map/MapIcon';
import CurrentLocationIcon from '../../assets/icons/CurrentLocationIcon.svg';
import locationTask from '../../controllers/GetCurrentLocation';
import CancelComponent from './component/CancelComponent';
import BookingCancelModel from './component/BookingCancelModel';
import AnimatedBottomSheetWrapper from '../shared/component/AnimatedBottomSheetWrapper';
import { useStackScreenStore } from '../../store/useStackScreenStore';
import PaymentType from '../booking/components/bookRide/PaymentType';
import { cancelRide } from '../../API/EndPoints/EndPoints';
import { showNotification } from '../../components/NotificationManger';

import useRideMatching  from '../../hooks/useRideMatching';
import  useUserInfoStore  from '../../store/useUserInfoStore';
import useCalculateDistance from './hooks/useCalculateDistance';
import { useTranslation } from 'react-i18next';
import Overlay from '../../components/Overlay';
import AppConfig from '../../Config/AppConfig';
import {DataStore}from '../../controllers/DataStore';
import PREF from '../../storage/PREF';

const RideStatus = () => {
  
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(false);
  
  const { duration,totalDistance,tripStatus,tripId,paymentMethod,setPaymentMethod,showBookingCancelModel,setShowBookingCancelModel,resetCurrentRideInfo,setFareDetails,setTripStatus,setFinalDistance,setFinalDuration,onGoingTripCancelled,setOngoingingTripCancelled} = useCurrentRideInfoStore();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const {goBack,stackScreen,setStackScreen} = useStackScreenStore();
  const [isPaymentMethodChangeShow,setIspaymentMethodChangeShow] = useState(false);
  const {stopMatching} = useRideMatching();
  const {id:userId} = useUserInfoStore();
  const [isCalculateDistance,setIsCalculateDistance] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const {gpsDistance, gpsDuration, loading} = useCalculateDistance({ tripId:tripId , startTime: 1717190400000, endTime: new Date().setHours(23, 59, 59, 999),enabled: isCalculateDistance});


  const handleOverlay = (action) => {
   
    
    if(action === 'close'){
      setShowOverlay(false);
    }else if(action === 'open'){
      setShowOverlay(true);
    }
  };

  const CancelRide = async (payload) => {
    try{
    const response = await cancelRide(payload);
      

      if (response.success) {
        showNotification('Ride cancelled successfully');
        setShowBottomSheet(false);
        setShowBookingCancelModel(false);
        await DataStore.clearData(PREF.CURRENT_TRIP)
        

        if (tripStatus === TripStatus.PICKEDUP && response?.totalFare?.fareDetails?.fare) {
          setOngoingingTripCancelled(true);
          setStackScreen('PaymentScreen',{})
          

        } else {
         
      
          resetCurrentRideInfo();
          
          goBack();
          
        } 
      }
    }
    catch (error) {
      console.error("Error cancelling ride:", error);
      showNotification('Failed to cancel ride. Please try again.');
    }
  }
  const handleCancel = async (reason) => {
    
      if(tripStatus == TripStatus.PENDING){
        await DataStore.clearData(PREF.CURRENT_TRIP)
        stopMatching(tripId,userId)
        resetCurrentRideInfo();
        goBack();
        return
      }

      // if(AppConfig.RIDE_CANCELLED_MIDWAY_FUEL_CHARGE){
      //   const payload = {
      //     tripId,
      //     reason,
      //     totalDistance: totalDistance,
      //     totalDuration: Math.round(gpsDuration)
      // };
      
      //   await CancelRide(payload);
        
      //   return
      // }

      // If the ride is ongoing, include total distance and time
      if (tripStatus === TripStatus.PICKEDUP) {
        setCancelReason(reason);
        setIsCalculateDistance(true);
        return
      }

      const payload = {
        tripId,
        reason,
    };
    
      await CancelRide(payload);
  };


  useEffect(()=>{
    if(gpsDistance == -1 && gpsDuration == -1){
      const payload = {
        tripId,
        reason: cancelReason
      };
    
      CancelRide(payload);
      
      return
    }
    if(isCalculateDistance && gpsDistance && gpsDuration ){
      
      
      // Now that we have the distance and duration, proceed with cancellation
      const payload = {
        tripId,
        reason: cancelReason,
        totalDistance: gpsDistance,
        totalDuration: Math.round(gpsDuration)
      };
      
      CancelRide(payload);
    }
    if(isCalculateDistance) {
      setIsCalculateDistance(false);
    }
  },[gpsDistance, gpsDuration, cancelReason, isCalculateDistance])
 
  const renderScreen = () => {
   
    switch (tripStatus) {
      case TripStatus.PICKEDUP:
        return <OnRideScreen onCancel={()=>{setShowBottomSheet(true)}} onPaymentMethodChange={()=>{setIspaymentMethodChangeShow(true)}}  handleOverlay={handleOverlay}/>;
      case TripStatus.ACCEPTED:
        return <DriverArrivalScreen onCancel={()=>{setShowBottomSheet(true)}}   handleOverlay={handleOverlay}/>;
      case TripStatus.DROPPED:
        return <CompletedRideScreen />;
      case TripStatus.CANCELLED:
        if(onGoingTripCancelled){
          return <CompletedRideScreen type={TripStatus.CANCELLED} />;
        }
        else{
          return <DriverSearchScreen  onCancel={handleCancel} />;
        }
      default:
        return <DriverSearchScreen  onCancel={handleCancel} />;
    }
  };



  useEffect(()=>{
    return () => {
      setShowBookingCancelModel(false);
      
    }
  },[])

  useEffect(()=>{
  
    if (tripStatus === TripStatus.COMPLETED || tripStatus === TripStatus.DIVERGED ){
      setStackScreen('TripFeedbackScreen',{})
    }

  },[tripStatus])

 

 
 


  const handlePaymentMethodChange = (paymentMethod) => {
    
    setIspaymentMethodChangeShow(false);
    setPaymentMethod(paymentMethod);
  }

 const getTitle = () => {
  switch(tripStatus){
    case TripStatus.PICKEDUP:
      return t('on_ride');
    case TripStatus.ACCEPTED:
      return t('driver_arrival');
    case TripStatus.DROPPED:
      return t('ride_completed');
    case TripStatus.CANCELLED:
      return t('ride_cancelled');
    default:
      return t('finding_driver');
  }
 }
  

    return <>
   {showOverlay && <Overlay
  visible={showOverlay}
  onPress={handleOverlay}
  backgroundColor="rgba(0, 0, 0, 0.7)"
  zIndex={0}
  
>

</Overlay>}
        <NavBar title={t(getTitle())} />
        <View style={styles.container}>
            <View style={[styles.containerTop,showOverlay && {display:'none'}]}>  
                <View style={[styles.containerTop_inner]}>
                    <MapIcon />
                    <TouchableOpacity style={styles.currentLocationIcon} onPress={() => {
                        locationTask.getCurrentLocation()
                    }}>
                        <CurrentLocationIcon />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.container_inner,{backgroundColor:tripStatus === TripStatus.DROPPED ? '#13B15A' : tripStatus === TripStatus.CANCELLED ? '#ff5050' : '#0f223c'}]}>
                {renderScreen()}
            </View>
        </View>

        {
      showBottomSheet &&
      <AnimatedBottomSheetWrapper onClose={()=>{setShowBottomSheet(false)}}>
        <CancelComponent onClose={()=>{setShowBottomSheet(false)}} onCancel={handleCancel}  loading={loading} rideStatus={tripStatus} />
      </AnimatedBottomSheetWrapper>
      
    }
    {
      isPaymentMethodChangeShow &&
      <AnimatedBottomSheetWrapper onClose={()=>{setIspaymentMethodChangeShow(false)}}>
        <PaymentType onSelect={handlePaymentMethodChange} initialValue={paymentMethod} />
      </AnimatedBottomSheetWrapper>
    }
    {
      showBookingCancelModel &&
      <AnimatedBottomSheetWrapper onClose={()=>{setShowBookingCancelModel(false)}}>
        <BookingCancelModel onClose={()=>{setShowBookingCancelModel(false)}} onCancel={handleCancel} />
      </AnimatedBottomSheetWrapper>
    }
   
    </>;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    borderRadius: 20,
  },
  containerTop: {
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
});

export default RideStatus;
