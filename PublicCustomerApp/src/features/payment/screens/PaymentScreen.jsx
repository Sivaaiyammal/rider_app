import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import FareHeader from '../../rideHistory/components/FareHeader';
import TripMetaInfo from '../../rideHistory/components/TripMetaInfo';
import TripPersonVehicle from '../../rideHistory/components/TripPersonVehicle';
import TripStats from '../../rideHistory/components/TripStats';
import PaymentDetails from '../../rideHistory/components/PaymentDetails';
import SupportSection from '../../rideHistory/components/SupportSection';
import PayButton from '../../rideHistory/components/PayButton';
import AddressContainer from '../../../components/Trips/AddressContainer';

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

const PaymentScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FareHeader fare="₹117.50" />
        <TripMetaInfo date="Mon, Jan 01 2022 3:00 PM" tripId="ABC01234" />
        <AddressContainer directions={dummyDirections} />
        <TripPersonVehicle />
        <TripStats />
        <PaymentDetails />
        <SupportSection onPress={() => {}} />
      </ScrollView>
      <PayButton amount="₹117.50" onPress={() => {}} />
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
});

export default PaymentScreen;
