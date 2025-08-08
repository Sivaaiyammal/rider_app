import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { bookRide } from '../../../API/EndPoints/EndPoints';
import { showNotification } from '../../../components/NotificationManger';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import useRideBookingInfo from '../store/useRideBookingInfo';
import useRideVehicleStore from '../store/useRideVehicleStore';
import useRideMatching from '../../../hooks/useRideMatching';
import useRideMatchStore from '../../rideStatus/store/useRideMatchStore';
import useUserInfoStore from '../../../store/useUserInfoStore';
import useCurrentRideInfoStore from '../../rideStatus/store/useCurrentRideInfoStore';
import { TripStatus } from '../../rideStatus/types/TripStatus';
/**
 * Hook to handle trip booking with API integration
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Booking mutation and state
 */
const useBookingService = ({ onSuccess, onError } = {}) => {
  const { t } = useTranslation();
  const { 
    rideStartLocation, 
    rideEndLocation, 
    rideWayPoints 
  } = useRideBookingLocationStore();
  
  const { 
    rideDistance, 
    estimatedDuration, 
    paymentType,
    rideBookMode,
    passangerDetails,
    safeNightRides,
    femaleDriverOnly,
    couponCode,
    regionOfficeId,
    regionOfficeCode
  } = useRideBookingInfo();
  
  const { selectedVehicle } = useRideVehicleStore();
  const { resetRideMatchStatus } = useRideMatchStore();
  const { initializeSocket, startMatching } = useRideMatching();
  const { id: userId } = useUserInfoStore();
  const { setCurrentRideInfo,setTripStatus } = useCurrentRideInfoStore();
  /**
   * Prepare booking payload with dummy values for testing
   * @returns {Object} Formatted payload for booking API
   */
  const prepareBookingPayload = () => {
    // Validate required data
    if (!rideStartLocation || !rideEndLocation) {
      throw new Error(t('start_end_locations_required'));
    }

    if (!selectedVehicle) {
      throw new Error(t('vehicle_selection_required'));
    }

    // Prepare stops array with start, waypoints, and end locations
          const stops = [
        {
          name: t('pickup_point'),
          location: [rideStartLocation.longitude, rideStartLocation.latitude],
          address: rideStartLocation.address || rideStartLocation.name,
          waitingTime: 0,
          isReached:false
        }
      ];

    // Add waypoints if any
    if (rideWayPoints && rideWayPoints.length > 0) {
      rideWayPoints.forEach((waypoint, index) => {
        stops.push({
          name: `${t('stop')} ${index + 1}`,
          location: [waypoint.longitude, waypoint.latitude],
          address: waypoint.address || waypoint.name,
          waitingTime: waypoint.waitingTime || 0,
          isReached:false
        });
      });
    }

    // Add end location
    stops.push({
      name: t('drop_point'),
      location: [rideEndLocation.longitude, rideEndLocation.latitude],
      address: rideEndLocation.address || rideEndLocation.name,
      waitingTime: 0,
      isReached:false
    });

    // Build payload with dummy values for testing
    const payload = {
      // Location data
      startLocation: [rideStartLocation.longitude, rideStartLocation.latitude],
      endLocation: [rideEndLocation.longitude, rideEndLocation.latitude],
      stops: stops,

      // Vehicle and trip data
      vehicleType: selectedVehicle.type || 'AUTO',
      passangerCount: 1, 
      pickupTime: Date.now().toString(), 
      
      // Pricing data
      minFare: selectedVehicle.basePrice || 100, 
      estimatedDistance: rideDistance || 5, 
      estimatedDuration: estimatedDuration || 15, 
      maxFare: selectedVehicle.maxPrice || 150, 
      
      // Booking details
      bookingFor: rideBookMode, // Dummy value
      bookingForName: passangerDetails?.name || 'John Doe', // Dummy name
      bookingForPhone: passangerDetails?.phone || '+919876543210', // Dummy phone
      
      // Payment method
      paymentMethod: paymentType || 'CASH',
      nightRide:safeNightRides,
      femaleOnly:femaleDriverOnly,
      regionalOffice: regionOfficeId || null,
      regionCode: regionOfficeCode || 'default',

    };
    if(couponCode){
      payload.offerCoupon = couponCode
    }

    return payload;
  };

  /**
   * Booking mutation using react-query
   */
  const bookingMutation = useMutation({
    mutationFn: async (customPayload = null) => {
      const payload = customPayload || prepareBookingPayload();
      console.log('Booking payload:', JSON.stringify(payload));
      
      return await bookRide(payload);
    },
    onSuccess: async (data) => {
      console.log('Booking success:', JSON.stringify(data));
      
      if (data.success) {
        resetRideMatchStatus();        
        await initializeSocket();
        startMatching(data.tripId, userId,data?.trip?.vehicleType);
        setCurrentRideInfo(data)
        setTripStatus(TripStatus.PENDING)
        showNotification('Booking Successful', 'Your ride has been booked successfully!', 'success');
        
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        showNotification('Booking Failed', data.message || 'Failed to book ride', 'danger');
        
        if (onError) {
          onError(data);
        }
      }
    },
    onError: (error) => {
      console.error('Booking error:', error);
      
      const errorMessage = error?.message?.message || error?.message || t('failed_to_book_ride');
      showNotification(t('booking_error'), errorMessage, 'danger');
      
      if (onError) {
        onError(error);
      }
    }
  });

  /**
   * Book trip with validation
   * @param {Object} customData - Optional custom data to override defaults
   * @returns {Promise} Booking result
   */
  const bookTrip = async (customData = null) => {
    try {
      // Validate required data before booking
      if (!rideStartLocation || !rideEndLocation) {
        throw new Error(t('please_select_start_end_locations'));
      }

      if (!selectedVehicle) {
        throw new Error(t('please_select_vehicle'));
      }

      if (!paymentType) {
        throw new Error(t('please_select_payment_method'));
      }

      // Execute booking mutation
      return await bookingMutation.mutateAsync(customData);
      
    } catch (error) {
      console.error('Booking validation error:', error);
      showNotification(t('booking_error'), error.message, 'danger');
      throw error;
    }
  };

  /**
   * Check if booking is ready (all required data is available)
   * @returns {boolean} Whether booking can proceed
   */
  const isBookingReady = () => {
    return !!(
      rideStartLocation && 
      rideEndLocation && 
      selectedVehicle && 
      paymentType
    );
  };

  /**
   * Get booking validation errors
   * @returns {Array} Array of validation error messages
   */
  const getBookingValidationErrors = () => {
    const errors = [];
    
    if (!rideStartLocation) errors.push(t('start_location_required'));
    if (!rideEndLocation) errors.push(t('end_location_required'));
    if (!selectedVehicle) errors.push(t('vehicle_selection_required'));
    if (!paymentType) errors.push(t('payment_method_required'));
    
    return errors;
  };

  return {
    // Mutation state
    isLoading: bookingMutation.isLoading,
    isError: bookingMutation.isError,
    error: bookingMutation.error,
    data: bookingMutation.data,
    
    // Actions
    bookTrip,
    prepareBookingPayload,
    
    // Validation
    isBookingReady,
    getBookingValidationErrors,
    
    // Current booking data
    bookingData: {
      startLocation: rideStartLocation,
      endLocation: rideEndLocation,
      wayPoints: rideWayPoints,
      selectedVehicle,
      paymentType,
      rideDistance,
      estimatedDuration
    }
  };
};

export default useBookingService; 