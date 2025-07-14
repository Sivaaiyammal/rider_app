import { useMutation } from 'react-query';
import { bookRide } from '../../../API/EndPoints/EndPoints';
import { showNotification } from '../../../components/NotificationManger';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import useRideBookingInfo from '../store/useRideBookingInfo';
import useRideVehicleStore from '../store/useRideVehicleStore';
import useRideMatching from '../../../hooks/useRideMatching';
import useRideMatchStore from '../../rideStatus/store/useRideMatchStore';
import useUserInfoStore from '../../../store/useUserInfoStore';

/**
 * Hook to handle trip booking with API integration
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Booking mutation and state
 */
const useBookingService = ({ onSuccess, onError } = {}) => {
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
    passangerDetails
  } = useRideBookingInfo();
  
  const { selectedVehicle } = useRideVehicleStore();
  const { resetRideMatchStatus } = useRideMatchStore();
  const { initializeSocket, startMatching } = useRideMatching();
  const { id: userId } = useUserInfoStore();
  /**
   * Prepare booking payload with dummy values for testing
   * @returns {Object} Formatted payload for booking API
   */
  const prepareBookingPayload = () => {
    // Validate required data
    if (!rideStartLocation || !rideEndLocation) {
      throw new Error('Start and end locations are required');
    }

    if (!selectedVehicle) {
      throw new Error('Vehicle selection is required');
    }

    // Prepare stops array with start, waypoints, and end locations
    const stops = [
      {
        name: 'Pickup Point',
        location: [rideStartLocation.longitude, rideStartLocation.latitude],
        address: rideStartLocation.address || rideStartLocation.name
      }
    ];

    // Add waypoints if any
    if (rideWayPoints && rideWayPoints.length > 0) {
      rideWayPoints.forEach((waypoint, index) => {
        stops.push({
          name: `Stop ${index + 1}`,
          location: [waypoint.longitude, waypoint.latitude],
          address: waypoint.address || waypoint.name
        });
      });
    }

    // Add end location
    stops.push({
      name: 'Drop Point',
      location: [rideEndLocation.longitude, rideEndLocation.latitude],
      address: rideEndLocation.address || rideEndLocation.name
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
      distance: rideDistance || 5, 
      estimatedDuration: estimatedDuration || 15, 
      maxFare: selectedVehicle.maxPrice || 150, 
      
      // Booking details
      bookingFor: rideBookMode, // Dummy value
      bookingForName: passangerDetails?.name || 'John Doe', // Dummy name
      bookingForPhone: passangerDetails?.phone || '+919876543210', // Dummy phone
      
      // Payment method
      paymentMethod: paymentType || 'CASH',
    };

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
      console.log('Booking success:', data);
      
      if (data.success) {
        resetRideMatchStatus();        
        await initializeSocket();
        startMatching(data.tripId, userId);
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
      
      const errorMessage = error?.message?.message || error?.message || 'Failed to book ride';
      showNotification('Booking Error', errorMessage, 'danger');
      
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
        throw new Error('Please select start and end locations');
      }

      if (!selectedVehicle) {
        throw new Error('Please select a vehicle');
      }

      if (!paymentType) {
        throw new Error('Please select a payment method');
      }

      // Execute booking mutation
      return await bookingMutation.mutateAsync(customData);
      
    } catch (error) {
      console.error('Booking validation error:', error);
      showNotification('Booking Error', error.message, 'danger');
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
    
    if (!rideStartLocation) errors.push('Start location is required');
    if (!rideEndLocation) errors.push('End location is required');
    if (!selectedVehicle) errors.push('Vehicle selection is required');
    if (!paymentType) errors.push('Payment method is required');
    
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