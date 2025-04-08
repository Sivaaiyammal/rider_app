import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

import SearchLoader from '../components/Loaders/SearchLoader';
import {useStackScreenStore} from '../store/useStackScreenStore';
import useRideSelectionStore from '../store/useRideSelectionStore';
import { cancelRide } from '../API/EndPoints/EndPoints';
import { showNotification } from '../components/NotificationManger';
import locationTask from '../controllers/GetCurrentLocation';
import useLocationStore from '../store/useLocationStore';
import useMapStore from '../store/useMapStore';
import useMapStyleStore from '../store/useMapStyleStore';
const VehicleSearchScreen = () => {
   const { bookingDetails , updateBookingStatus} = useRideSelectionStore();
    const { setStackScreen } = useStackScreenStore();
    const {setBookingDetails,setCurrentFare} = useRideSelectionStore();
    const {resetMapStyle,setMapStyle} = useMapStyleStore();
  
    const {setDirections} = useLocationStore();

    const {
      setOnSearchResults,
      setMapMarkers,
      setDirectionPoints,
      setSearchUnit,
    } = useMapStore();


    setTimeout(() => {
      setMapStyle({
        width: "100%",
        height: "70%",
        transition: 'all 5s ease-in-out',
      });
    }, 50);
  
    const timeoutIdRef = useRef(null);

    const onCancelRide = async () => {
        console.log('onCancelRide');
        try {
            const response = await cancelRide({tripId: bookingDetails._id});
            if (response.success) {
                updateBookingStatus('CANCELLED');
                
                showNotification(response.message, '', 'success');
                setBookingDetails(null);
                setDirections([
                    { id: 1, name: 'Start', location: [], locationName: '' },
                    { id: 2, name: 'End', location: [], locationName: '' },
                ]);
                setOnSearchResults(null);
                setMapMarkers([]);
                setDirectionPoints(null);
                setSearchUnit('');
                setCurrentFare(null);
                if (timeoutIdRef.current) {
                    clearTimeout(timeoutIdRef.current);
                    timeoutIdRef.current = null;
                }
                resetMapStyle();
                setStackScreen('Home');
                await locationTask.getCurrentLocation();
            }
        } catch (error) {
            console.error('Error cancelling ride:', error);
            showNotification('Failed to cancel ride', '', 'danger');
        }
    }
  return (
    <View style={{ flex: 1 }}>
      <SearchLoader handleSwipeSuccess={onCancelRide} />
    </View>
  );
};

export default VehicleSearchScreen;
