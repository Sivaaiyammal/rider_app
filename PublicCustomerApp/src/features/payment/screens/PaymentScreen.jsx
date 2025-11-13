import React, { useState ,useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet ,Text,TouchableOpacity, ActivityIndicator, Animated, Dimensions, BackHandler, Platform } from 'react-native';
import FareHeader from '../../rideHistory/components/FareHeader';
import TripMetaInfo from '../../rideHistory/components/TripMetaInfo';
import TripPersonVehicle from '../../rideHistory/components/TripPersonVehicle';
import TripStats from '../../rideHistory/components/TripStats';
import AddressContainer from '../../../components/Trips/AddressContainer';
import {Fonts} from '../../../constants/constants';
import { useTranslation } from 'react-i18next'; 
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../../constants/constants';
import InvoiceScreen from '../../rideHistory/screens/InvoiceScreen';
import {utils} from '../../../utils/Utils';
import { DataStore } from '../../../controllers/DataStore';
import PREF from '../../../storage/PREF';
import { getTripDetails } from '../../../API/EndPoints/EndPoints';
import SkeletonLoader from '../../../components/Loaders/SkeletonLoader';

import usePaymentStore from '../store/usePaymentStore';
import ScrollHintChevron from '../../../components/Common/ScrollHintChevron';
import { createOrder } from '../../../API/EndPoints/EndPoints';
import RazorpayCheckout from 'react-native-razorpay';
import Config from "react-native-config";

import { showNotification } from '../../../components/NotificationManger';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import  useUserInfoStore  from '../../../store/useUserInfoStore';
import AdaptiveText from '../../../components/Common/AdaptiveText';
import useConfigStore from '../../../store/useConfigStore'; 

const PaymentScreen = () => {

  const {t} = useTranslation();
  const {currentTripId,tripStatus,rideId,tripFare,tripDistance,tripDuration,driverDetails,vehicleDetails,paymentMethod,isLoading,setTripDetails,tripStops,fareDetails,bookingTime,supplierDetails,recipientDetails,adminDetails,paymentStatus,invoiceId, razorPayAccountId } = usePaymentStore();
  const [showInvoice, setShowInvoice] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const overlayAnim = useRef(new Animated.Value(screenHeight)).current;
  const [svHeight, setSvHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { appConfig } = useConfigStore();
  const isPaymentGateway = appConfig?.PAYMENT_METHODS === "PG" && razorPayAccountId;
  const {setStackScreen} = useStackScreenStore();
  const { incrementTotalSpend,incrementCompletedTrips } = useUserInfoStore();
  const animateIn = () => {
    Animated.timing(overlayAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = (onEnd) => {
    Animated.timing(overlayAnim, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (onEnd) onEnd();
    });
  };

  const handleInvoicePress = () => {
    overlayAnim.setValue(screenHeight);
    setShowInvoice(true);
    requestAnimationFrame(animateIn);
  };
 
  const handleInvoiceClose = () => {
    animateOut(() => setShowInvoice(false));
  };

  console.log(driverDetails,"driverDetails")
  console.log(appConfig?.PAYMENT_METHODS,"appConfig")

  const fetchTripDetails = async () => {
    const currentTripId = await DataStore.loadData(PREF.CURRENT_TRIP);
    const tripDetails = await getTripDetails(currentTripId?.data);
    
    if(tripDetails?.success){
      setTripDetails(tripDetails);
    }
  }

  useEffect(()=>{
    fetchTripDetails();
    
  },[])
  useEffect(()=>{
    if(driverDetails){
      console.log(driverDetails,"driverDetails")
    }
  },[driverDetails])

  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        if (showInvoice) {
          handleInvoiceClose();
          return true;
        }

        if (Platform.OS === 'android') {
          BackHandler.exitApp();
          return true;
        }

        return false;
      };

      const backHandlerSub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandlerSub.remove();
    }, [showInvoice, handleInvoiceClose]),
  );

  if(isLoading){
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={[styles.scrollContent,{gap:20}]} showsVerticalScrollIndicator={false}>
          <SkeletonLoader height={80} borderRadius={10} />
          <View style={{ height: 16 ,justifyContent:"center",alignItems:"center",marginVertical:10}} >

          <SkeletonLoader height={18} width={'60%'} borderRadius={6} />
          <View style={{ height: 10 }} />
          <SkeletonLoader height={14} width={'40%'} borderRadius={6} />
          </View>

          <View style={{ height: 16 }} />
          <SkeletonLoader height={200} borderRadius={10} />

          <View style={{ height: 16 }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SkeletonLoader height={100} width={'32%'} borderRadius={10} />
            <SkeletonLoader height={100} width={'32%'} borderRadius={10} />
            <SkeletonLoader height={100} width={'32%'} borderRadius={10} />
          </View>

          <View style={{ height: 16 }} />
          <View style={styles.paymentMethodContainer}>
            <SkeletonLoader height={18} width={'50%'} borderRadius={6} />
            <View style={{ height: 12 }} />
            <View style={styles.paymentMethodKeyContainer}>
              <SkeletonLoader height={14} width={'30%'} borderRadius={6} />
              <SkeletonLoader height={14} width={'30%'} borderRadius={6} />
            </View>
            <View style={styles.paymentMethodKeyContainer}>
              <SkeletonLoader height={14} width={'30%'} borderRadius={6} />
              <SkeletonLoader height={14} width={'30%'} borderRadius={6} />
            </View>
          </View>

          <View style={{ height: 8 }} />
          <View style={styles.actionButtonsContainer}>
            <View style={{ flex: 1 }}>
              <SkeletonLoader height={52} borderRadius={10} />
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  const formatDate = (timestamp) => {
    return utils.formatDateAndTime(timestamp);
  };

  const shouldShowScrollHint = contentHeight > svHeight + 20 ;

  const handlePayNow = async () => {
    if (isProcessingPayment) return; // Prevent double tap
    setIsProcessingPayment(true);

    try {
      console.log(driverDetails,"driverDetails")
      const driveracountNumber = driverDetails?.razorPayId;
      if(!driveracountNumber){
        showNotification(t('driver_account_number_not_found'),t('please_contact_support'),"error");
        setIsProcessingPayment(false);
        return;
      }

      const splitAmount = fareDetails?.breakdown?.driverEarnings?.toFixed(2);

      const receiptId = `Rept-${rideId}`;

      const transfer=[
        {
          "account": driveracountNumber,
          "amount": splitAmount*100,
          "currency": "INR",
        },
      ]
      const response = await createOrder({
        amount: tripFare,
        currency: 'INR',
        receiptId: receiptId,
        transferList:transfer,
        tripId:currentTripId,
      });
      console.log(response,"response")

      if(response?.success){
        const orderId = response?.order?.id;
        const amount = response?.order?.amount;
        if (!orderId) {
          showNotification(t('order_creation_failed'),t('please_try_again'),"error");
          setIsProcessingPayment(false);
          return;
        }
        
        try{
          const options = {
            description: 'Trip Fare',
            image: 'https://virtualmaze.com/images/Logo-header.svg',
            currency: 'INR',
            key:appConfig?.RAZORPAY_KEY_ID,
            amount: amount,
            name: appConfig?.COMPANYNAME,
            order_id: orderId, // Replace this with an order_id created using Orders API.
            theme: { color: 'black' },
          };

          RazorpayCheckout.open(options)
            .then((data) => {
              console.log(JSON.stringify(data,null,2),"data")
              incrementTotalSpend(tripFare)
              incrementCompletedTrips()
              setStackScreen('TripFeedbackScreen',{});
              // handle success
              showNotification(t('payment_successful'),"","success");
              setIsProcessingPayment(false);
            })
            .catch((error) => {
              // handle failure
              showNotification(t('payment_failed'),error?.message || t('something_went_wrong'),"error");
              setIsProcessingPayment(false);
            });
        } 
        catch (error) {
          showNotification(t('payment_failed'),t('something_went_wrong'),"error");
          setIsProcessingPayment(false);
        } 
      } else {
        setIsProcessingPayment(false);
        showNotification(t('make_online_payment_failed'), t('please_try_again'),"error");
      }
    } catch (err) {
        showNotification(t('make_online_payment_failed'), t('please_try_again'),"error");
    
      setIsProcessingPayment(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => setSvHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(w, h) => setContentHeight(h)}
      >
        <FareHeader fare={tripFare}  RideStatus={tripStatus == "CANCELLED" ? t('ride_was_cancelled_midway') : t('destination_reached')}  />
       
        <TripMetaInfo date={formatDate(bookingTime)} tripId={rideId} />
        <AddressContainer directions={tripStops}  completed={true}/>
        <TripPersonVehicle driverName={driverDetails?.driverName} driverPhoto={driverDetails?.driverPhoto} vehicleType={driverDetails?.vehicleType} vehicleBrand={driverDetails?.vehicleBrand} vehicleModel={driverDetails?.vehicleModel} vehicleNumber={driverDetails?.vehicleNumber} />
        <View style={{marginVertical:15}}> 
        <TripStats totalDistance={tripDistance} totalDuration={tripDuration} totalFare={tripFare} />
        </View>
        <View style={styles.paymentMethodContainer}>
          <AdaptiveText style={styles.paymentMethodLabel}>{t('Pay_trip_fare_to_driver')}</AdaptiveText>
          <View style={styles.paymentMethodKeyContainer}>
            <Text style={styles.paymentMethodKey}>{t('trip_fare')}</Text>
            <Text style={styles.paymentMethodValue}> ₹ {tripFare}</Text>
          </View>
          <View style={styles.paymentMethodKeyContainer}>
            <Text style={styles.paymentMethodKey}>{t('payment_method')}</Text>
            <Text style={styles.paymentMethodValue}>{paymentMethod}</Text>
          </View>
        </View>
        {/* <SupportSection onPress={handleSupportPress} /> */}
        {/* Receipt Button */}
        <View style={styles.actionButtonsContainer}>
          {/* Invoice Button */}
          <TouchableOpacity style={styles.invoiceButton} onPress={handleInvoicePress}>
            <FontAwesome5 name="file-invoice" size={20} color={colors.black} />
            <AdaptiveText style={styles.invoiceButtonText}>{t('show_invoice')}</AdaptiveText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isPaymentGateway && (
        <View style={styles.bottomBar}>
          {shouldShowScrollHint && (
            <ScrollHintChevron direction='down' style={{ top: -30, alignSelf: 'center' }} />
          )}
          <TouchableOpacity
            style={[styles.bottomButton, isProcessingPayment && { opacity: 0.7 }]}
            onPress={handlePayNow}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <AdaptiveText style={styles.bottomButtonText}>PAY NOW</AdaptiveText>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {/* Invoice Overlay */}
      {showInvoice && (
        <Animated.View style={[styles.overlayContainer, { transform: [{ translateY: overlayAnim }] }]}>
          <InvoiceScreen 
            invoiceId={invoiceId}
            rideId={rideId}
            tripFare={tripFare}
            tripDistance={tripDistance}
            tripDuration={tripDuration}
            driverDetails={driverDetails}
            vehicleDetails={driverDetails}
            tripStops={tripStops}
            bookingTime={bookingTime}
            fareDetails={fareDetails}
            paymentMethod={paymentMethod}
            supplierDetails={supplierDetails}
            recipientDetails={recipientDetails}
            adminInfo={adminDetails}
            paymentStatus={paymentStatus}
            mode="inline"
            showHeader={true}
            onClose={handleInvoiceClose}
            rideStatus={tripStatus}
          />
        </Animated.View>
      )}
      {/* <PayButton amount={finalFare} onPress={handlePayNow} paymentMethod={paymentMethod} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    
  },
  cashPayment: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD54F',
    borderStyle:'dashed'
  },
 
  cashPaymentText: {
    fontSize: 16,
    fontFamily: Fonts.semi_bold,
    color: 'black',
    textAlign: 'center',
   
  },
  paymentMethodContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodLabel: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: colors.black,
    marginBottom: 15,
  },
  paymentMethodValue: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  paymentStatusContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentStatusLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
    marginBottom: 8,
  },
  paymentStatusValue: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    
  },
  receiptButton: {
    backgroundColor: colors.grey_xdark,
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    alignItems: 'center',
    flexDirection:"row",
    justifyContent:"center",
    
   flex:1
  },
  receiptButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black,
  },
  invoiceButton: {
    backgroundColor: colors.grey_xdark,
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    alignItems: 'center',
    flexDirection:"row",
    justifyContent:"center",
    gap:10,
    
    flex:1
  },
  invoiceButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black,
  },
  actionButtonsContainer:{
    flexDirection:"row",
    width:"100%",
    flex:1,
    gap:10
  },
  paymentMethodKeyContainer:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    gap:10,
    marginBottom:10
  },
  paymentMethodKey:{
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.grey_xxdark,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    zIndex: 100,
    elevation: 20,
    overflow: 'visible',
  },
  bottomButton: {
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  overlayContainer:{
    position:'absolute',
    left:0,
    right:0,
    top:0,
    bottom:0,
    backgroundColor: colors.white,
    zIndex: 9999,
    elevation: 12,
  },
});

export default PaymentScreen;
