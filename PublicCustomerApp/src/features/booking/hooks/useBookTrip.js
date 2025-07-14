import { useCallback } from 'react';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import useBookingService from '../services/useBookingService';
import useCurrentRideInfoStore from '../../rideStatus/store/useCurrentRideInfoStore';

/**
 * Simple hook for booking trips with navigation handling
 * @returns {Object} Booking functions and state
 */
const useBookTrip = () => {
  const { setStackScreen } = useStackScreenStore();
  const { setTripData } = useCurrentRideInfoStore();
  // Booking success callback - navigate to appropriate screen
  const handleBookingSuccess = useCallback((data) => {
      //  console.log('data', data)
      // Navigate to ride status screen with booking data
      setStackScreen('TripScreenManager', {
        bookingData: data.data,
        tripId: data.data?.tripId || data.data?.bookingId
      });


  }, [setStackScreen]);

  // Booking error callback
  const handleBookingError = useCallback((error) => {
    console.log('Booking failed:', error);
    // Additional error handling can be added here
  }, []);

  // Initialize booking service with callbacks
  const bookingService = useBookingService({
    onSuccess: handleBookingSuccess,
    onError: handleBookingError
  });

  /**
   * Book trip with current booking data
   * @param {Object} customData - Optional custom data to override defaults
   */
  const handleBookTrip = useCallback(async (customData = null) => {
    try {
      // Check if booking is ready
      if (!bookingService.isBookingReady()) {
        const errors = bookingService.getBookingValidationErrors();
        console.log('Booking validation errors:', errors);
        return;
      }

      // Execute booking
      const result = await bookingService.bookTrip(customData);

      
      if(result?.success && result?.trip){
        setTripData(result.trip);
        setStackScreen('RideStatus', {
         
        });
        return result;
      }
      return result;
      
    } catch (error) {
      console.error('Booking failed:', error);
      throw error;
    }
  }, [bookingService]);

  /**
   * Get current booking payload for debugging
   * @returns {Object} Current booking payload
   */
  const getCurrentBookingPayload = useCallback(() => {
    try {
      return bookingService.prepareBookingPayload();
    } catch (error) {
      console.error('Error preparing booking payload:', error);
      return null;
    }
  }, [bookingService]);

  return {
    // Booking state
    isLoading: bookingService.isLoading,
    isError: bookingService.isError,
    error: bookingService.error,
    data: bookingService.data,
    
    // Booking actions
    bookTrip: handleBookTrip,
    getCurrentBookingPayload,
    
    // Validation
    isBookingReady: bookingService.isBookingReady,
    getBookingValidationErrors: bookingService.getBookingValidationErrors,
    
    // Current booking data
    bookingData: bookingService.bookingData
  };
};

export default useBookTrip; 