/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useCallback, useContext, useEffect } from 'react';
import {
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  Linking,
  Easing,
} from 'react-native';
import { drawerStyles } from '../../styles/DrawerStyles';

import { CommonActions, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ProfileImage from '../../assets/image/svgIcons/profileImage.svg';
import MyAccount from '../../assets/image/drawerIcons/myAccount.svg';
import YourRides from '../../assets/image/drawerIcons/yourRides.svg';
import Notification from '../../assets/image/drawerIcons/Notification.svg';
import Language from '../../assets/image/drawerIcons/Language.svg';
import ContactUs from '../../assets/image/drawerIcons/ContactUs.svg';
import About from '../../assets/image/drawerIcons/about.svg';
import Legal from '../../assets/image/drawerIcons/legal.svg';

const SideDrawerV2 = ({handleMenu}) => {

  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      screen: '',
      icon: <MyAccount />,
    },
    {
      id: 'your-rides',
      name: 'Your Rides',
      screen: '',
      icon: <YourRides />,
    },
    {
      id: 3,
      name: 'Notification',
      screen: '',
      icon: <Notification />,
    },
    {
      id: 4,
      name: 'Language',
      screen: '',
      icon: <Language />,
    },
    {
      id: 5,
      name: 'Contact Us',
      screen: '',
      icon: <ContactUs />,
    },
    {
      id: 6,
      name: 'About',
      screen: '',
      icon: <About />,
    },
    {
      id: 7,
      name: 'Legal',
      screen: '',
      icon: <Legal />,
    },
  ];

  const HandleOpenDrawerMenu = (menu) => {
    if (menu.id == 'my-account') {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'MyAccountScreen'
        }),
      );
    } else if (menu.id == 'your-rides') {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'YourRidesScreen'
        }),
      );
    }
  }

  return (
    <Animated.View style={[drawerStyles.container, {opacity: fadeAnim}]}>
      <Animated.View style={[drawerStyles.drawercontainer, {transform: [{translateX: slideAnim}]}]}>
        <View style={drawerStyles.profileContainer}>
          <ProfileImage width={60} height={60} />
          <Text style={drawerStyles.userName}>Ezio Auditore</Text>
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
export default SideDrawerV2;
