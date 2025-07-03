import React, {useEffect, useRef} from 'react';
import {useStackScreenStore} from '../store/useStackScreenStore';
import MapContainer from '../components/Map';
import CustomTabBar from '../components/CustomTabBar/CustomTabBar';
import DriveScreen from './TabScreens/DriveScreen';
import ServiceScreen from './TabScreens/ServiceScreen';
import TripsScreen from './TabScreens/TripsScreen';
import EarningsScreen from './TabScreens/EarningsScreen';
import { RequestAllPermissions } from '../controllers/PermissionHandler';
import locationTask from '../controllers/GetCurrentLocation';

import Drive from '../assets/image/tabIcons/drive.svg';
import Service from '../assets/image/tabIcons/service.svg';
import Trips from '../assets/image/tabIcons/trips.svg';
import Earnings from '../assets/image/tabIcons/earnings.svg';
import AreaPreference from './ServiceScreens/AreaPreference';
import DutyPreference from './ServiceScreens/DutyPreference';
import UpComingTrips from './TripsScreens/UpComingTrips';
import TripHistoryScreen from './TripsScreens/TripHistoryScreen';

const HomeScreen = () => {
  const {stackScreen} = useStackScreenStore();
  const permissionsRequested = useRef(false);

  const checkAllPermissions = async () => {
    if (permissionsRequested.current) return;
    
    permissionsRequested.current = true;
    const permissions = await RequestAllPermissions();
    
    if (permissions.location) {
      await locationTask.getCurrentLocation();
    }
    
    // Log permission status for debugging
    console.log('Location permission:', permissions.location);
    console.log('Notification permission:', permissions.notification);
  };

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const renderContent = () => {
    switch (stackScreen[stackScreen.length - 1]) {
      case 'Home':
        return (
          <CustomTabBar
            menus={[
              {
                id: 1,
                name: 'Drive',
                icon: <Drive />,
                component: <DriveScreen />,
              },
              {
                id: 2,
                name: 'Service',
                icon: <Service />,
                component: <ServiceScreen />,
              },
              {
                id: 5,
                name: 'FloatingBtn',
                icon: <Service />,
                component: <ServiceScreen />,
              },
              {
                id: 3,
                name: 'Trips',
                icon: <Trips />,
                component: <TripsScreen />,
              },
              {
                id: 4,
                name: 'Earnings',
                icon: <Earnings />,
                component: <EarningsScreen />,
              },
            ]}
          />
        );
      case 'AreaPreference':
        return <AreaPreference />;
      case 'DutyPreference':
        return <DutyPreference />;
      case 'UpComingTrips':
        return <UpComingTrips />;
      case 'TripHistoryScreen':
        return <TripHistoryScreen />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
      <MapContainer />
    </>
  );
};

export default HomeScreen;
