import { useEffect, useState } from "react";
import Marker from "../../../controllers/NEMap/Marker";
import useMapStore from "../../map/store/useMapStore";

const useStopsMarkerHook = (stops,driverLatitude,driverLongitude,vehicleType,markerType="default",driverAngle=0) => {
    const { setMapMarkers } = useMapStore();    
    const [markersList, setMarkersList] = useState([]);
    const markerId = ``;

    // Add or update driver marker
    useEffect(() => {
        setMarkersList(prevMarkers => {
            // Remove any existing driver marker
            const filtered = prevMarkers.filter(marker => marker.id !== 'driver');
            if (!driverLatitude || !driverLongitude) return filtered;
            const driverMarker = new Marker(`marker-driver-${markerType}`,'driver', driverLongitude, driverLatitude, vehicleType?.toLowerCase(), 48);
            if(driverAngle){
                driverMarker.setAngle(driverAngle);
            }
            return [...filtered, driverMarker];
        });
    }, [driverLatitude, driverLongitude, driverAngle]);

    // Add stop markers
    useEffect(() => {
        setMapMarkers([])
        if (!stops || stops.length === 0) {
            setMarkersList(prevMarkers => prevMarkers.filter(marker => marker.id === 'driver'));
            return;
        }

       
        
        const driverMarker = new Marker(`marker-driver-${markerType}`,'driver', driverLongitude, driverLatitude, vehicleType?.toLowerCase(), 48);
        if(driverAngle){
            driverMarker.setAngle(driverAngle);
        }

        if(markerType === "pickup"){  
            setMarkersList(prevMarkers => {
                // Remove all stop markers (keep only driver marker)
                const stopMarker0 = new Marker(`${0}-stop${markerType}`, stops[0].name, stops[0].location[0], stops[0].location[1], 'pickup_point', 75 )
                if(driverLatitude && driverLongitude){
                    return [driverMarker, stopMarker0];
                }else{
                    return [stopMarker0];
                }
            });
          }else{
        setMarkersList(prevMarkers => {
            // Remove all stop markers (keep only driver marker)
            const stopMarkers = stops.filter((stop)=>stop.isReached === false).map((stop,index) => {
                let markerName = stop?.name?.toLowerCase().replace(' ','_');
                let markerSize = markerName.includes('stop') ? 24 : 64;
                return new Marker(`${index}-stop${markerType}`, stop.name, stop.location[0], stop.location[1], markerName, markerSize);
            });
            if(driverLatitude && driverLongitude){
                return [driverMarker, ...stopMarkers];
            }else{
                return [...stopMarkers];
            }
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