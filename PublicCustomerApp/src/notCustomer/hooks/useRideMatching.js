import { useEffect, useCallback, useRef } from 'react';
import rideMatchingSocketService from '../controllers/RideMatchingSocketService';
import useRideMatchStore from '../features/rideStatus/store/useRideMatchStore';
import useUserInfoStore from '../../common/store/useUserInfoStore';
import { Alert } from 'react-native';
import { useStackScreenStore } from '../store/useStackScreenStore';
import useCurrentRideInfoStore from '../features/rideStatus/store/useCurrentRideInfoStore';

/**
 * Custom hook to manage ride matching status and socket integration
 * @returns {Object} Ride matching state and methods
 */
const useRideMatching = () => {
  const {
    status,
    message,
    driverName,
    currentDriverLatitude,
    currentDriverLongitude,
    setRideMatchStatus,
    setStatus,
    setMessage,
    setDriverName,
    setCurrentDriverLatitude,
    setCurrentDriverLongitude,
    setDriverMatched
  } = useRideMatchStore();
  
  const { id: userId } = useUserInfoStore();
  const socketInitializedRef = useRef(false);
  const matchingActiveRef = useRef(false);
  const { goBack,goBackToScreen } = useStackScreenStore();
  const { setTripStatus } = useCurrentRideInfoStore();
  
  /**
   * Initialize socket connection for ride matching
   */
  const initializeSocket = useCallback(async (uid) => {
    console.log('initializeSocket',uid)
    if (socketInitializedRef.current || !uid) {
      console.log('userId',userId)
      return false;
    }
    
    try {
      console.log('🔌 Initializing ride matching socket...');
      const connected = await rideMatchingSocketService.initSocket(uid);
      
      if (connected) {
        console.log('✅ Ride matching socket initialized successfully');
        socketInitializedRef.current = true;
        
        
        
        // Remove any existing listeners first to prevent duplicates
        rideMatchingSocketService.off('matching_update');
        
        // Set up matching update listener
        rideMatchingSocketService.onMatchingUpdate((matchingData) => {
          console.log('📡 Received matching update:', matchingData);
          setRideMatchStatus(matchingData);
          if(matchingData?.status === 'MATCHED'){
            setTimeout(() => {
              setDriverMatched(true);
            }, 10000);
          }
          if(matchingData?.status === 'error'){
            resetSocket();
            setTripStatus(null);
            goBackToScreen('BookRideScreen',{RideMatchDriverNotFound:true});
          }
        });
        rideMatchingSocketService.onCancelRideMatch((matchingData) => {
          console.log('📡 Received matching update cancel ride match:', matchingData);
          setRideMatchStatus(matchingData);
        });

        return true;
      } else {
        console.warn('❌ Failed to initialize ride matching socket');
        return false;
      }
    } catch (error) {
      console.error('🚨 Error initializing ride matching socket:', error);
      return false;
    }
  }, [userId]);



  const resetSocket = useCallback(() => {
    console.log('resetSocket')
    socketInitializedRef.current = false;
    matchingActiveRef.current = false;
    setRideMatchStatus({
      status: null,
      message: null,
      driver: null
    });
  }, [setRideMatchStatus]);

  /**
   * Start ride matching process
   * @param {string} tripId - Trip ID for the ride
   * @param {string} passengerId - Passenger ID (optional, uses current user if not provided)
   */
  const startMatching = useCallback(async (tripId, passengerId = null,vehicleType) => {
    if (!tripId) {
      console.error('❌ Trip ID is required to start matching');
      return false;
    }

    const targetPassengerId = passengerId || userId;
    if (!targetPassengerId) {
      console.error('❌ Passenger ID is required to start matching');
      return false;
    }

    try {
      

      console.log('🚀 Starting ride matching for trip:', tripId);
      
      // Reset matching state
      setRideMatchStatus({
        status: 'searching',
        message: 'Searching for drivers...',
        driver: null
      });

      matchingActiveRef.current = true;

      // Send find driver request
      rideMatchingSocketService.findDriver(tripId, targetPassengerId,vehicleType);
      
      return true;
    } catch (error) {
      console.error('🚨 Error starting ride matching:', error);
      setRideMatchStatus({
        status: 'failed',
        message: 'Failed to start ride matching',
        driver: null
      });
      return false;
    }
  }, [userId, initializeSocket]);

  /**
   * Stop ride matching process
   */
  const stopMatching = useCallback((tripId,passengerId) => {
    console.log('🛑 Stopping ride matching');
    matchingActiveRef.current = false;
    rideMatchingSocketService.cancelRide(tripId,passengerId);
    
    setRideMatchStatus({
      status: 'cancelled',
      message: 'Ride matching cancelled',
      driver: null
    });
  }, []);

  /**
   * Retry ride matching
   * @param {string} tripId - Trip ID for the ride
   */
  const retryMatching = useCallback(async (tripId,vehicleType) => {
    console.log('🔄 Retrying ride matching for trip:', tripId);
    
    // Reset to searching state
    setRideMatchStatus({
      status: 'searching',
      message: 'Searching for drivers...',
      driver: null
    });

    return await startMatching(tripId,null,vehicleType);
  }, [startMatching]);

  /**
   * Reset ride matching state
   */
  const resetMatching = useCallback(() => {
    console.log('🔄 Resetting ride matching state');
    matchingActiveRef.current = false;
    
    setStatus(null);
    setMessage(null);
    setDriverName(null);
    setCurrentDriverLatitude(null);
    setCurrentDriverLongitude(null);
  }, [setStatus, setMessage, setDriverName, setCurrentDriverLatitude, setCurrentDriverLongitude]);

  /**
   * Check if matching is currently active
   */
  const isMatchingActive = useCallback(() => {
    return matchingActiveRef.current && status === 'searching';
  }, [status]);

  /**
   * Check if matching failed
   */
  const isMatchingFailed = useCallback(() => {
    return status === 'failed';
  }, [status]);

  /**
   * Check if driver was found
   */
  const isDriverFound = useCallback(() => {
    return status === 'success' && driverName && currentDriverLatitude && currentDriverLongitude;
  }, [status, driverName, currentDriverLatitude, currentDriverLongitude]);

  /**
   * Get current matching status
   */
  const getMatchingStatus = useCallback(() => {
    return {
      status,
      message,
      driverName,
      driverLocation: currentDriverLatitude && currentDriverLongitude 
        ? { latitude: currentDriverLatitude, longitude: currentDriverLongitude }
        : null,
      isActive: isMatchingActive(),
      isFailed: isMatchingFailed(),
      isDriverFound: isDriverFound()
    };
  }, [status, message, driverName, currentDriverLatitude, currentDriverLongitude, isMatchingActive, isMatchingFailed, isDriverFound]);

  

  return {
    // State
    status,
    message,
    driverName,
    driverLocation: currentDriverLatitude && currentDriverLongitude 
      ? { latitude: currentDriverLatitude, longitude: currentDriverLongitude }
      : null,
    
    // Computed states
    isMatchingActive: isMatchingActive(),
    isMatchingFailed: isMatchingFailed(),
    isDriverFound: isDriverFound(),
    
    // Methods
    initializeSocket,
    startMatching,
    stopMatching,
    retryMatching,
    resetMatching,
    getMatchingStatus,
    
    // Direct store setters (for advanced usage)
    setRideMatchStatus,
    setStatus,
    setMessage,
    setDriverName,
    setCurrentDriverLatitude,
    setCurrentDriverLongitude,
    resetSocket
  };
};

export default useRideMatching; 