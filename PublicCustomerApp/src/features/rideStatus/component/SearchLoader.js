import { Text, View, StyleSheet } from 'react-native';
import React,{useEffect, useState, useMemo, useRef} from 'react';
import Pulse from '../../../components/Loaders/Pulse';
import SwipeBtn from '../../../components/SwipeBtn';
import VehicleRadarIcon from '../../../assets/icons/VehicleRadarIcon.svg';
import { colors, Fonts } from '../../../constants/constants';
import PropTypes from 'prop-types';
import useRideMatching from '../../../hooks/useRideMatching';
import useMapStore from '../../map/store/useMapStore';
import Marker from '../../../controllers/NEMap/Marker';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import FailedRideModal from './FailedRideModal';
import useUserInfoStore from '../../../store/useUserInfoStore';
import useMapStyleStore from '../../../store/useMapStyleStore';
const CARD_HEIGHT = 340;
const PULSE_SIZE = 200; // Large enough for radar effect
const PULSE_VISIBLE_HEIGHT = 110; // Only show lower part

const SearchLoader = ({ onCancel }) => {
  const { 
    message, 
    driverName, 
    driverLocation, 
    startMatching,
    status
  } = useRideMatching();
  const { setMapMarkers, setMapLocation } = useMapStore();
  const { vehicleType, tripId } = useCurrentRideInfoStore();
  const { id: userId } = useUserInfoStore();
  const [showFailedModal, setShowFailedModal] = useState(false);
  const lastDriverLocationRef = useRef(null);
  const {setMapStyle} = useMapStyleStore();   
  
  // Memoize the marker to prevent unnecessary re-creation
  const driverMarker = useMemo(() => {
    if (!driverLocation?.latitude || !driverLocation?.longitude || !driverName) {
      return null;
    }

    // Check if driver location has actually changed to prevent infinite loops
    const currentLocation = `${driverLocation.latitude},${driverLocation.longitude}`;
    if (lastDriverLocationRef.current === currentLocation) {
      return null; // No change, don't create new marker
    }

    lastDriverLocationRef.current = currentLocation;

    setMapLocation({
      lat: driverLocation.latitude,
      lng: driverLocation.longitude,
      zoom: 15,
    });

    const marker = new Marker(
      String(Math.random().toString()),
      driverName,
      driverLocation.longitude,
      driverLocation.latitude,
      vehicleType?.toLowerCase() || 'auto',
      36,
      true,
    );
    marker.setFocus(true);
    marker.setSnippet(driverName);

    return marker;

   
  }, [driverLocation?.latitude, driverLocation?.longitude, driverName, vehicleType]);

  useEffect(() => {
    
    if (status === "failed") {
      setShowFailedModal(true);
    } else {
      setShowFailedModal(false);
    }
  }, [status]);

  // Separate effect for updating map markers
  useEffect(() => {
    if (driverMarker) {
      
      setMapMarkers([driverMarker]);
    }
  }, [driverMarker, setMapMarkers]);

  const handleCancel = () => {
    setShowFailedModal(false);
    if (onCancel) {
      onCancel();
    }
  };

  useEffect(() => {
    setMapStyle({
      width: "100%",
      height: "70%",
    });

    return () => {
      setMapStyle({
        width: "100%",
        height: "100%",
      });
    };
  }, []);
  
  return (
    <View style={styles.cardContainer}>
      <View style={styles.pulseClipContainer}>
       
          <Pulse style={styles.pulse} />
        
        
      
      <View style={styles.MainContainer}>
     
      <VehicleRadarIcon width={56} height={56} />
          
      <View style={styles.textContainer}>
        <Text style={styles.search_boldText}>{message}</Text>
        
      </View>
      <View style={styles.buttonContainer}>
        <SwipeBtn
          name="Slide to Cancel"
          onHandleSwipeEnd={onCancel}
        />
      </View>
      </View>
      </View>

      {/* Failed Ride Modal */}
      <FailedRideModal
        visible={showFailedModal}
        onRetry={() => startMatching(tripId, userId)}
        onCancel={handleCancel}
        message={message || 'Unable to find a driver at the moment. Please try again.'}
      />
    </View>
  );
};

SearchLoader.propTypes = {
  onCancel: PropTypes.func.isRequired,
  vehicleType: PropTypes.string,
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    minHeight: CARD_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  MainContainer:{
    width: "100%",
    height: "100%",
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pulseClipContainer: {
    width: "100%",
    height: PULSE_VISIBLE_HEIGHT,
    flex:1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 0,
    marginBottom: 8,
  },
  pulseWrapper: {
  
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -(PULSE_SIZE - PULSE_VISIBLE_HEIGHT), // shift up so only lower part is visible
  },
 
  iconWrapper: {
    position: 'absolute',
    top: PULSE_SIZE / 2 - 28, // center icon in visible part
    left: '50%',
    transform: [{ translateX: -28 }],
    zIndex: 2,
  },
  textContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search_boldText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black,
    textAlign: 'center',
    zIndex: 1,
    marginBottom: 4,
  },
  search_Text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
    textAlign: 'center',
    zIndex: 1,
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
});

export default SearchLoader;