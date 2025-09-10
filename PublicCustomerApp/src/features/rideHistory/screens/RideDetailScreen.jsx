import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import NavBar from '../../../components/NavBar';
import FareHeader from '../components/FareHeader';
import TripMetaInfo from '../components/TripMetaInfo';
import TripPersonVehicle from '../components/TripPersonVehicle';
import TripStats from '../components/TripStats';
import PaymentDetails from '../components/PaymentDetails';
import SupportSection from '../components/SupportSection';
import AddressContainer from '../../../components/Trips/AddressContainer';
import ReceiptScreen from './ReceiptScreen';
import InvoiceScreen from './InvoiceScreen';
import { Fonts, colors } from '../../../constants/constants';
import { utils } from '../../../utils/Utils';
import PropTypes from 'prop-types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const RideDetailScreen = ({ TripData }) => {
  const { t } = useTranslation();
  const { goBack } = useStackScreenStore();
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  
 
  
  // Use the actual trip data
  const rideData = TripData || {};

  const handleBackPress = () => {
    goBack();
  };

  const handleSupportPress = () => {
    // Handle support button press
    
  };

  const handleReceiptPress = () => {
    setShowReceipt(true);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
  };

  const handleInvoicePress = () => {
    setShowInvoice(true);
  };

  const handleInvoiceClose = () => {
    setShowInvoice(false);
  };

  const formatDate = (timestamp) => {
    return utils.formatDateAndTime(timestamp);
  };

  // Transform stops data to match AddressContainer expected format
  const transformStops = (stops) => {
    if (!stops || !Array.isArray(stops)) return [];
    
    return stops.map((stop, index) => ({
      id: index + 1,
      address: stop.address,
      locationName: stop.name,
      location: stop.location,
      isReached: stop.isReached,
      waitingTime: stop.waitingTime,
      arrivalTime: stop.arrivalTime,
    }));
  };

  
  const isFareCalculated= rideData?.fareDetails?.fare || rideData?.customerInvoice || null

  const BreakdownFare = isFareCalculated ? rideData?.customerInvoice? utils.getInvoiceFormat(rideData?.customerInvoice) : utils.getFareBreakdown(rideData?.fareDetails) : null

  return (
    <View style={styles.container}>
      <NavBar withBg onBackPress={handleBackPress} title={t('ride_details')} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {
           <FareHeader fare={rideData.fareDetails?.fare || rideData.estimatedFare || 0} RideStatus={utils.getRideStatus(rideData?.status)}/>
        }
        
        <TripMetaInfo 
          date={formatDate(rideData.bookingTime)} 
          tripId={rideData.rideId} 
        />
     
        <AddressContainer directions={transformStops(rideData.stops)} />
        
        
        <TripPersonVehicle 
          driverName={rideData.driverInfo?.driverName} 
          driverPhoto={rideData.driverInfo?.driverPhoto} 
          vehicleType={rideData?.vehicleType} 
          vehicleBrand={rideData.driverInfo?.vehicleBrand} 
          vehicleModel={rideData.driverInfo?.vehicleModel} 
          vehicleNumber={rideData.driverInfo?.vehicleNumber} 
        />

        <View style={{marginVertical:20}}>
        
        <TripStats 
          isNotCompleted={rideData?.status != "COMPLETED" && rideData?.status != "DIVERGED"}
          totalDistance={rideData.finalDistance } 
          totalDuration={rideData.finalDuration } 
          totalFare={rideData.fareDetails?.fare} 
        />
        </View>
       {/* {isFareCalculated && <PaymentDetails 
          finalFare={rideData.fareDetails?.fare || rideData.estimatedFare} 
          breakdownFare={BreakdownFare}
          
        />} */}
        
        <View style={styles.paymentMethodContainer}>
          <Text style={styles.paymentMethodLabel}>{t('payment_details')}</Text>
          <View style={styles.paymentMethodKeyContainer}>
            <Text style={styles.paymentMethodKey}>{t('trip_fare')}</Text>
            <Text style={styles.paymentMethodValue}> ₹ {rideData.fareDetails?.fare || "00.00"}</Text>
          </View>
          <View style={styles.paymentMethodKeyContainer}>
            <Text style={styles.paymentMethodKey}>{t('payment_method')}</Text>
            <Text style={styles.paymentMethodValue}>{rideData.paymentMethod}</Text>
          </View>
          {rideData.passengerPaymentStatus && <View style={styles.paymentMethodKeyContainer}>
          <Text style={styles.paymentMethodKey}>{t('payment_status')}</Text>
          <Text style={[
            styles.paymentMethodValue, 
           
          ]}>
            {rideData.passengerPaymentStatus?.toUpperCase() || 'PENDING'}
          </Text>

          </View>}
         
        </View>
        
        
        
        {/* <SupportSection onPress={handleSupportPress} /> */}
        
        {/* Receipt Button */}
       {(rideData?.status == "COMPLETED" || rideData?.status == "DIVERGED" )&& <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.receiptButton} onPress={handleReceiptPress}>
          <MaterialIcons name="receipt" size={20} color={colors.black} />
          <Text style={styles.receiptButtonText}> {t('view_receipt')}</Text>
        </TouchableOpacity>
        
        {/* Invoice Button */}
        <TouchableOpacity style={styles.invoiceButton} onPress={handleInvoicePress}>
          <FontAwesome5 name="file-invoice" size={20} color={colors.white} />
          <Text style={styles.invoiceButtonText}>{t('show_invoice')}</Text>
        </TouchableOpacity>
        </View>
        }
      </ScrollView>
      
      {/* Receipt Modal Overlay */}
      <ReceiptScreen 
        rideId={rideData?.rideId}
        tripFare={rideData.fareDetails?.fare}
        tripDistance={rideData.finalDistance }
        tripDuration={rideData.finalDuration }
        driverDetails={rideData.driverInfo}
        vehicleDetails={rideData.driverInfo}
        tripStops={rideData.stops}
        bookingTime={rideData.bookingTime}
        fareDetails={rideData.fareDetails}
        paymentMethod={rideData.paymentMethod}
        supplierDetails={rideData.supplier}
        recipientDetails={rideData.recipient}
        adminInfo={rideData.adminInfo}
        paymentStatus={rideData.passengerPaymentStatus}
        visible={showReceipt}
        onClose={handleReceiptClose}
      />
      
      {/* Invoice Modal Overlay */}
      <InvoiceScreen 
       rideId={rideData?.rideId}
       tripFare={rideData.fareDetails?.fare}
       tripDistance={rideData.finalDistance }
       tripDuration={rideData.finalDuration}
       driverDetails={rideData.driverInfo}
       vehicleDetails={rideData.driverInfo}
       tripStops={rideData.stops}
       bookingTime={rideData.bookingTime}
       fareDetails={rideData.fareDetails}
       paymentMethod={rideData.paymentMethod}
       supplierDetails={rideData.supplier}
       recipientDetails={rideData.recipient}
       adminInfo={rideData.adminInfo}
       paymentStatus={rideData.passengerPaymentStatus}
        visible={showInvoice}
        onClose={handleInvoiceClose}
      />
    </View>
  );
};

RideDetailScreen.propTypes = {
  TripData: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
    backgroundColor: colors.black,
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
    color: colors.white,
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
  
});

export default RideDetailScreen;
