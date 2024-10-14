import {useCallback, useEffect, useRef, useState} from 'react';

import useMapStore from '../store/useMapStore';
import Marker from '../controllers/NEMap/Marker';
import { colors } from '../constants/constants';
import Circle from '../controllers/NEMap/Circle';
import { Polyline } from 'react-native-svg';

function GeofenceDrawer({onUpdate, onComplete, onDelete}) {
  const {
    setMapClickCallback,
    setMapMarkers,
    setGeometries,
    setMapDblclickCallback,
    geoFenceMeters,
  } = useMapStore();
  const {geometriesType} = useMapStore();
  const drawCompletedRef = useRef(false);
  const [markers, setMarkers] = useState([]);
  const [polyline, setPolyline] = useState(null);

  const onMapClick = useCallback(data => {
    if (drawCompletedRef?.current) return;
    const {latitude, longitude} = data;
    setMarkers(prevMarkers => {
      const marker = new Marker(
        'marker' + prevMarkers.length,
        prevMarkers.length,
        longitude,
        latitude,
        'start_marker',
      );
      console.log(marker.id, 'marker id');
      const selectedMarkers = geometriesType === 'Polygon' ? [...prevMarkers, marker] : [marker]
      return selectedMarkers;
    });
  }, []);

  const onMapDblClick = useCallback(
    data => {
      console.log(drawCompletedRef?.current, 'DRAW COMPLETED');
      if (drawCompletedRef?.current) return;
      onComplete
        ? onComplete([
            ...markers.map(marker => [marker.lng, marker.lat]),
            [markers[0].lng, markers[0].lat],
          ])
        : null;
      drawCompletedRef.current = true;
    },
    [markers],
  );

  useEffect(() => {
    setMapMarkers(markers);
    if (markers.length !== 0) {
      let fences;
      if (geometriesType === 'Polygon') {
        fences = new Polyline(
          new Date().getTime(),
          'geofence',
          [
            ...markers.map(marker => [marker.lng, marker.lat]),
            [markers[0].lng, markers[0].lat],
          ],
          colors.dark
        );
      } else {
        fences = new Circle(
          new Date().getTime(),
          'geofence',
          markers[markers.length - 1].lat,
          markers[markers.length - 1].lng,
          geoFenceMeters, 
          "#1A7d5fff",
          "#7d5fff", "medium"
        );
        fences.setFocus(true)
        fences.setPadding([20,20,20,380])
      }
      setPolyline(fences);
    }
  }, [markers,geoFenceMeters]);


  useEffect(() => {
    if (polyline) {
      setGeometries([polyline]);
    }
  }, [polyline]);

  useEffect(() => {
    setMapClickCallback(onMapClick);
    setMapDblclickCallback(onMapDblClick);
    setMapMarkers(null);
    setGeometries(null);

    return () => {
      setMapClickCallback(null);
      setMapDblclickCallback(null);
      setMapMarkers(null);
      setGeometries(null);
    };
  }, []);

  return <></>;
}

export default GeofenceDrawer;
