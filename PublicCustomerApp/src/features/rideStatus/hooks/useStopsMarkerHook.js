import { useEffect, useState } from "react";
import Marker from "../../../controllers/NEMap/Marker";
import useMapStore from "../../map/store/useMapStore";

const useStopsMarkerHook = (stops,driverLatitude,driverLongitude,vehicleType,markerType="default") => {
    const { setMapMarkers } = useMapStore();
    const [markersList, setMarkersList] = useState([]);

    // Add or update driver marker
    useEffect(() => {
        setMarkersList(prevMarkers => {
            // Remove any existing driver marker
            const filtered = prevMarkers.filter(marker => marker.id !== 'driver');
            if (!driverLatitude || !driverLongitude) return filtered;
            const driverMarker = new Marker('driver-to-start','driver', driverLongitude, driverLatitude, vehicleType?.toLowerCase(), 48);
            return [...filtered, driverMarker];
        });
    }, [driverLatitude, driverLongitude]);

    // Add stop markers
    useEffect(() => {
        if (!stops || stops.length === 0) {
            setMarkersList(prevMarkers => prevMarkers.filter(marker => marker.id === 'driver'));
            return;
        }
        if(markerType === "pickup"){  
            setMarkersList(prevMarkers => {
                // Remove all stop markers (keep only driver marker)
                const stopMarker0 = new Marker(`${0}-stop`, stops[0].name, stops[0].location[0], stops[0].location[1], 'default', 48)
                return [...prevMarkers, stopMarker0];
            });
          }else{
        setMarkersList(prevMarkers => {
            // Remove all stop markers (keep only driver marker)
            const driverMarkers = prevMarkers.filter(marker => marker.id === 'driver');
            const stopMarkers = stops.filter((stop)=>stop.isReached === false).map((stop,index) =>
                new Marker(`${index}-stop`, stop.name, stop.location[0], stop.location[1], 'default', 48)
            );
            return [...driverMarkers, ...stopMarkers];
        });
    }
    }, [stops]);

    // Sync markersList to map store
    useEffect(() => {
        
        setMapMarkers([...markersList]);

        return () => {
            setMapMarkers([]);
        }
    }, [markersList, setMapMarkers]);

    return { markersList };
};

export default useStopsMarkerHook;