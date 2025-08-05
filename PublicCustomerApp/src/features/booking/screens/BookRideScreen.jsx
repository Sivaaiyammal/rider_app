import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import NavBar from '../../../components/NavBar';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import BottomSheet from '../../../components/BottomSheet';
import MapIcon from '../../../components/Map/MapIcon';
import CurrentLocationIcon from "../../../assets/icons/CurrentLocationIcon.svg"
import AddStopIcon from "../../../assets/icons/AddStopIcon.svg"
import { height } from '../../../utils/Utils';
import { colors, Fonts } from '../../../constants/constants';
import useRideBookingInfo from '../store/useRideBookingInfo';
import useDirectionLoad from '../hooks/useDirectionLoad';
import useMapStore from '../../map/store/useMapStore';
import useBookTrip from '../hooks/useBookTrip';
// Import the ride estimation mutation
import { rideEstimation } from '../../../API/APICalls/RideAPICalls';
import RideInfo from '../components/bookRide/RideInfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';


import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
import PaymentType from '../components/bookRide/PaymentType';
import VehicleList from '../components/bookRide/VehicleList';
import useRideVehicleStore from '../store/useRideVehicleStore'; 
import vehicleType from '../types/vehicleType.json'
import BookingOptions from '../components/bookRide/BookingOptions';
import RidePreference from '../components/bookRide/RidePreference';
import CouponContainer from '../components/bookRide/CouponConatiner';
import useUserInfoStore from '../../../store/useUserInfoStore';
import { preferenceShowRideStatus } from '../../../storage/userLocalStorage';
import { utils } from '../../../utils/Utils';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import useFetchNearbyDrivers from '../../../hooks/useVehicleMarker';

const BottomSheetHeader = () => {
    const {setStackScreen,goBack} = useStackScreenStore()
    const {rideStartLocation,rideEndLocation,rideWayPoints} = useRideBookingLocationStore()
    const {setMapBounds} = useMapStore()
    const handleAddStop = () => {
        goBack()
        setStackScreen('WaypointScreen',{})
    }
    const handleCurrentLocation = async () => {
        // Set bounds for Chennai (approximate bounding box)
        // Southwest: 12.834, 80.182 | Northeast: 13.200, 80.322
        
        const coords = [[rideStartLocation.longitude,rideStartLocation.latitude],[rideEndLocation.longitude,rideEndLocation.latitude],...rideWayPoints.map(waypoint => [waypoint.longitude,waypoint.latitude])]
        
        console.log("=====> COORDS", coords)
        const bounds = utils.getBoundingBox(coords)
       
        const margin = [20,20,20,500]
        // Structure bounds properly: [bounds, margin] where bounds is [minLon, minLat, maxLon, maxLat]
        const finalBounds = [bounds, margin]
        console.log("=====> FINAL BOUNDS", finalBounds)
        setMapBounds(finalBounds);
    }
    return (
        <View style={styles.bottomSheetHeader}>
            <MapIcon />

            <View style={styles.mapActionContainer}>
            <TouchableOpacity style={styles.currentLocationIconContainer} onPress={handleCurrentLocation}>
                <CurrentLocationIcon width={25} height={25} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.currentLocationIconContainer} onPress={handleAddStop}>
                <AddStopIcon width={25} height={25} />
            </TouchableOpacity>
            </View>
        </View>
    )
}
const BookRideScreen = ({DurationFromAddStopsScreen = null,DistanceFromAddStopsScreen = null}) => {
    const {goBack} = useStackScreenStore()
        const {paymentType,setPaymentType, setRideDistance ,setEstimatedDuration,rideDistance,estimatedDuration,couponCode,setRegionOfficeId,setRegionOfficeCode} = useRideBookingInfo()
    const [isPaymentTypeOpen, setIsPaymentTypeOpen] = useState(false)
    const {isPreferenceShow,setIsPreferenceShow} = useUserInfoStore()
    const {setAvailableVehicles,availableVehicles,clearAvailableVehicles} = useRideVehicleStore()
    const [isLoading,setIsLoading] = useState(true)
    const [showPreference,setShowPreference] = useState(false)
    // Use the direction load hook to transform ride locations to direction points
    const { 
        transformRideLocationsToDirectionPoints, 
        isRideLocationsReady,
        rideStartLocation,
        rideEndLocation,
        rideWayPoints
    } = useDirectionLoad();

    // Fetch nearby drivers hook
    const { fetchNearbyDrivers, clearNearbyDrivers, nearbyDrivers, isLoading: isFetchingDrivers } = useFetchNearbyDrivers();

    const { setDirectionReady,setMapBounds} = useMapStore()     

    

    // Use the booking hook for trip booking
    const {
        bookTrip,
        isLoading: isBookingLoading,
        isBookingReady,
        getBookingValidationErrors,
        getCurrentBookingPayload
    } = useBookTrip();


    const [showCoupon,setShowCoupon] = useState(false)

    // Fetch nearby drivers when screen initializes
    useEffect(() => {
        if (rideStartLocation && rideStartLocation.latitude && rideStartLocation.longitude) {
            console.log('Fetching nearby drivers for location:', rideStartLocation);
            fetchNearbyDrivers([rideStartLocation.longitude, rideStartLocation.latitude]);
        }
    }, [rideStartLocation, fetchNearbyDrivers]);

    // Cleanup nearby drivers when component unmounts
    useEffect(() => {
        
        return () => {
            clearNearbyDrivers();
            
        };
    }, [clearNearbyDrivers]);


    useEffect(()=>{
        if(availableVehicles?.length > 0){
            setIsLoading(false)
        }
        
    },[availableVehicles])

    const handleDirectionReady = (data) => {
        handleCurrentLocation()
        // Extract distance and duration from direction data
        if (data?.distance && data?.duration) {
            const distance = data.distance/1000; // Distance in meters
            const duration = data.duration/60; 
            // Duration in seconds
            setRideDistance(Math.round(distance))
            setEstimatedDuration(Math.round(duration))
            
        }
        
    }

    const handleCurrentLocation = async () => {
        // Set bounds for Chennai (approximate bounding box)
        // Southwest: 12.834, 80.182 | Northeast: 13.200, 80.322
        
        const coords = [[rideStartLocation.longitude,rideStartLocation.latitude],[rideEndLocation.longitude,rideEndLocation.latitude],...rideWayPoints.map(waypoint => [waypoint.longitude,waypoint.latitude])]
        
        console.log("=====> COORDS", coords)
        const bounds = utils.getBoundingBox(coords)
       
        const margin = [100,100,100,500]
        // Structure bounds properly: [bounds, margin] where bounds is [minLon, minLat, maxLon, maxLat]
        const finalBounds = [bounds, margin]
        console.log("=====> FINAL BOUNDS", finalBounds)
        setMapBounds(finalBounds);
    }

    useEffect(() => {
        setDirectionReady(handleDirectionReady)
        if(DurationFromAddStopsScreen && DistanceFromAddStopsScreen){
            setRideDistance(DistanceFromAddStopsScreen)
            setEstimatedDuration(DurationFromAddStopsScreen)
        }
        return ()=>{
            setAvailableVehicles([])
        }
    }, [])

    // Log nearby drivers data for debugging
    useEffect(() => {
        if (nearbyDrivers.length > 0) {
            console.log('Nearby drivers found:', nearbyDrivers.length);
        }
    }, [nearbyDrivers]);

    // Log when fetching drivers
    useEffect(() => {
        if (isFetchingDrivers) {
            console.log('Fetching nearby drivers...');
        }
    }, [isFetchingDrivers]);


    const transformEstimateDatStore=(data)=>{
        console.log("=====> DATA", JSON.stringify(data))
    
        let vehicleList=[]

        vehicleType.forEach((item,index)=>{
            // Check if the data contains the vehicle type
            if(data && data[item.type]){
                const VehicleItem={
                    id:index,
                    type:item.type,
                    capacity:item.capacity,
                    minFare:data[item.type].minFare || item.minFare,
                    maxFare:data[item.type].maxFare || item.maxFare,
                    currency:data[item.type].currency || item.currency,
                    estimatedDuration:data[item.type].estimatedDuration || item.estimatedDuration,
                   
                }
                vehicleList.push(VehicleItem)
            }
        })

        setAvailableVehicles(vehicleList)
    }

    // Ride estimation mutation
    const onEstimationSuccess = (data) => {
       
        if (data?.result?.success) {
            // Handle successful estimation
            if(data?.regionCode){
                setRegionOfficeCode(data?.regionCode)
            }
            if(data?.regionOfficeId){
                setRegionOfficeId(data?.regionOfficeId)
            }
            transformEstimateDatStore(data?.result?.data?.fareRanges)
                   
        } else {
            console.log('Estimation failed:', data?.message);
        }
    };

    const { mutate: estimationMutate , isLoading: isEstimationLoading } = 
        rideEstimation(onEstimationSuccess);

    const getEstimatedFare = async () => {
        // Use direction data if available, otherwise use default values
        const payload = {
            distance: rideDistance, 
            duration: estimatedDuration, 
            coordinates: [rideStartLocation.longitude, rideStartLocation.latitude]
        };

        console.log("Sending estimation payload:", payload);
        estimationMutate(payload);
    };

   

    // Add effect to trigger estimation when direction data is available
    useEffect(() => {
        if (rideDistance && estimatedDuration ) {
            getEstimatedFare();
        }
    }, [rideDistance, estimatedDuration]);


    

  
    const { setDirectionPoints } = useMapStore();

    
    useEffect(() => {
        if (isRideLocationsReady()) {
            console.log('Setting direction points with:', {
                rideStartLocation,
                rideEndLocation,
                rideWayPoints,
            });
            const result = transformRideLocationsToDirectionPoints({
                clearMarkers: true,
                vehicleType: 'car'
            });
            if (result.success) {
                console.log('Direction points set successfully:', result.locationCount, 'locations');
            } else {
                console.log('Failed to set direction points:', result.error);
            }
        }
    }, [rideStartLocation, rideEndLocation, rideWayPoints, isRideLocationsReady, transformRideLocationsToDirectionPoints]);

    // Cleanup effect to clear direction points when component unmounts
    useEffect(() => {
        
        
        return () => {
            
            setDirectionPoints(null);
            setEstimatedDuration(null)
            setRideDistance(null)
        };
    }, [setDirectionPoints]);


    useEffect(() => {
        if(!isPreferenceShow){
            preferenceShowRideStatus("true")
            setIsPreferenceShow(true)
            setShowPreference(true)
        }
    }, [])

    
    const handlePaymentType = () => {
        setIsPaymentTypeOpen(true)        
    }
    const handlePaymentSelect = (paymentType) => {
        setPaymentType(paymentType)
        setIsPaymentTypeOpen(false)
    }

    const handleConfirmRide = async () => {
        try {
            // Check if booking is ready
            if (!isBookingReady()) {
                const errors = getBookingValidationErrors();
                console.log('Booking validation errors:', errors);
                return;
            }

            // Get current payload for debugging
            const payload = getCurrentBookingPayload();
            console.log('Booking payload:', payload);

            // Execute booking
            await bookTrip();
            
        } catch (error) {
            console.error('Booking failed:', error);
        }
    }

    const handleFemaleDriverToggle = () => {
      console.log("Female Driver option clicked")
        };

const handleBackPress = () => {
    
    setRideDistance(null)
    setEstimatedDuration(null)
    goBack()
}



const handleCouponPress = () => {
    setShowCoupon(true)
}
  return (
    <>
   <View>
    <NavBar onBackPress={handleBackPress} />

   </View>
   <BottomSheet
        minHeight={height*0.55}
       
        HeaderComponent={<BottomSheetHeader />}
   >
 
    <View style={styles.bottomSheetContent}>
        <View style={styles.contentContainer}>
            <RideInfo distance={rideDistance} duration={estimatedDuration} showPreference={setShowPreference}/>
            <BookingOptions label="Female Driver" onPress={handleFemaleDriverToggle} />
            <VehicleList isLoading={isLoading}  availableVehicles={availableVehicles}/>
           
        </View>
    </View>
   </BottomSheet>
 
          <View style={styles.bottomContainer}>
              <TouchableOpacity style={styles.CouponContainer} onPress={handleCouponPress}>
                 {!couponCode ? (
                   <>
                     <FontAwesome6 name="percent" size={20} color={colors.black} />
                     <Text style={styles.CouponText}>Offer Coupons</Text>
                     <Icon name="chevron-right" size={20} color="#888" />
                   </>
                 ) : (
                   <>
                    <FontAwesome6 name="percent" size={16} color={colors.grey_dark} />
                     <Text >Coupon</Text>
                     <Text style={[styles.CouponText, {fontFamily:Fonts.semi_bold}]}>{couponCode}</Text>
                     <Text>Applied</Text>
                   </>
                 )}

              </TouchableOpacity>
              <View style={styles.BookingButtonContainer}>
                  <TouchableOpacity style={styles.BookingPaymentContainer} onPress={handlePaymentType}>
                      <View style={styles.BookingPaymentHeader}>
                          <Text style={styles.BookingPaymentHeaderText}>Pay by</Text>
                          <View style={styles.BookingPaymentMode}>
                              <Text style={styles.BookingPaymentModeText}>{paymentType}</Text>
                              <Icon name="arrow-drop-down" color={colors.white} style={{ fontSize: 20 }}></Icon>
                          </View>
                      </View>
                  </TouchableOpacity>

                  <View style={styles.BookingButtonSection}>
                      <TouchableOpacity
                          style={[styles.BookingButton, isBookingLoading && styles.BookingButtonDisabled]}
                          onPress={handleConfirmRide}
                          disabled={isBookingLoading}
                      >
                          <Text style={styles.BookingButtonText}>
                              {isBookingLoading ? 'BOOKING...' : 'CONFIRM RIDE'}
                          </Text>
                      </TouchableOpacity>
                  </View>

              </View>
          </View>

   {isPaymentTypeOpen  && (
          <AnimatedBottomSheetWrapper onClose={()=>setIsPaymentTypeOpen(false)} zIndex={100000}>
            <PaymentType onSelect={handlePaymentSelect} initialValue={paymentType} />
          </AnimatedBottomSheetWrapper>
        )}

        {
            showPreference && (
                <AnimatedBottomSheetWrapper onClose={()=>setShowPreference(false)} zIndex={100000}>
                    <RidePreference  />
                </AnimatedBottomSheetWrapper>
            )
        }

        {
            showCoupon && 
            (
            <AnimatedBottomSheetWrapper onClose={()=>setShowCoupon(false)} zIndex={100000}>
                    <CouponContainer />
            </AnimatedBottomSheetWrapper>
            )
        }
   </>
  );
};

const styles = StyleSheet.create({
    bottomSheetHeader:{
        width:"100%",
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"flex-end",
        top:-height*0.085,
        paddingHorizontal:5,
       
       
    },
    mapActionContainer:{
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"flex-end",
        top:-height*0.03,
        right:15,
        gap:15,
    },
    bottomSheetContent: {
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    contentContainer: {
        width: '100%',
        flex: 1,
        
       
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#212121',
    },
    bottomSheetSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    bottomSheetInputContainer: {
        width: '100%',
        height: 100,
        backgroundColor: 'red',
    },
    currentLocationIconContainer: {
        padding:10,
        borderRadius:30,
        backgroundColor:"white",
        elevation:5
    },
    bottomContainer:{
        position:"absolute",
        bottom:0,
        left:0,
        right:0,
        zIndex:100000,
        elevation:10,
        backgroundColor:"white",
        borderTopWidth:1,
        borderColor:'#e0e0e0',
       
    },
    BookingButtonContainer:{
      
        backgroundColor: "#0f223c",
        width:"100%",
        borderTopLeftRadius:20,
        borderTopRightRadius:20,
        flexDirection:"row",
        padding:10,
       
        elevation:5,
       
    },
    BookingPaymentContainer:{
        width:"30%",
        alignItems:"flex-start",
        justifyContent:"center",
        paddingHorizontal:15
        
    
        
       
    },
    BookingButtonSection:{
        width:"70%",
        
      

    },
    BookingButton:{
        width:"100%",
        padding:15,
        backgroundColor:'#008d34',
        borderRadius:20,
        borderWidth:1,
        borderColor:"white",
       
    },
    BookingButtonText:{
        color:colors.white,
        fontSize:14,
        fontFamily:Fonts.medium,
        textAlign:"center",
    },
    BookingButtonDisabled:{
        backgroundColor:'#666',
        opacity:0.7,
    },
    
    BookingPaymentHeaderText:{
        fontSize:12,
        color:colors.white,
        fontFamily:Fonts.regular,
        
    },

   
    BookingPaymentModeText:{
        fontSize:16,
        fontFamily:Fonts.regular,
        color:colors.white,
    },
    BookingPaymentMode:{
        
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center",
        gap:5,
        
       
       
    },
    advanceOptionsContainer:{
        width:"100%",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth:1,
        borderBottomColor: '#E0E0E0',
        backgroundColor:"red",
        zIndex:100000
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        paddingHorizontal: 10,
    },
    toggleLabel: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.black,
        marginRight: 10,
    },
    customToggle: {
        width: 40,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    customToggleActive: {
        backgroundColor: '#008d34',
    },
    toggleThumb: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        position: 'absolute',
        left: 2,
    },
    toggleThumbActive: {
        left: 22,
        },
    CouponContainer:{
        width:"100%",
        paddingHorizontal:15,
        paddingVertical:10,
      
        zIndex:100000,
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row",
        gap:10,
        backgroundColor:"#fffae2",
        
    },
    CouponText:{
        fontSize:16,
        fontFamily:Fonts.regular,
        color:colors.black,
    }

});

export default BookRideScreen;
