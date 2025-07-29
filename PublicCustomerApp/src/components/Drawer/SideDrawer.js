/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from 'react';
import {
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  Easing,
} from 'react-native';
import { drawerStyles } from '../../styles/DrawerStyles';
import { useStackScreenStore } from '../../store/useStackScreenStore';  

import { CommonActions, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

import ProfileImage from '../../assets/image/svgIcons/profileImage.svg';
import useUserInfoStore from '../../store/useUserInfoStore';

const SideDrawerV2 = ({ handleMenu }) => {
  const { userdetails } = useUserInfoStore();
  const { setStackScreen } = useStackScreenStore();

  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  console.log('userdetails', userdetails)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      handleMenu();
    });
  }
  
  const drawerData = [
    {
      id: 'my-account',
      name: 'My Account',
      screen: 'MyAccountScreen',
      icon: <Ionicons name="person" size={24} color="#1e3a8a" />,
    },
    {
      id: 'your-rides',
      name: 'My Rides',
      screen: 'MyRidesScreen',
      icon: <Ionicons name="car" size={24} color="#1e3a8a" />,
    },
    {
      id: 'saved-places',
      name: 'Saved Places',
      screen: 'SavedPlacesScreen',
      icon: <Ionicons name="star" size={24} color="#1e3a8a" />,
    },
    {
      id: 'preferences',
      name: 'Preferences',
      screen: 'PreferencesScreen',
      icon: <Ionicons name="options" size={24} color="#1e3a8a" />,
    },
    {
      id: 'receipts',
      name: 'Receipts',
      screen: 'ReceiptsScreen',
      icon: <Ionicons name="receipt" size={24} color="#1e3a8a" />,
    },
    {
      id: 'notification',
      name: 'Notification',
      screen: 'NotificationScreen',
      icon: <Ionicons name="notifications" size={24} color="#1e3a8a" />,
    },
    {
      id: 'language',
      name: 'Language',
      screen: 'LanguageScreen',
      icon: <Ionicons name="globe" size={24} color="#1e3a8a" />,
    },
    {
      id: 'contact-us',
      name: 'Contact Us',
      screen: 'ContactScreen',
      icon: <Ionicons name="headset" size={24} color="#1e3a8a" />,
    },
    {
      id: 'about',
      name: 'About',
      screen: 'AboutScreen',
      icon: <Ionicons name="information-circle" size={24} color="#1e3a8a" />,
    },
    {
      id: 'legal',
      name: 'Legal',
      screen: 'LegalScreen',
      icon: <Ionicons name="document-text" size={24} color="#1e3a8a" />,
    },
  ];

  const HandleOpenDrawerMenu = (menu) => {
    if (menu.screen) {
      if(menu.screen === 'MyRidesScreen'){
        setStackScreen('MyRidesScreen');
      }
        else{
        navigation.dispatch(
          CommonActions.navigate({
            name: menu.screen
          }),
        );
    }
    closeDrawer();
  }
}

  return (
    <Animated.View style={[drawerStyles.container, {opacity: fadeAnim}]}>
      <Animated.View style={[drawerStyles.drawercontainer, {transform: [{translateX: slideAnim}]}]}>
        <View style={drawerStyles.profileContainer}>
          <ProfileImage width={60} height={60} />
          <Text style={drawerStyles.userName}>{userdetails?.name}</Text>
        </View>
        <View style={drawerStyles.contentContainer}>
          <ScrollView>
            {drawerData.map(item => {
              return (
                <TouchableOpacity
                  style={drawerStyles.drawerBtns}
                  key={`drawer-${item.id}`}
                  onPress={() => HandleOpenDrawerMenu(item)}
                >
                  {item.icon}
                  <Text style={drawerStyles.btnText}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>
      <View style={drawerStyles.closeBtnMainContainer} onPress={closeDrawer} >
        <TouchableOpacity onPress={closeDrawer} style={drawerStyles.closeBtnContainer}>
            <Ionicons name={'close'} size={30} color={'#757575'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

SideDrawerV2.propTypes = {
  handleMenu: PropTypes.func.isRequired,
};

export default SideDrawerV2;
