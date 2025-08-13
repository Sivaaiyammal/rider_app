import React from 'react';
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
import { Fonts, colors } from '../../../constants/constants';
import { utils } from '../../../utils/Utils';

const RideDetailScreen = ({ TripData }) => {
  const { t } = useTranslation();
  const { setStackScreen,goBack } = useStackScreenStore();
  
  console.log(JSON.stringify(TripData), "TripData");
  
  // Use the actual trip data
  const rideData = TripData || {};

  const handleBackPress = () => {
    goBack();
  };

  const handleSupportPress = () => {
    // Handle support button press
    console.log('Support pressed');
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
      waitingTime: stop.waitingTime
    }));
  };

  


  const BreakdownFare = rideData?.customerInvoice ? utils.getInvoiceFormat(rideData?.customerInvoice) : utils.getFareBreakdown(rideData)

  return (
    <View style={styles.container}>
      <NavBar withBg onBackPress={handleBackPress} title={t('trip_details')} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FareHeader fare={rideData.fareDetails?.fare || rideData.estimatedFare || 0} />
        
        <TripMetaInfo 
          date={formatDate(rideData.bookingTime)} 
          tripId={rideData._id} 
        />
        
        <AddressContainer directions={transformStops(rideData.stops)} />
        
        <TripPersonVehicle 
          driverName={rideData.driverInfo?.driverName} 
          driverPhoto={rideData.driverInfo?.driverPhoto} 
          vehicleType={rideData.driverInfo?.vehicleType} 
          vehicleBrand={rideData.driverInfo?.vehicleBrand} 
          vehicleModel={rideData.driverInfo?.vehicleModel} 
          vehicleNumber={rideData.driverInfo?.vehicleNumber} 
        />
        
        <TripStats 
          totalDistance={rideData.finalDistance || rideData.estimatedDistance} 
          totalDuration={rideData.finalDuration || rideData.estimatedDuration} 
          totalFare={rideData.fareDetails?.fare || rideData.estimatedFare} 
        />
        
        <PaymentDetails 
          finalFare={rideData.fareDetails?.fare || rideData.estimatedFare} 
          breakdownFare={BreakdownFare}
        />
        
        <View style={styles.paymentMethodContainer}>
          <Text style={styles.paymentMethodLabel}>{t('payment_method')}</Text>
          <Text style={styles.paymentMethodValue}>{rideData.paymentMethod}</Text>
        </View>
        
        <View style={styles.paymentStatusContainer}>
          <Text style={styles.paymentStatusLabel}>{t('payment_status')}</Text>
          <Text style={[
            styles.paymentStatusValue, 
            { color: rideData.passengerPaymentStatus === 'completed' ? colors.green : colors.orange }
          ]}>
            {rideData.passengerPaymentStatus?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
        
        <SupportSection onPress={handleSupportPress} />
      </ScrollView>
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
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
    marginBottom: 8,
  },
  paymentMethodValue: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: colors.green,
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
    fontFamily: Fonts.regular,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RideDetailScreen;
