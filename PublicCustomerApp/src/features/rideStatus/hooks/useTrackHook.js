import { useEffect, useRef, useMemo, useCallback } from 'react';
import useAssignedDriverInfoStore from '../store/useAssignedDriverInfoStore';
import useMapStore from '../../map/store/useMapStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import Marker from '../../../controllers/NEMap/Marker';
import usePolyLineTrack from './usePolyLineTrack';

const useTrackHook = (screenMode = 'arrival') => {
  const {
    driverLatitude,
    driverLongitude,
    driverAngle,
    vehicleNumber,
    brand,
    model,
    color,
    setDriverInfo
  } = useAssignedDriverInfoStore();

  const {
    setMapMarkers,
    setMapLocation
  } = useMapStore();

  const {
    rideStartLocation,
    rideEndLocation,
    vehicleType
  } = useCurrentRideInfoStore();

  const driverMarkerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const lastDriverLocationRef = useRef(null);
  const lastScreenModeRef = useRef(null);

  // Initialize polyline tracking
  const { clearPolyline, updatePolyline } = usePolyLineTrack(screenMode);

  // Memoize vehicle marker type to prevent recalculation
  const vehicleMarkerType = useMemo(() => {
    return vehicleType?.toLowerCase();
  }, [vehicleType]);

  // Memoize driver marker to prevent unnecessary re-creation
  const driverMarker = useMemo(() => {
    if (!driverLatitude || !driverLongitude) {
      return null;
    }

    // Check if driver location has actually changed to prevent infinite loops
    const currentLocation = `${driverLatitude},${driverLongitude}`;
    if (lastDriverLocationRef.current === currentLocation) {
      return driverMarkerRef.current; // No change, return existing marker
    }

    lastDriverLocationRef.current = currentLocation;

    const marker = new Marker(
      'driver-marker',
      'Driver',
      driverLongitude,
      driverLatitude,
      vehicleMarkerType,
      48,
      false,
      driverAngle || 0
    );
    marker.setTitle(vehicleNumber || 'Driver');
    marker.setSnippet(`${brand} ${model} - ${color}`);
    marker.setAnimate(true);
    // marker.setAnimationTime(1000);
    // marker.setFocus(true);
    driverMarkerRef.current = marker;

    return marker;
  }, [driverLatitude, driverLongitude, driverAngle]);

  // Memoize start marker (only for arrival screen)
  const startMarker = useMemo(() => {
    if (screenMode !== 'arrival' || !rideStartLocation) {
      return null;
    }

    const marker = new Marker(
      'start-marker',
      'Pickup Location',
      rideStartLocation.longitude || rideStartLocation.lng || rideStartLocation[0],
      rideStartLocation.latitude || rideStartLocation.lat || rideStartLocation[1],
      'default',
      36,
      false,
      0
    );
    marker.setTitle('Pickup Location');
    startMarkerRef.current = marker;
    return marker;
  }, [rideStartLocation, screenMode]);

  // Memoize end marker (only for on-ride screen)
  const endMarker = useMemo(() => {
    if (screenMode !== 'on-ride' || !rideEndLocation) {
      return null;
    }

    const marker = new Marker(
      'end-marker',
      'Destination',
      rideEndLocation.longitude || rideEndLocation.lng || rideEndLocation[0],
      rideEndLocation.latitude || rideEndLocation.lat || rideEndLocation[1],
      'default',
      36,
      false,
      0
    );
    marker.setTitle('Destination');
    endMarkerRef.current = marker;
    return marker;
  }, [rideEndLocation, screenMode]);

  // Handle screen mode changes and reset markers
  useEffect(() => {
    if (lastScreenModeRef.current !== screenMode) {
      // Screen mode changed, reset all markers and polylines
      setMapMarkers([]);
      clearPolyline();
      driverMarkerRef.current = null;
      startMarkerRef.current = null;
      endMarkerRef.current = null;
      lastDriverLocationRef.current = null;
      lastScreenModeRef.current = screenMode;
    }
  }, [screenMode, setMapMarkers, clearPolyline]);

  // // Update map location when driver location changes
  // useEffect(() => {
  //   if (driverLatitude && driverLongitude) {
  //     setMapLocation({
  //       lat: driverLatitude,
  //       lng: driverLongitude,
  //       zoom: 15,
  //     });
  //   }
  // }, [driverLatitude, driverLongitude, setMapLocation]);

  // Update map markers when any marker changes
  useEffect(() => {
    const markers = [];
    
    // Add start marker only for arrival screen
    if (screenMode === 'arrival' && startMarker) {
      markers.push(startMarker);
    }
    
    // Add end marker only for on-ride screen
    if (screenMode === 'on-ride' && endMarker) {
      markers.push(endMarker);
    }
    
    // Add driver marker for both screens
    if (driverMarker) {
      markers.push(driverMarker);
    }

    setMapMarkers(markers);
  }, [driverMarker, startMarker, endMarker, setMapMarkers, screenMode]);

  // Update polyline when driver location changes (for arrival screen)
  useEffect(() => {
    if (screenMode === 'arrival' && driverLatitude && driverLongitude) {
      updatePolyline();
    }
  }, [driverLatitude, driverLongitude, screenMode, updatePolyline]);

  const cleanupMarkers = useCallback(() => {
    setMapMarkers([]);
    clearPolyline();
    driverMarkerRef.current = null;
    startMarkerRef.current = null;
    endMarkerRef.current = null;
    lastDriverLocationRef.current = null;
    lastScreenModeRef.current = null;
  }, [setMapMarkers, clearPolyline]);

  const updateDriverLocation = useCallback((latitude, longitude, angle = null) => {
    setDriverInfo({
      driverLatitude: latitude,
      driverLongitude: longitude,
      ...(angle !== null && { driverAngle: angle })
    });
  }, [setDriverInfo]);

  return {
    updateDriverLocation,
    cleanupMarkers,
    driverMarker: driverMarkerRef.current,
    startMarker: startMarkerRef.current,
    endMarker: endMarkerRef.current
  };
};

export default useTrackHook;
