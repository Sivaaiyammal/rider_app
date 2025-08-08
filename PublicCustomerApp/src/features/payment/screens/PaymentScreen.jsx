import React from 'react';
import { ScrollView, View, StyleSheet ,Text} from 'react-native';
import FareHeader from '../../rideHistory/components/FareHeader';
import TripMetaInfo from '../../rideHistory/components/TripMetaInfo';
import TripPersonVehicle from '../../rideHistory/components/TripPersonVehicle';
import TripStats from '../../rideHistory/components/TripStats';
import PaymentDetails from '../../rideHistory/components/PaymentDetails';
import SupportSection from '../../rideHistory/components/SupportSection';
import PayButton from '../../rideHistory/components/PayButton';
import AddressContainer from '../../../components/Trips/AddressContainer';
import useCurrentRideInfoStore from '../../rideStatus/store/useCurrentRideInfoStore';
import useAssignedDriverInfoStore from '../../rideStatus/store/useAssignedDriverInfoStore';
import {Fonts} from '../../../constants/constants';
import { useTranslation } from 'react-i18next'; 
const dummyDirections = [
  {
    id: 1,
    address: 'Home, X street, Alwarpet, Chennai',
    locationName: 'Home',
  },
  {
    id: 2,
    address: 'Vrukshamaze, 12, Radhakrishnan Salai, Chennai',
    locationName: 'Vrukshamaze',
  },
];

const PaymentScreen = ({handlePayNow}) => {
  const {tripId,stops,vehicleType,finalDistance,finalDuration,finalFare,breakdownFare,paymentMethod}=useCurrentRideInfoStore()
  const {driverPhoto,driverName,brand,model,vehicleNumber}=useAssignedDriverInfoStore()
  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FareHeader fare={finalFare} />
        {paymentMethod == 'CASH' && (
          <View 
            style={[
              styles.cashPayment,
             
            ]}
          >
          
            <Text style={styles.cashPaymentText}>{t('please_pay_trip_fare')} ₹ {finalFare} {t('to_driver')}</Text>
          
          </View>
        )}
        <TripMetaInfo date="" tripId={tripId} />
        <AddressContainer directions={stops} />
        <TripPersonVehicle driverName={driverName} driverPhoto={driverPhoto} vehicleType={vehicleType} vehicleBrand={brand} vehicleModel={model} vehicleNumber={vehicleNumber} />
        <TripStats totalDistance={finalDistance} totalDuration={finalDuration} totalFare={finalFare} />
        <PaymentDetails finalFare={finalFare} breakdownFare={breakdownFare}/>
        <SupportSection onPress={() => {}} />
      </ScrollView>
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
    paddingBottom: 32,
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
});

export default PaymentScreen;
