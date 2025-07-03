import {
  Animated, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  Alert,
  ActivityIndicator,
  View
} from 'react-native';
import React, {useEffect, useRef, useState, useCallback} from 'react';
import SideDrawer from '../components/Drawer/SideDrawer';
import {colors, Fonts} from '../constants/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSheet from '../components/BottomSheet';
import {useStackScreenStore} from '../store/useStackScreenStore';
import MapScreenHeader from '../components/MapScreenHeader';
import HistoryCard from '../components/historyCard';
import useLocationStore from '../store/useLocationStore';
import Marker from '../controllers/NEMap/Marker';
import useMapStore from '../store/useMapStore';
import LinearGradient from 'react-native-linear-gradient';

const MapScreen = () => {
  // State management
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Store hooks
  const {setStackScreen} = useStackScreenStore();
  const {
    location,
    directions,
    setDirections, 
    currentLocationName,
    setSelectedInput
  } = useLocationStore(); 
  const {setMapMarkers, setDirectionPoints} = useMapStore();

  // Animation refs
  const scaleValue = useRef(new Animated.Value(1)).current;
  const offsetValue = useRef(new Animated.Value(0)).current;
  const closeButtonOffset = useRef(new Animated.Value(0)).current;

  // Animation configuration
  const ANIMATION_CONFIG = {
    duration: 300,
    useNativeDriver: true,
  };

  // Error handling utility
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    setError(error.message || 'An unexpected error occurred');
    
    // Show user-friendly alert
    Alert.alert(
      'Oops!',
      'Something went wrong. Please try again.',
      [{ text: 'OK', onPress: () => setError(null) }]
    );
  }, []);

  // Animation utilities
  const animateMenu = useCallback((toValue) => {
    try {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: toValue ? 0.9 : 1,
          ...ANIMATION_CONFIG,
        }),
        Animated.timing(offsetValue, {
          toValue: toValue ? 300 : 0,
          ...ANIMATION_CONFIG,
        }),
        Animated.timing(closeButtonOffset, {
          toValue: toValue ? -30 : 0,
          ...ANIMATION_CONFIG,
        }),
      ]).start();
    } catch (error) {
      handleError(error, 'animateMenu');
    }
  }, [scaleValue, offsetValue, closeButtonOffset, handleError]);

  // Menu toggle handler
  const toggleMenu = useCallback(() => {
    try {
      animateMenu(!showMenu);
      setShowMenu(!showMenu);
    } catch (error) {
      handleError(error, 'toggleMenu');
    }
  }, [showMenu, animateMenu, handleError]);

  // Handle menu state changes
  useEffect(() => {
    if (!showMenu) {
      animateMenu(false);
    }
    // Clear directions when menu is closed
    try {
      setDirections([]);
    } catch (error) {
      handleError(error, 'clearDirections');
    }
  }, [showMenu, animateMenu, setDirections, handleError]);

  // Validate location data
  const validateLocationData = useCallback((location, currentLocationName) => {
    if (!location || !Array.isArray(location) || location.length !== 2) {
      throw new Error('Invalid location data');
    }
    if (!currentLocationName || typeof currentLocationName !== 'string') {
      throw new Error('Invalid location name');
    }
    return true;
  }, []);

  // Create marker safely
  const createMarker = useCallback((id, name, latitude, longitude, type, size, isVisible) => {
    try {
      if (!id || !name || !latitude || !longitude) {
        throw new Error('Invalid marker data');
      }
      return new Marker(id, name, latitude, longitude, type, size, isVisible);
    } catch (error) {
      handleError(error, 'createMarker');
      return null;
    }
  }, [handleError]);

  // Handle search press with error handling
  const onSearchPress = useCallback(async (element = 'rideNow', item = null) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Search press:', { element, item });

      // Validate input parameters
      if (element && !['rideNow', 'searchBox'].includes(element)) {
        throw new Error('Invalid search element type');
      }

      // Handle location setup
      if (location && currentLocationName) {
        // Validate location data
        validateLocationData(location, currentLocationName);

        const initialDirections = [
          {
            id: 1,
            name: 'Start', 
            location: location,
            locationName: currentLocationName
          },
          {
            id: 2,
            name: 'End',
            location: [],
            locationName: ''
          }
        ];

        // Handle destination if provided
        if (item) {
          if (!item.longitude || !item.latitude || !item.name || !item.address) {
            throw new Error('Invalid destination data');
          }
          
          initialDirections[1].location = [item.longitude, item.latitude];
          initialDirections[1].locationName = `${item.name}, ${item.address}`;
        }

        console.log('Initial directions:', initialDirections);
        setDirections(initialDirections);

        // Create markers
        const markers = [];
        
        // Start marker
        const startMarker = createMarker(
          '1',
          currentLocationName,
          location[0],
          location[1],
          'marker_start',
          36,
          true
        );
        if (startMarker) markers.push(startMarker);

        // End marker if destination provided
        if (item) {
          const endMarker = createMarker(
            '2',
            item.name,
            item.latitude,
            item.longitude, 
            'marker_end',
            36,
            true
          );
          if (endMarker) markers.push(endMarker);

          // Set route data
          const routeData = initialDirections
            .filter(direction => direction.location && direction.location.length === 2)
            .map(direction => ({
              lat: direction.location[1],
              lon: direction.location[0],
            }));

          if (routeData.length >= 2) {
            console.log('Route data:', routeData);
            setDirectionPoints({ locations: routeData, type: 'car' });
          }
        }

        setMapMarkers(markers);
        
        // Handle search box selection
        if (element === 'searchBox') {
          setSelectedInput(initialDirections[1]);
        }
      } else if (element === 'searchBox') {
        // Handle case when location is not available
        if (directions && directions[1]) {
          setSelectedInput(directions[1]);
        } else {
          throw new Error('Location not available');
        }
      }

      // Navigation logic
      if (element === 'rideNow') {
        setStackScreen('SearchLocationScreen');
      } else if (element === 'searchBox') {
        setStackScreen('SearchLocationScreen');
        setStackScreen('SearchScreen');
      }

    } catch (error) {
      handleError(error, 'onSearchPress');
    } finally {
      setIsLoading(false);
    }
  }, [
    location, 
    currentLocationName, 
    directions, 
    setDirections, 
    setMapMarkers, 
    setDirectionPoints, 
    setSelectedInput, 
    setStackScreen, 
    validateLocationData, 
    createMarker, 
    handleError
  ]);

  // Menu handler
  const handleMenu = useCallback(() => {
    try {
      setShowMenu(!showMenu);
    } catch (error) {
      handleError(error, 'handleMenu');
    }
  }, [showMenu, handleError]);

  // History press handler
  const onHistoryPress = useCallback((item) => {
    try {
      if (!item) {
        throw new Error('Invalid history item');
      }
      onSearchPress('rideNow', item);
    } catch (error) {
      handleError(error, 'onHistoryPress');
    }
  }, [onSearchPress, handleError]);

  // Loading component
  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={colors.primary || '#4b48ab'} />
      <Text style={styles.loadingText}>Processing...</Text>
    </View>
  );

  // Error component
  const ErrorMessage = () => (
    error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.errorButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    )
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <LinearGradient 
        colors={['#FFFFFF', '#FFFFFF', 'rgba(255,255,255,0)']} 
        style={styles.gradientOverlay} 
      />
     
      <Animated.View style={styles.headerContainer}>
        <MapScreenHeader toggleMenu={toggleMenu} showMenu={showMenu} />
      </Animated.View>
      
      <BottomSheet minHeight={300}>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => onSearchPress('searchBox')}
          disabled={isLoading}
        >
          <Ionicons name="search" size={22} color="#757575" />
          <Text style={styles.searchContainerText}>
            Where do you want to go?
          </Text>
        </TouchableOpacity>
         
        <TouchableOpacity
          style={[styles.buttonContainer, isLoading && styles.buttonDisabled]}
          onPress={() => onSearchPress()}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="car" size={22} color={colors.white} />
          )}
          <Text style={styles.buttonText}>
            {isLoading ? 'Processing...' : 'Ride Now'}
          </Text>
        </TouchableOpacity>
        
        <HistoryCard selectCallback={onHistoryPress} />
      </BottomSheet>
       
      {showMenu && <SideDrawer handleMenu={handleMenu} />}
      
      {isLoading && <LoadingOverlay />}
      <ErrorMessage />
    </>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 2,
  },
  gradientOverlay: {
    height: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 0.3,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    alignItems: 'center',
    borderColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 0.3,
    paddingVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b48ab',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchContainerText: {
    fontFamily: Fonts.medium,
    color: '#757575',
  },
  buttonText: {
    fontFamily: Fonts.medium,
    color: colors.white,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: colors.white,
    fontFamily: Fonts.medium,
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    zIndex: 1000,
  },
  errorText: {
    color: '#c62828',
    fontFamily: Fonts.medium,
    marginBottom: 10,
  },
  errorButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  errorButtonText: {
    color: colors.white,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
});
