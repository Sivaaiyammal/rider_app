import { getNearByDrivers } from '../API/EndPoints/EndPoints';
import useLocationStore from '../store/useLocationStore';
import { useState, useCallback } from 'react';

/**
 * Hook for fetching nearby drivers
 * @returns {Object} Fetch functions and state
 */
const useFetchNearbyDrivers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const { location } = useLocationStore();

  const fetchNearbyDrivers = useCallback(async (customLocation = null) => {
    if (!location && !customLocation) {
      setError('Location not available');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        radius: 10000, // 10km radius
        location: customLocation || location
      };
      
      const response = await getNearByDrivers(payload);
      
      if (response.success) {
        setNearbyDrivers(response.data || []);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch nearby drivers');
      }
    } catch (error) {
      console.error('Error fetching nearby drivers:', error);
      setError(error.message || 'Failed to fetch nearby drivers');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  const clearNearbyDrivers = useCallback(() => {
    setNearbyDrivers([]);
    setError(null);
  }, []);

  return {
    fetchNearbyDrivers,
    clearNearbyDrivers,
    nearbyDrivers,
    isLoading,
    error
  };
};

export default useFetchNearbyDrivers;
