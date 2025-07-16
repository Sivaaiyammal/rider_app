import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import useMapStore from '../../../features/map/store/useMapStore';
import useBookTrip from '../hooks/useBookTrip';
// Import the ride estimation mutation
import { rideEstimation } from '../../../API/APICalls/RideAPICalls';

import Icon from 'react-native-vector-icons/MaterialIcons';
import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
import PaymentType from '../components/bookRide/PaymentType';
import VehicleList from '../components/bookRide/VehicleList';
import locationTask from '../../../controllers/GetCurrentLocation';
import { setAPNSToken } from '@react-native-firebase/messaging';
import useRideVehicleStore from '../store/useRideVehicleStore'; 
import vehicleType from '../types/vehicleType.json'
const BottomSheetHeader = () => {
    const {setStackScreen,goBack} = useStackScreenStore()
    const handleAddStop = () => {
        goBack()
        setStackScreen('WaypointScreen',{})
    }
    const handleCurrentLocation = async () => {
        await locationTask.getCurrentLocation();
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
const BookRideScreen = () => {
    const {goBack} = useStackScreenStore()
        const {paymentType,setPaymentType} = useRideBookingInfo()
    const [isPaymentTypeOpen,setIsPaymentTypeOpen] = useState(false)
    
    const {setAvailableVehicles,availableVehicles} = useRideVehicleStore()
    // Use the direction load hook to transform ride locations to direction points
    const { 
        transformRideLocationsToDirectionPoints, 
        isRideLocationsReady,
        rideStartLocation,
        rideEndLocation,
        rideWayPoints
    } = useDirectionLoad();

    // Use the booking hook for trip booking
    const {
        bookTrip,
        isLoading: isBookingLoading,
        isBookingReady,
        getBookingValidationErrors,
        getCurrentBookingPayload
    } = useBookTrip();

    const transformEstimateDatStore=(data)=>{
        console.log("data",data)
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
        console.log('Ride estimation success:', JSON.stringify(data));
        if (data?.result?.success) {
            // Handle successful estimation
          
            transformEstimateDatStore(data?.result?.data?.fareRanges)
                   
        } else {
            console.log('Estimation failed:', data?.message);
        }
    };

    const { mutate: estimationMutate , isLoading: isEstimationLoading } = 
        rideEstimation(onEstimationSuccess);

    const getEstimatedFare = async () => {
      

        const payload = {
           
            distance: 10, 
            duration: 20, 
           
        };

        console.log('Calling ride estimation with payload:', payload);
        estimationMutate(payload);
    };

    useEffect(() => {
        getEstimatedFare();
    }, []);

    // Get setDirectionPoints from useMapStore for cleanup
    const { setDirectionPoints } = useMapStore();

    // Effect for setting direction points (removed debounce)
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
        };
    }, [setDirectionPoints]);

    
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
  return (
    <>
   <View>
    <NavBar onBackPress={goBack} />

   </View>
   <BottomSheet
        minHeight={height*0.55}
        HeaderComponent={<BottomSheetHeader />}
   >
    <View style={styles.bottomSheetContent}>
        <VehicleList isLoading={isEstimationLoading}  availableVehicles={availableVehicles}/>
       
    </View>
   </BottomSheet>
   <View style={styles.BookingButtonContainer}>
    <TouchableOpacity style={styles.BookingPaymentContainer} onPress={handlePaymentType}>
        <View style={styles.BookingPaymentHeader}>
            <Text style={styles.BookingPaymentHeaderText}>Pay by</Text>
            <View style={styles.BookingPaymentMode}>
                <Text style={styles.BookingPaymentModeText}>{paymentType}</Text>
                <Icon name="arrow-drop-down" color={colors.white} style={{fontSize:20}}></Icon>
                

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

   {isPaymentTypeOpen  && (
          <AnimatedBottomSheetWrapper onClose={()=>setIsPaymentTypeOpen(false)} zIndex={100000}>
            <PaymentType onSelect={handlePaymentSelect} initialValue={paymentType} />
          </AnimatedBottomSheetWrapper>
        )}
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
    BookingButtonContainer:{
        position:"absolute",
        bottom:0,
        backgroundColor: "#0f223c",
        width:"100%",
        borderTopLeftRadius:20,
        borderTopRightRadius:20,
        flexDirection:"row",
        padding:10,
       
        elevation:5,
        zIndex:10000
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

});

export default BookRideScreen;
