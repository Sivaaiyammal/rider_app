import { useCallback, useEffect, useMemo, useState } from 'react';
import { findRoute } from '../../../controllers/NEMap/findRoute';
import Polyline from '../../../controllers/NEMap/Polyline';
import polyline from '@mapbox/polyline';
import  useCurrentRideInfoStore  from '../store/useCurrentRideInfoStore';
const useDrawStopsPolyline = () => {
    const {stops} = useCurrentRideInfoStore();
    const [stopspolyline,setPolyline] = useState(null);

    const points = useMemo(() => {
        return (stops || [])
            .filter(stop => !stop.isReached)
            .map(stop => ({ lat: stop.location[1], lon: stop.location[0] }));
    }, [stops]);

    const pointsSignature = useMemo(() => {
        return JSON.stringify(points);
    }, [points]);
  
    const fetchStops = useCallback(async () => {
        if (!points || points.length == 2) {
            setPolyline(null);
            return;
        }
        const routeData = await findRoute(points)
        
        if (!routeData?.trip?.legs || routeData.trip.legs.length === 0) {
          setPolyline(null);
          return;
        }
        
        const coordinates = await routeData.trip.legs.map(leg => {
          if (!leg.shape) {
            return [];
          }
          
          const decoded = polyline.decode(leg.shape, 6);
          return decoded.map(([lat, lon]) => [lon, lat]);
        }).flat();
        
        const polylineObj = new Polyline(
            'driver-to-start',
            'Driver to Pickup',
            coordinates,
            '#0000FF',
            'small'
        );
        polylineObj.setFocus(false)
        setPolyline(polylineObj);
    }, [points]);

    useEffect(() => {
        fetchStops();
    }, [fetchStops, pointsSignature]);

    return {stopspolyline};
    
}

export default useDrawStopsPolyline;    