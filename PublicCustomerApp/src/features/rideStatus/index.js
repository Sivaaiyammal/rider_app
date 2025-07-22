import React, { useState } from 'react';
import DriverArrivalScreen from './screens/DriverArrivalScreen';
import OnRideScreen from './screens/OnRideScreen';
import DriverSearchScreen from './screens/DriverSearchScreen';
import CompletedRideScreen from './screens/RideCompletedScreen';
import { TripStatus } from './types/TripStatus';
import useCurrentRideInfoStore from './store/useCurrentRideInfoStore';
import NavBar from '../../components/NavBar';
import { View, StyleSheet, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Fonts } from '../../constants/constants';
import { colors } from '../../constants/constants';
import { height } from '../../utils/Utils';
import MapIcon from '../../components/Map/MapIcon';
import CurrentLocationIcon from '../../assets/icons/CurrentLocationIcon.svg';
import locationTask from '../../controllers/GetCurrentLocation';
import CancelComponent from './component/CancelComponent';
import AnimatedBottomSheetWrapper from '../shared/component/AnimatedBottomSheetWrapper';
import { cancelRideMutation } from '../../API/APICalls/RideAPICalls';
import { useStackScreenStore } from '../../store/useStackScreenStore';
import PaymentType from '../booking/components/bookRide/PaymentType';
import { cancelRide } from '../../API/EndPoints/EndPoints';
import { showNotification } from '../../components/NotificationManger';

const RideStatus = () => {
  const { tripStatus,tripId,paymentMethod,setPaymentMethod } = useCurrentRideInfoStore();
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const {setStackScreen,reset} = useStackScreenStore();
  const [isPaymentMethodChangeShow,setIspaymentMethodChangeShow] = useState(false);
 
  const renderScreen = () => {
    console.log('tripStatus',tripStatus);
    switch (tripStatus) {
      case TripStatus.PICKEDUP:
        return <OnRideScreen onCancel={()=>{setShowBottomSheet(true)}} onPaymentMethodChange={()=>{setIspaymentMethodChangeShow(true)}} />;
      case TripStatus.ACCEPTED:
        return <DriverArrivalScreen onCancel={()=>{setShowBottomSheet(true)}} />;
      case TripStatus.DROPPED:
        return <CompletedRideScreen />;
      default:
        return <DriverSearchScreen  onCancel={()=>{setShowBottomSheet(true)}} />;
    }
  };

 

 
  const handleCancel = async (reason) => {
  

    const payload = {
      tripId:tripId,
      reason:reason
    }
    
    const response = await cancelRide(payload);
    if(response.success){
      showNotification('Ride cancelled successfully');
      setShowBottomSheet(false);
      reset()
    } 
   
   
  }


  const handlePaymentMethodChange = (paymentMethod) => {
    console.log('paymentMethod',paymentMethod);
    setIspaymentMethodChangeShow(false);
    setPaymentMethod(paymentMethod);
  }

 const getTitle = () => {
  switch(tripStatus){
    case TripStatus.PICKEDUP:
      return 'On Ride';
    case TripStatus.ACCEPTED:
      return 'Driver Arrival';
    case TripStatus.DROPPED:
      return 'Ride Completed';
    default:
      return 'Finding Driver';
  }
 }
  

    return <>
        <NavBar title={getTitle()} />
        <View style={styles.container}>
            <View style={styles.containerTop}>  
                <View style={styles.containerTop_inner}>
                    <MapIcon />
                    <TouchableOpacity style={styles.currentLocationIcon} onPress={() => {
                        locationTask.getCurrentLocation()
                    }}>
                        <CurrentLocationIcon />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.container_inner,{backgroundColor:tripStatus === TripStatus.DROPPED ? '#13B15A' : '#0f223c'}]}>
                {renderScreen()}
            </View>
        </View>

        {
      showBottomSheet &&
      <AnimatedBottomSheetWrapper onClose={()=>{setShowBottomSheet(false)}}>
        <CancelComponent onClose={()=>{setShowBottomSheet(false)}} onCancel={handleCancel}   />
      </AnimatedBottomSheetWrapper>
      
     
    }
    {
      isPaymentMethodChangeShow &&
      <AnimatedBottomSheetWrapper onClose={()=>{setIspaymentMethodChangeShow(false)}}>
        <PaymentType onSelect={handlePaymentMethodChange} initialValue={paymentMethod} />
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
    
   
   
    zIndex: 100,
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
