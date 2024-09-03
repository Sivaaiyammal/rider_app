import { useEffect, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { AppState } from 'react-native';

const useLocationServiceChecker = (checkInterval = 10000) => {
  const [isLocationEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkLocationServices = () => {
      Geolocation.getCurrentPosition(
        () => {
          setIsEnabled(true); // Successfully got a position, so enabled
        },
        (error) => {
          // Failed to get position, which may indicate that services are disabled
          console.log(error.code, error.message);
          if (error.code === 2) { // Error code 2 usually means location services are disabled
            setIsEnabled(false);
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    checkLocationServices(); // Check immediately on mount

    // Optionally, check again whenever the app state changes (foreground/background)
    const subscription = AppState.addEventListener('change', checkLocationServices);

    // Cleanup
    return () => subscription.remove();
  }, []);

  return {isLocationEnabled};
};

export default useLocationServiceChecker;


