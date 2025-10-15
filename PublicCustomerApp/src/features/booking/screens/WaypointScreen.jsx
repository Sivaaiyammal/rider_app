import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,

} from 'react-native';
import { useTranslation } from 'react-i18next';

import NavBar from '../../../components/NavBar';
import WaypointContainer from '../components/wayPoints/waypointContainer';
import FareDetailsModal from '../components/FareDetailsModal';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import useWayPointReorderStore from '../store/useWayPointReorderStore';
import useWaypointDirectionLoad from '../hooks/useWaypointDirectionLoad';
import useMapStore from '../../../features/map/store/useMapStore';
import  LocationTypes  from '../types/LocationTypes';
import { colors, Fonts } from '../../../constants/constants';
import { getPreFinalFare,passangerStopChangeRequest } from '../../../API/EndPoints/EndPoints';
import useCurrentRideInfoStore from '../../rideStatus/store/useCurrentRideInfoStore';
import { height } from '../../../utils/Utils';
import {utils} from '../../../utils/Utils';

const WaypointScreen = () => {
  const {tripId}=useCurrentRideInfoStore()
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showFareModal, setShowFareModal] = React.useState(false);
  const [fareData, setFareData] = React.useState(null);
  const [isFareLoading, setIsFareLoading] = React.useState(false);
  const {rideStartLocation,rideEndLocation,rideWayPoints,setRideStartLocation,setRideEndLocation,setRideWayPoints} =  useRideBookingLocationStore()
  const {reOrderWaypoints,setReOrderWaypoints,setReachedStops,reachedStops,waitingForDriverApproval,setWaitingForDriverApproval,onGoingRideStops,setOnGoingRideStops,setEditedRoutecheckText,editedRoutecheckText} = useWayPointReorderStore()
  const [distance,setDistance] = React.useState(0)
  const [duration,setDuration] = React.useState(0)
  const { goBack,setStackScreen } = useStackScreenStore();
  const [enableConfirmButton,setEnableConfirmButton] = React.useState(false)
  

 




  // Use the waypoint direction load hook
  const { 
    transformWaypointsToDirectionPoints, 
    isWaypointsReady 
  } = useWaypointDirectionLoad();
  
  const { setDirectionPoints,setDirectionReady } = useMapStore();

 
 
  const onBackPress = () => {
    setReOrderWaypoints([])
    setOnGoingRideStops(null)
    setReachedStops([])
    goBack();
    
  };

  

 
  useEffect(() => {
    const onHardwareBack = () => {
      onBackPress();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onHardwareBack);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onHardwareBack);
    };
  }, [onBackPress]);
  useEffect(() => {

    if (!reOrderWaypoints.length) {
    
      let Arr = []
      
      if (!onGoingRideStops) {
        if (rideStartLocation) {
          Arr.push(rideStartLocation)
        }
        if (rideWayPoints?.length) {
          Arr = [...Arr, ...rideWayPoints]
        }
        if (rideEndLocation) {
          Arr.push(rideEndLocation)
        }
     

    
        const transformedData = Arr.map((waypoint, index) => ({
          ...waypoint,
          id: waypoint.id || `waypoint-${index}-${Date.now()}`,
          type: index === 0 ? LocationTypes.START_LOCATION : LocationTypes.WAYPOINT_LOCATION
        }));
        console.log("transformedData",transformedData)
        if(transformedData.length > 1){
          setEnableConfirmButton(true)
        }
        setReOrderWaypoints(transformedData)
      } else {
        Arr=onGoingRideStops
        const reachedStops = Arr.filter((waypoint) => waypoint.isReached).map(item=>{
          return{
            ...item,
            latitude:item.location[1],
            longitude:item.location[0]
          }
        })
        const balanceStops = Arr.filter((waypoint) => !waypoint.isReached)
      
        setReachedStops(reachedStops)
        const transformedData = balanceStops.map((waypoint, index) => ({
          ...waypoint,
          id: waypoint.id || `waypoint-${index}-${Date.now()}`,
          type: index === 0 ? LocationTypes.START_LOCATION : LocationTypes.WAYPOINT_LOCATION,
          latitude: waypoint.location[1],
          longitude: waypoint.location[0]
        }));

        const editedRoutecheckText = transformedData.map((item)=>{
          return `${item.latitude},${item.longitude},${item.waitingTime}`
        }).join(",")
        console.log("waypoint editedRoutecheckText",editedRoutecheckText)
        setEditedRoutecheckText(editedRoutecheckText)


       


        setReOrderWaypoints(transformedData)
      }
    }


  setWaitingForDriverApproval(null)
    
 

  }, []);

  useEffect(() => {
    return () => {
      setIsLoading(false);
    }
  }, [])


  const handleDirectionReady = (data) => {
   
    // Extract distance and duration from direction data
    if(data?.duration){
      setDuration(Math.round(data?.duration/60))
    }
    if(data?.distance){
      setDistance(data?.distance != null ? (data.distance / 1000).toFixed(1) : null)
    }
}

useEffect(() => {
  setDirectionReady(handleDirectionReady)
}, [])


  // Transform waypoints to direction points when waypoints are ready
  useEffect(() => {
    if (isWaypointsReady()) {
      const result = transformWaypointsToDirectionPoints({
        clearMarkers: true,
        vehicleType: 'car',
        padding: [50, height*0.4, 50, 100]
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
    // goBack();
    setStackScreen('BookRideScreen',{
      DurationFromAddStopsScreen:duration,
      DistanceFromAddStopsScreen:distance,
    })
  }


  



  const getFare =async()=>{

  if(!distance && !duration){
   return 0
  }

   let TotalwaitingTime = 0

  const newWayPoints = [...reachedStops,...reOrderWaypoints]

  newWayPoints.map((item)=>{
    if(item === newWayPoints[0] || item === newWayPoints[newWayPoints.length - 1]){
      TotalwaitingTime += 0
    }else{
      TotalwaitingTime += item.waitingTime
    }
   })

   const Payload = {
    tripId:tripId,
    distance,
    duration,
    waitingTime:TotalwaitingTime,
   }

   

   setIsFareLoading(true)
   try {
    console.log("Payload",Payload)
     const res = await getPreFinalFare(Payload)

     console.log("res",res)
   
     
     if (res && res.fare) {
       setFareData({
         distance,
         duration,
         fare: res.fare.fare || 0,
         waitingTime: TotalwaitingTime
       });
       setShowFareModal(true);
     }
   } catch (error) {
     console.error("Error getting fare:", error);
   } finally {
     setIsFareLoading(false);
   }

  }

  const handleFareConfirm = () => {
    
    ConformEditedRoute();
  };

  const handleFareClose = () => {
    setShowFareModal(false);
  };

   
   
  
  



  const ConformEditedRoute = async() => {
    const filterKeys = (obj) => {
      const rest = { ...obj };
      delete rest.latitude;
      delete rest.longitude;
      delete rest.type;
      delete rest.locationFrom;
      delete rest.id;
      delete rest.placeName;
      return rest;
    };

    console.log("reOrderWaypoints",reOrderWaypoints)

    const updatedBalanceStops = reOrderWaypoints.map(item => ({
      ...filterKeys(item),
      address: utils.getFormatedHeader(item),
      location: item.location ? item.location : [item.longitude, item.latitude],
      isReached: item?.isReached || false,
      waitingTime: item?.waitingTime || 0,
    }));

    console.log("updatedBalanceStops",updatedBalanceStops)

    const updatedRideWayPoints = [
      ...reachedStops.map(item => ({
        ...filterKeys(item),
        address: item.address,
        location: item.location ? item.location : [item.longitude, item.latitude],
        isReached: item?.isReached || false,
        waitingTime: item?.waitingTime || 0,
      })),
      ...updatedBalanceStops
    ];

    const finalWaypoints = updatedRideWayPoints.map((item, index) => {
      let name;
      let waitingTime;
      if (index === 0) {
        name = t('pickup_point');
        waitingTime = 0
      } else if (index === updatedRideWayPoints.length - 1) {
        name = t('drop_point');
        waitingTime = 0
      } else {
        name = `${t('stop')} ${index}`;
        waitingTime = item.waitingTime
      }
     
      return {
        ...item,
        name,
        waitingTime
      };
    });

    console.log("finalWaypoints",finalWaypoints)


    const finalPayload = {
      tripId:tripId,
      distance,
      duration,
      stops:finalWaypoints,
      fare:fareData.fare
    }
    

    const res = await passangerStopChangeRequest(finalPayload)

   if(res && res.success){
    setWaitingForDriverApproval('PENDING')
    goBack();
    setOnGoingRideStops(null)
    setReOrderWaypoints([])
    setReachedStops([])
   }
  }

  return (
    <>
      <View style={styles.topContainer}>
      <NavBar onBackPress={onBackPress} title={t('add_stops')} />
          <WaypointContainer  setEnableConfirmButton={setEnableConfirmButton} editedRoutecheckText={editedRoutecheckText} />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled,!enableConfirmButton && styles.confirmButtonDisabled]}
          disabled={isLoading || !enableConfirmButton}
          onPress={async () => {
            setIsLoading(true);

            if (onGoingRideStops) {
              await getFare();
              setIsLoading(false);
            } else {
              onConfirmRoute();
            }
            setEditedRoutecheckText("")
          }}
        >
        {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.confirmButtonText]}>
              {onGoingRideStops ? t('confirm_edited_route'): t('confirm_route')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <FareDetailsModal
        visible={showFareModal}
        onConfirm={handleFareConfirm}
        onClose={handleFareClose}
        fareData={fareData}
        isLoading={isFareLoading}
        driverWaitingApproval={waitingForDriverApproval}
      />
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
    paddingLeft: 5,
    backgroundColor:"white",
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20,
    elevation:5,
   
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
    marginBottom:15,
    
    marginHorizontal: 10,
    borderRadius:12,

    backgroundColor: 'white',
  },
  confirmButton: {
    backgroundColor: '#0f223c',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#0f223c'+'90',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
   
    fontFamily: Fonts.medium,
  },
  confirmButtonDisabledText:{
    color:colors.grey_dark
  }
});

export default WaypointScreen;
