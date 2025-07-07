import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
 
} from 'react-native';

import NavBar from '../../../components/NavBar';
import WaypointContainer from '../components/wayPoints/waypointContainer';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import useWayPointReorderStore from '../store/useWayPointReorderStore';
import useWaypointDirectionLoad from '../hooks/useWaypointDirectionLoad';
import useMapStore from '../../../features/map/store/useMapStore';
import  LocationTypes  from '../types/LocationTypes';
import { Fonts } from '../../../constants/constants';

const WaypointScreen = () => {
  const [isLoading] = React.useState(false);
  const {rideStartLocation,rideEndLocation,rideWayPoints,setRideStartLocation,setRideEndLocation,setRideWayPoints} =  useRideBookingLocationStore()
  const {reOrderWaypoints,setReOrderWaypoints} = useWayPointReorderStore()
  
  const { goBack,setStackScreen } = useStackScreenStore();

  // Use the waypoint direction load hook
  const { 
    transformWaypointsToDirectionPoints, 
    isWaypointsReady 
  } = useWaypointDirectionLoad();
  
  const { setDirectionPoints } = useMapStore();

 
 
  const onBackPress = () => {
    setReOrderWaypoints([])
    goBack();
    
  };

  useEffect(() => {
    console.log(reOrderWaypoints,"reOrderWaypoints")
    if(!reOrderWaypoints.length){
    let Arr=[]
    if(rideStartLocation){
      Arr.push(rideStartLocation)
    }
    if(rideWayPoints?.length){
      Arr=[...Arr,...rideWayPoints]
    }
    if(rideEndLocation){
      Arr.push(rideEndLocation)
    }
    console.log("Arr",Arr)
    
    // Transform the waypoints with proper type properties
    const transformedData = Arr.map((waypoint, index) => ({
      ...waypoint,
      id: waypoint.id || `waypoint-${index}-${Date.now()}`,
      type: index === 0 ? LocationTypes.START_LOCATION :LocationTypes.WAYPOINT_LOCATION
    }));
    
    setReOrderWaypoints(transformedData)
  }

 
  }, []);

  // Transform waypoints to direction points when waypoints are ready
  useEffect(() => {
    if (isWaypointsReady()) {
      const result = transformWaypointsToDirectionPoints({
        clearMarkers: true,
        vehicleType: 'car'
      });
      
      if (result.success) {
        console.log('Waypoint direction points set successfully:', result.waypointCount, 'waypoints');
      } else {
        console.log('Failed to set waypoint direction points:', result.error);
      }
    }
    
    // Cleanup: set direction points and reorder waypoints to null when component unmounts
    return () => {
      setDirectionPoints(null);
      
    };
  }, [transformWaypointsToDirectionPoints, isWaypointsReady, setDirectionPoints, setReOrderWaypoints]);

  // These functions are now handled by the WaypointContainer component
  // which uses the store directly

  const onConfirmRoute = () => {
    console.log(reOrderWaypoints,"reOrderWaypoints")
    
    if (reOrderWaypoints && reOrderWaypoints.length > 0) {
      // First index becomes start location
      const newStartLocation = reOrderWaypoints[0];
      newStartLocation.type = LocationTypes.START_LOCATION
      
      // Last index becomes end location
      const newEndLocation = reOrderWaypoints[reOrderWaypoints.length - 1];
      newEndLocation.type = LocationTypes.DESTINATION_LOCATION
      // Middle items become waypoints (excluding first and last)
      const newWayPoints = reOrderWaypoints.slice(1, reOrderWaypoints.length - 1);
      newWayPoints.map(waypoint => {
        waypoint.type = LocationTypes.WAYPOINT_LOCATION
        return waypoint
      })
      // Update the ride booking location store
      setRideStartLocation(newStartLocation);
      setRideEndLocation(newEndLocation);
      setRideWayPoints(newWayPoints);
      
      
    }
    
    // Reset reorder waypoints and go back
    setReOrderWaypoints([]);
    goBack();
    setStackScreen('BookRideScreen',{})
  }

  return (
    <>
      <View style={styles.topContainer}>
        <NavBar onBackPress={onBackPress} title={'Add Stops'} />
          <WaypointContainer />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          disabled={isLoading}
          onPress={onConfirmRoute}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? 'Confirming...' : 'Confirm Route'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
   
  },
  content: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 5,
    paddingHorizontal: 20,
   
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: 'transparent',
  },
  confirmButton: {
    backgroundColor: '#0f223c',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
   
    fontFamily: Fonts.medium,
  },
});

export default WaypointScreen;
