import { NativeModules, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { useSelectedRouteStore } from '../../../Store/useTripsStore'
import UseBackButton from '../../../hooks/useBackButton';
import { useStackScreenStore } from '../../../Store/useStackScreenStore';
import PublicDriverTripPaymentScreen from '../PublicDriverTripPaymentScreen';
import { useMapMarkerStore } from '../../../Store/useMapMarkerStore';
import GlobalContext from '../../../Context/GlobalContext';
import usePublicDriverStore from '../../../Store/usePublicDriverStore';

const {NeNativeModule} = NativeModules;

const TripDetailScreen = () => {
    const {selectedTrip, setSelectedTrip} = useSelectedRouteStore();
    const {goBack} = useStackScreenStore();
    const {userInfo} = useContext(GlobalContext);
    const {setDirectionPoints,setMapBounds} = useMapMarkerStore();
    const onBackPress = () => {
        goBack('Home')
        setSelectedTrip(null)
        setDirectionPoints(null)
    }
    const {driverInfo}= usePublicDriverStore()

    useEffect(()=> {
        if (selectedTrip?.stops && selectedTrip?.stops.length !== 0) {
          const directions = selectedTrip?.stops?.map((direction)=>{
            return {
              lat: direction.location[1],
              lon: direction.location[0],
            }
          })
          setDirectionPoints({
            locations: directions,
            type: 'car',
          });
        }
      },[selectedTrip])

      const supplierInfo = selectedTrip?.supplierInfo ? {
        name: selectedTrip?.supplierInfo.VendorName,
        phone: selectedTrip?.supplierInfo.ownerPhone,
        email: selectedTrip?.supplierInfo.ownerEmail,
        state: selectedTrip?.supplierInfo.state,
        address: selectedTrip?.supplierInfo.fullAddress,
      }: {
        name: driverInfo.name || 'N/A',
        phone: driverInfo.phone || 'N/A',
        email: driverInfo.email || 'N/A',
        state: driverInfo.homeLocation?.state || 'N/A',
        address: driverInfo.homeLocation?.address || 'N/A',
        gstNumber: driverInfo.gstNumber || 'N/A',
        panNumber: driverInfo.panNumber || 'N/A',
      };
      

  return (
    <View style={styles.container}>
        <UseBackButton onBackPress={()=>{onBackPress(), setDirectionPoints(null), NeNativeModule.clearDirectionPoints()}}/>
        <PublicDriverTripPaymentScreen fareDetails={selectedTrip?.paymentDetails} tripDetials={selectedTrip} supplierInfo={supplierInfo} isDetailsScreen={true}/>
    </View>
  )
}

export default TripDetailScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
    }
})