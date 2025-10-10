import React, { useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import LocationPermissionOverlay from '../components/LocationPermissionOverlay';
import { RequestFineLocationPermission } from '../controllers/PermissionHandler';
import { useNavigation } from '@react-navigation/native';

const LocationPermissionScreen = () => {
  const navigation = useNavigation();

  const handleEnable = useCallback(async () => {
    const granted = await RequestFineLocationPermission();
    if (granted) {
      navigation.goBack();
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={"white"} />
      <LocationPermissionOverlay onEnable={handleEnable} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default LocationPermissionScreen;


