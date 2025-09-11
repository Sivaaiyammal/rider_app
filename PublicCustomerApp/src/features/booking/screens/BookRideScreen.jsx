import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import NavBar from '../../../components/NavBar';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import MapIcon from '../../../components/Map/MapIcon';
import CurrentLocationIcon from "../../../assets/icons/CurrentLocationIcon.svg"
import AddStopIcon from "../../../assets/icons/AddStopIcon.svg"
import { height, width } from '../../../utils/Utils';
import { colors, Fonts } from '../../../constants/constants';
import useRideBookingInfo from '../store/useRideBookingInfo';
import useDirectionLoad from '../hooks/useDirectionLoad';
import useMapStore from '../../map/store/useMapStore';
import useBookTrip from '../hooks/useBookTrip';
// Import the ride estimation mutation
// import { VEHICLE_LABELS } from '../../../constants/VehicleLabels';
import { getRideEstimation } from '../../../API/EndPoints/EndPoints';
import RideInfo from '../components/bookRide/RideInfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Schdule from '../../../assets/image/svgIcons/schdule.svg';


import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
import PaymentType from '../components/bookRide/PaymentType';
import VehicleList from '../components/bookRide/VehicleList';
import useRideVehicleStore from '../store/useRideVehicleStore'; 
import vehicleType from '../types/vehicleType.json'
import RidePreference from '../components/bookRide/RidePreference';
import CouponContainer from '../components/bookRide/CouponConatiner';
import useUserInfoStore from '../../../store/useUserInfoStore';
import { preferenceShowRideStatus } from '../../../storage/userLocalStorage';
import { utils } from '../../../utils/Utils';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import ScrollHintChevron from '../../../components/Common/ScrollHintChevron';
import { useDebouncedAPICall } from '../../../hooks/useDebounce';
import useRideSelectionStore from '../../../store/useRideSelectionStore';
import PropTypes from 'prop-types';
import  AppConfig  from '../../../Config/AppConfig';
import { useNearbyPollingControl } from '../../../store/useNearByDriverPollingControl';
import { useNearbyDriversStore } from '../../../store/useNearByDrivers';
import Marker from '../../../controllers/NEMap/Marker';


const BottomSheetHeader = (rideDistance,estimatedDuration,setShowPreference) => {
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
        
        const bounds = utils.getBoundingBox(coords)
       
        const margin = [50, 100, 50, height*0.65]
        // Structure bounds properly: [bounds, margin] where bounds is [minLon, minLat, maxLon, maxLat]
        const finalBounds = [bounds, margin]
        setMapBounds(finalBounds);
    }
    return (
        <View style={styles.bottomSheetHeaderContainer}>
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
        <View style={styles.handle}></View>
      
        <RideInfo distance={rideDistance} duration={estimatedDuration} showPreference={setShowPreference}/>
      
        </View>
    )
}
const BookRideScreen = ({DurationFromAddStopsScreen = null,DistanceFromAddStopsScreen = null}) => {
    const { t } = useTranslation();
    
    const {goBack,goBackToScreen} = useStackScreenStore()
        const {paymentType,setPaymentType, rideDistance,estimatedDuration,couponCode,setRegionOfficeId,setRegionOfficeCode, updateBookingInfo} = useRideBookingInfo()
    const [isPaymentTypeOpen, setIsPaymentTypeOpen] = useState(false)
    const {isPreferenceShow,setIsPreferenceShow} = useUserInfoStore()
    const {setAvailableVehicles,availableVehicles,setSelectedVehicle} = useRideVehicleStore()
    const [showPreference,setShowPreference] = useState(false)
    const [,setScrolledUntillBottom] = useState(false)
    
    // Use the direction load hook to transform ride locations to direction points
    const { 
        transformRideLocationsToDirectionPoints, 
        isRideLocationsReady,
        rideStartLocation,
        rideEndLocation,
        rideWayPoints
    } = useDirectionLoad();

    

    const { setDirectionReady} = useMapStore()     

    const {scheduleDateTime} = useRideSelectionStore();

    // Use the booking hook for trip booking
    const {
        bookTrip,
        isLoading: isBookingLoading,
        isBookingReady,
        getBookingValidationErrors,
        getCurrentBookingPayload
    } = useBookTrip();
    // const { start } = useNearbyPollingControl();
    // const { drivers } = useNearbyDriversStore();
    // const { setMapMarkers,mapMarkers } = useMapStore();
    // const { selectedVehicle } = useRideVehicleStore();

    const [showCoupon,setShowCoupon] = useState(false)



    // useEffect(()=>{
    //     if(AppConfig.SHOW_NEARBY_DRIVER){
    //         start();
    //     }
    // },[])


    // useEffect(()=>{
    //     if(drivers?.length > 0 && AppConfig.SHOW_NEARBY_DRIVER){

    //         const exisitingMarkers = mapMarkers.filter((marker)=>marker.name != 'driver-marker')
            
    //       const markers = drivers.filter((driver)=>driver.vehicleType == selectedVehicle?.type).map((driver)=>{
    
    //         const marker = new Marker(
    //           driver.id || 'driver-marker',
    //           'driver-marker',
    //           driver.lon,
    //           driver.lat,
    //           driver.vehicleType.toLowerCase(),
    //           48,
    //           false,
    //           driver.bearing || 0
    //         );
    //         return marker
    //       })
    //       if(markers.length > 0){
    //         setMapMarkers([...exisitingMarkers, ...markers])
    //       }
    //     }
    
    //     return ()=>{
    //       setMapMarkers([])
    //     }
    //   },[drivers])

  


    const handleDirectionReady = (data) => {
       // handleCurrentLocation()
        // Extract distance and duration from direction data
        if (data?.distance && data?.duration) {
            const distance = data.distance/1000; // Distance in meters
            const duration = data.duration/60; 
            // Duration in seconds
            updateBookingInfo({
                rideDistance: distance != null ? distance.toFixed(1) : null,
                estimatedDuration: Math.round(duration)
            });
            console.log("distance Got from direction data",distance)
            
        }
        
    }

    useEffect(() => {
        setDirectionReady(handleDirectionReady)
        if(DurationFromAddStopsScreen && DistanceFromAddStopsScreen){
            updateBookingInfo({
                rideDistance: DistanceFromAddStopsScreen,
                estimatedDuration: DurationFromAddStopsScreen
            });
        }
        setSelectedVehicle(null)
        return ()=>{
            setAvailableVehicles([])
        }
    }, [])

    const transformEstimateDatStore=(data)=>{
        const vehicleList = vehicleType.reduce((acc, spec, index) => {
            const rideTypeData = data?.[spec.type];
            if (!rideTypeData) return acc;
            acc.push({
                id: index,
                type: spec.type,
                capacity: spec.capacity,
                minFare: rideTypeData.minFare,
                maxFare: rideTypeData.maxFare,
                currency: rideTypeData.currency,
                estimatedDuration: rideTypeData.estimatedDuration ?? spec.estimatedDuration,
            });
            return acc;
        }, [])
 
        // Debug earlier to verify transform time
        console.log("vehicleList")

        // Set store state in one pass to minimize renders
        useRideVehicleStore.setState({
            availableVehicles: vehicleList,
            selectedVehicle: vehicleList[0] || null,
        })
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


            console.log("data?.result?.data?.fareRanges",data?.result?.data?.fareRanges)
      
            transformEstimateDatStore(data?.result?.data?.fareRanges)
                   
        } else {
            console.log('Estimation failed:', data?.message);
        }
    };

    const estimationInFlightRef = useRef(false);

    const estimationCaller = useCallback(async (payload) => {
        if (estimationInFlightRef.current) return;
        estimationInFlightRef.current = true;
        try {
            const data = await getRideEstimation(payload);
            onEstimationSuccess(data);
        } catch (error) {
            console.log('Estimation failed:', error);
        } finally {
            estimationInFlightRef.current = false;
        }
    }, []);

    const debouncedGetRideEstimation = useDebouncedAPICall(estimationCaller, 500);

    useEffect(() => {
        return () => {
            if (debouncedGetRideEstimation && debouncedGetRideEstimation.cancel) {
                debouncedGetRideEstimation.cancel();
            }
        }
    }, []);

    const getEstimatedFare = async () => {
        const payload = {
            distance: rideDistance, 
            duration: estimatedDuration, 
            coordinates: [rideStartLocation.longitude, rideStartLocation.latitude]
        };
        debouncedGetRideEstimation(payload);
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
            console.log("isRideLocationsReadyStarted",isRideLocationsReady())
            const result = transformRideLocationsToDirectionPoints({
                clearMarkers: true,
                vehicleType: 'car',
                padding:  [50, 50, 50, height*0.65]
            });
            console.log("directionEnded")
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
            updateBookingInfo({ rideDistance: null, estimatedDuration: null })
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

   

const handleBackPress = () => {
    
    updateBookingInfo({ rideDistance: null, estimatedDuration: null })
    goBack()
}



const handleCouponPress = () => {
    setShowCoupon(true)
}
const handleChangeScheduleTime=()=>{

    goBackToScreen('PlanRideScreen',{showScheduleTime:true})


}


const scheduleDate = scheduleDateTime?.date ? utils.formatDate(scheduleDateTime?.date) : ""
const scheduleTime = scheduleDateTime?.time ? utils.timestampTo12HourFormat(scheduleDateTime?.time) : ""

  return (
    <>
   <View>
    <NavBar onBackPress={handleBackPress} />
    {scheduleDate && <View style={styles.ScheduleOption}>
    <Schdule />
            <Text style={styles.rideSelectionTxt}>{scheduleDate && scheduleDate + " - " + scheduleTime}
            </Text>
           <TouchableOpacity 
            onPress={handleChangeScheduleTime}
            style={styles.editButton}
            activeOpacity={0.7}
           >
            <Icon name="edit" color="white" size={20} />
            </TouchableOpacity>
       
    </View>
}

   </View>
   <BottomSheetWrapper
        snapPoints={['60%']}
        index={0}
        enablePanDownToClose={false}
        enableOverDrag={true}
        enableScroll={true}
        handleComponent={()=>BottomSheetHeader(rideDistance,estimatedDuration,setShowPreference)}
        handleIndicatorStyle={{
          backgroundColor: '#DEDEDE',
          width: 50,
          height: 4,
        }}
      
   >
    {/* <BottomSheetHeader /> */}
 
      
    
   
      <VehicleList  availableVehicles={availableVehicles} setScrolledUntillBottom={setScrolledUntillBottom}/>
      <View style={{height:100}}/>
           

   </BottomSheetWrapper>
 
          <View style={styles.bottomContainer}>
          <ScrollHintChevron direction='down' style={{ top: -30, alignSelf: 'center' }} />
              <TouchableOpacity style={styles.CouponContainer} onPress={handleCouponPress}>
                 {!couponCode ? (
                   <>
                     <FontAwesome6 name="percent" size={20} color={colors.black} />
                     <Text style={styles.CouponText}>{t('offer_coupons')}</Text>
                     <Icon name="chevron-right" size={20} color="#888" />
                   </>
                 ) : (
                   <>
                    <FontAwesome6 name="percent" size={16} color={colors.grey_dark} />
                     <Text >{t('coupon')}</Text>
                     <Text style={[styles.CouponText, {fontFamily:Fonts.semi_bold}]}>{couponCode}</Text>
                     <Text>{t('applied')}</Text>
                   </>
                 )}

              </TouchableOpacity>
              <View style={styles.BookingButtonContainer}>
             
                  <TouchableOpacity style={styles.BookingPaymentContainer} onPress={handlePaymentType}>
                      <View style={styles.BookingPaymentHeader}>
                          <Text style={styles.BookingPaymentHeaderText}>{t('pay_by')}</Text>
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
                              {isBookingLoading ? t('booking') : t('confirm_ride')}
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

BookRideScreen.propTypes = {
  DurationFromAddStopsScreen: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  DistanceFromAddStopsScreen: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const styles = StyleSheet.create({
    bottomSheetHeader:{
        position:"absolute",
        
        width:width,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"flex-end",
        top:-115,
        paddingHorizontal:10,
       
    
    },
    bottomSheetHeaderContainer:{
       paddingHorizontal:10,
       paddingVertical:10,
       
    
    },
    mapActionContainer:{
        flexDirection:"column",
        alignItems:"flex-end",
        justifyContent:"flex-end",
        gap:10,
        paddingBottom:10,
      
       
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
      
        backgroundColor: colors.black,
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
        backgroundColor:colors.green,
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
    },
    ScheduleOption:{
        
        position:"absolute",
        backgroundColor:"black",
        top:10,
        right:15,
        borderRadius:20,
        elevation:5,
        paddingVertical:5,
        paddingHorizontal:10,
        flexDirection:"row",
        gap:5,
        alignItems:"center",
        zIndex:9999


    },
    ScheduleOptionText:{
        backgroundColor:"transperent",
        color:"white"
       
    },
    rideSelectionTxt:{
    color: colors.white,
    fontFamily: Fonts.regular,
    fontSize: 14,
    display: 'flex',
    paddingLeft:5,
    },
    editButton:{
        paddingLeft:10,
        paddingRight:5,
        paddingVertical:5,
    },
    handle:{
        width:"15%",
        alignSelf:"center",
        height:7,
        backgroundColor:colors.grey_light,
        borderRadius:10,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop:10,
        borderColor: 'black',
        borderWidth:1,
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 5,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,

      
      },
      selectedVehicleCard: {
        borderWidth:1,
        borderColor: '#0f223c',
      
       
      },
      selectedText: {
        color: colors.white,
      },
      vehicleImageContainer: {
        width: 56,
        height: 56,
        marginRight: 14,
        alignItems: 'center',
        justifyContent: 'center',
      },
      vehicleImage: {
        width: 65,
        height: 65,
      },
      vehicleInfoContainer: {
        flex: 1,
        justifyContent: 'center',
      },
      rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop:5
      },
      vehicleNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap:5,
        marginTop:5,
        flex:1
      },
      evContainer: {
        backgroundColor: "green",
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
      },
      evText: {
        fontSize: 12,
        fontFamily:Fonts.medium,
        color: colors.white,
        fontStyle:"italic",
      },
      vehicleNameText: {
        fontSize: 16,
        fontFamily:Fonts.regular,
        color: colors.black,
      },
      vehicleName: {
        fontSize: 16,
        fontFamily:Fonts.regular,
        color: colors.black,
      },
      price: {
        fontSize: 16,
        fontFamily:Fonts.medium,
        color: colors.black,
      },
      timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      timeText: {
        fontSize: 13,
        color: "#757575",
        marginLeft: 4,
        fontFamily:Fonts.regular,
      },
      dot: {
        fontSize: 16,
        color: "#757575",
        marginHorizontal: 6,
        fontFamily:Fonts.bold,
      },
      dropTime: {
        fontSize: 13,
        color: "#757575",
      },
      passengerRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      passengerText: {
        fontSize: 13,
        color: "#757575",
        marginLeft: 4,
      },
      confirmButton: {
        backgroundColor: colors.green,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
      },
      confirmButtonText: {
        fontSize: 16,
        fontWeight: Fonts.bold,
        color: colors.white,
      },

});

export default BookRideScreen;
