import React, {useEffect} from 'react';
import {useStackScreenStore} from '../store/useStackScreenStore';
import MapContainer from '../components/Map';
import CustomTabBar from '../components/CustomTabBar/CustomTabBar';
import DriveScreen from './TabScreens/DriveScreen';
import ServiceScreen from './TabScreens/ServiceScreen';
import TripsScreen from './TabScreens/TripsScreen';
import EarningsScreen from './TabScreens/EarningsScreen';

import Drive from '../assets/image/tabIcons/drive.svg';
import Service from '../assets/image/tabIcons/service.svg';
import Trips from '../assets/image/tabIcons/trips.svg';
import Earnings from '../assets/image/tabIcons/earnings.svg';

// import { checkFineLocationPermissions, RequestFineLocationPermission } from '../controllers/PermissionHandler';

const HomeScreen = () => {
  const {stackScreen} = useStackScreenStore();

  // const checkLocationPermission = async () => {
  //   const locationPermissionCheck = await checkFineLocationPermissions()
  //   if (locationPermissionCheck) {
  //     await locationTask.getCurrentLocation()
  //   } else {
  //     await RequestFineLocationPermission()
  //   }
  // };

  // useEffect(() => {
  //   checkLocationPermission();
  // }, [])

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
