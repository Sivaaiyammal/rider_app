import React, { useState ,useEffect} from 'react';
import { ScrollView, View, StyleSheet ,Text,TouchableOpacity} from 'react-native';
import FareHeader from '../../rideHistory/components/FareHeader';
import TripMetaInfo from '../../rideHistory/components/TripMetaInfo';
import TripPersonVehicle from '../../rideHistory/components/TripPersonVehicle';
import TripStats from '../../rideHistory/components/TripStats';
import AddressContainer from '../../../components/Trips/AddressContainer';
import {Fonts} from '../../../constants/constants';
import { useTranslation } from 'react-i18next'; 
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../../constants/constants';
import InvoiceScreen from '../../rideHistory/screens/InvoiceScreen';
import {utils} from '../../../utils/Utils';
import { DataStore } from '../../../controllers/DataStore';
import PREF from '../../../storage/PREF';
import { getTripDetails } from '../../../API/EndPoints/EndPoints';
import SkeletonLoader from '../../../components/Loaders/SkeletonLoader';

import usePaymentStore from '../store/usePaymentStore';
import AppConfig from '../../../Config/AppConfig';
import ScrollHintChevron from '../../../components/Common/ScrollHintChevron';
import { createOrder } from '../../../API/EndPoints/EndPoints';
import RazorpayCheckout from 'react-native-razorpay';
import APIURLConfig from '../../../Config/APIURLConfig';
import { showToast } from '../../../utils/Toast';
import { showNotification } from '../../../components/NotificationManger';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import  useUserInfoStore  from '../../../store/useUserInfoStore';

const PaymentScreen = () => {

  const {t} = useTranslation();
  const {currentTripId,tripStatus,rideId,tripFare,tripDistance,tripDuration,driverDetails,vehicleDetails,paymentMethod,isLoading,setTripDetails,tripStops,fareDetails,bookingTime,supplierDetails,recipientDetails,adminDetails,paymentStatus,invoiceId } = usePaymentStore();
  const [showInvoice, setShowInvoice] = useState(false);
  const [svHeight, setSvHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const isPaymentGateway = AppConfig.PAYMENT_METHODS === "PG";
  const {setStackScreen} = useStackScreenStore();
  const { incrementTotalSpend,incrementCompletedTrips } = useUserInfoStore();
  const handleInvoicePress = () => {
    setShowInvoice(true);
  };
 
  const handleInvoiceClose = () => {
    setShowInvoice(false);
  };

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


       const driveracountNumber = driverDetails?.razorPayId;
       if(!driveracountNumber){
        showNotification("Driver account number not found","Please contact support","error");
        return;
       }

       const splitAmount = (fareDetails?.breakdown?.subtotal+fareDetails?.breakdown?.taxes?.total).toFixed(2);
    
   
      
        const receiptId = `Rept-${rideId}`;

        const transfer=[
          {
            "account": "acc_RBAIEQk10FZmhU",
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
            showNotification('Order creation failed. Please try again.');
            return;
          }
          
          try{
          const options = {
            description: 'Trip Fare',
            image: 'https://virtualmaze.com/images/Logo-header.svg',
            currency: 'INR',
            key: APIURLConfig.RAZORPAY_KEY_ID,
            amount: amount,
            name: AppConfig.companyName,
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
              showNotification("Payment Successful",data?.razorpay_payment_id || 'Payment successful','success');
              
            })
            .catch((error) => {
              // handle failure
              showNotification("Payment Failed",error?.message || 'Something went wrong. Please try again.','error');
            });
        } 
        catch (error) {
          showNotification("Payment Failed","Something went wrong. Please try again.",'error');
        } 
       
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
        <FareHeader fare={tripFare}  RideStatus={tripStatus == "CANCELLED" ? "Ride was cancelled midway" : "Destination Reached"}  />
       
        <TripMetaInfo date={formatDate(bookingTime)} tripId={rideId} />
        <AddressContainer directions={tripStops} />
        <TripPersonVehicle driverName={driverDetails?.driverName} driverPhoto={driverDetails?.driverPhoto} vehicleType={driverDetails?.vehicleType} vehicleBrand={driverDetails?.vehicleBrand} vehicleModel={driverDetails?.vehicleModel} vehicleNumber={driverDetails?.vehicleNumber} />
        <View style={{marginVertical:15}}> 
        <TripStats totalDistance={tripDistance} totalDuration={tripDuration} totalFare={tripFare} />
        </View>
        <View style={styles.paymentMethodContainer}>
          <Text style={styles.paymentMethodLabel}>{t('Pay trip fare to driver')}</Text>
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
          <Text style={styles.invoiceButtonText}>{t('show_invoice')}</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      {isPaymentGateway && (
        <View style={styles.bottomBar}>
          {shouldShowScrollHint && (
            <ScrollHintChevron direction='down' style={{ top: -30, alignSelf: 'center' }} />
          )}
          <TouchableOpacity style={styles.bottomButton} onPress={handlePayNow}>
            <Text style={styles.bottomButtonText}>PAY NOW</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Invoice Modal Overlay */}
      <InvoiceScreen 
       invoiceId={invoiceId}
       rideId={rideId}
       tripFare={tripFare}
       tripDistance={tripDistance}
       tripDuration={tripDuration}
       driverDetails={driverDetails}
       vehicleDetails={vehicleDetails}
       tripStops={tripStops}
       bookingTime={bookingTime}
       fareDetails={fareDetails}
       paymentMethod={paymentMethod}
       supplierDetails={supplierDetails}
       recipientDetails={recipientDetails}
       adminInfo={adminDetails}
       paymentStatus={paymentStatus}
        visible={showInvoice}
        onClose={handleInvoiceClose}
      />
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
});

export default PaymentScreen;
