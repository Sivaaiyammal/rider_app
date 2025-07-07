import { useCallback } from 'react';
import useWayPointReorderStore from '../store/useWayPointReorderStore';
import useMapStore from '../../../features/map/store/useMapStore';

/**
 * Hook to transform waypoint reorder data into direction points for map display
 * @returns {Object} Object containing the transform function and current waypoint data
 */
const useWaypointDirectionLoad = () => {
  const { reOrderWaypoints } = useWayPointReorderStore();
  
  const { setDirectionPoints, setMapMarkers } = useMapStore();

  /**
   * Transforms reOrderWaypoints data into direction points format
   * @param {Object} options - Configuration options
   * @param {boolean} options.clearMarkers - Whether to clear existing map markers
   * @param {string} options.vehicleType - Type of vehicle for direction calculation
   */
  const transformWaypointsToDirectionPoints = useCallback((options = {}) => {
    const { clearMarkers = true, vehicleType = 'car' } = options;
    
    // Filter out valid waypoints with coordinates
    const validWaypoints = reOrderWaypoints.filter(waypoint => 
      waypoint.latitude && 
      waypoint.longitude && 
      waypoint.type !== 'add-stop'
    );
    
    // Only set direction points if we have at least 2 valid waypoints
    if (validWaypoints.length >= 2) {
      // Clear existing markers if requested
      if (clearMarkers) {
        setMapMarkers([]);
      }
      
      // Transform to the format expected by setDirectionPoints
      const directionPoints = {
        locations: validWaypoints.map(waypoint => ({
          lat: waypoint.latitude,
          lon: waypoint.longitude
        })),
        type: vehicleType
      };
      
      console.log('Waypoint direction points:', directionPoints);
      setDirectionPoints(directionPoints);
      
      return {
        success: true,
        directionPoints,
        waypointCount: validWaypoints.length,
        waypoints: validWaypoints
      };
    } else {
      // Clear direction points if not enough waypoints
      setDirectionPoints(null);
      
      return {
        success: false,
        error: 'Insufficient waypoints for route calculation',
        waypointCount: validWaypoints.length
      };
    }
  }, [reOrderWaypoints, setDirectionPoints, setMapMarkers]);

  /**
   * Check if waypoints are ready for direction calculation
   */
  const isWaypointsReady = useCallback(() => {
    const validWaypoints = reOrderWaypoints.filter(waypoint => 
      waypoint.latitude && 
      waypoint.longitude && 
      waypoint.type !== 'add-stop'
    );
    return validWaypoints.length >= 2;
  }, [reOrderWaypoints]);

  /**
   * Get all valid waypoints in order
   */
  const getValidWaypoints = useCallback(() => {
    return reOrderWaypoints.filter(waypoint => 
      waypoint.latitude && 
      waypoint.longitude && 
      waypoint.type !== 'add-stop'
    );
  }, [reOrderWaypoints]);

  /**
   * Get waypoints by type
   */
  const getWaypointsByType = useCallback((type) => {
    return reOrderWaypoints.filter(waypoint => waypoint.type === type);
  }, [reOrderWaypoints]);

  return {
    transformWaypointsToDirectionPoints,
    isWaypointsReady,
    getValidWaypoints,
    getWaypointsByType,
    reOrderWaypoints
  };
};

export default useWaypointDirectionLoad; 