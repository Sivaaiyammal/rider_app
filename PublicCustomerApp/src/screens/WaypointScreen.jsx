import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/constants';
import NavBar from '../components/NavBar';
import useMapStyleStore from '../store/useMapStyleStore';
import WaypointContainer from '../components/waypointContainer';
import { useStackScreenStore } from '../store/useStackScreenStore';

const WaypointScreen = () => {
  const [waypoints, setWaypoints] = useState([
    { id: 1, name: 'Covai Tech Park', address: '123 Main Street, City' },
    { id: 2, name: 'Singanallur', address: '456 Oak Avenue, City'},
   
   
  ]);
  const [isLoading] = useState(false);
  const { setMapStyle, setMapButtonStyle } = useMapStyleStore();
  const { goBack, setStackScreen } = useStackScreenStore();


  const onBackPress = () => {
    
    goBack();
    
  };

  useEffect(() => {
    // Dummy data initialization
    

    // setMapStyle({
    //   width: "100%",
    //   height: "100%",
    // });
    // setMapButtonStyle({
    //   right: 15,
    //   bottom: 80,
    // });
  }, []);

  // Add a dummy waypoint between pickup and drop
  const addWaypoint = () => {
    setWaypoints(prev => {
      const newId = prev.length + 1;
      const newWaypoint = {
        id: newId,
        name: `Stop ${prev.length - 1}`,
        address: 'Dummy Address',
      };
      // Insert before last (drop)
      const newArr = [...prev];
      newArr.splice(newArr.length - 1, 0, newWaypoint);
      return newArr;
    });
  };

  // Remove a waypoint (only if not pickup/drop)
  const removeWaypoint = (idx) => {
    setWaypoints(prev => prev.filter((_, i) => i !== idx));
  };

  // Reorder waypoints (drag-and-drop)
  const onReorderWaypoints = (newList) => {
    setWaypoints(newList);
  };

  return (
    <>
      <View style={styles.topContainer}>
        <NavBar onBackPress={onBackPress} title={'Add Stops'} />
        
          <WaypointContainer
            waypoints={waypoints}
            onAddWaypoint={addWaypoint}
            onRemoveWaypoint={removeWaypoint}
            onReorderWaypoints={onReorderWaypoints}
          />
        
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          disabled={isLoading}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? 'Confirming...' : 'Confirm Route'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
   
  },
  content: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 5,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: colors.yellow,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WaypointScreen;
