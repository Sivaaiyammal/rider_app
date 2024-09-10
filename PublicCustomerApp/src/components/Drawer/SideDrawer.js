/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useRef, useCallback, useContext} from 'react';
import {
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import {drawerStyles} from '../../styles/DrawerStyles';

import ProfileImage from '../../assets/image/svgIcons/profileImage.svg';
import MyAccount from '../../assets/image/drawerIcons/myAccount.svg';
import YourRides from '../../assets/image/drawerIcons/yourRides.svg';
import Notification from '../../assets/image/drawerIcons/Notification.svg';
import Language from '../../assets/image/drawerIcons/Language.svg';
import ContactUs from '../../assets/image/drawerIcons/ContactUs.svg';
import About from '../../assets/image/drawerIcons/about.svg';
import Legal from '../../assets/image/drawerIcons/legal.svg';

const SideDrawerV2 = () => {
  const drawerData = [
    {
      id: 1,
      name: 'My Account',
      screen: '',
      icon: <MyAccount />,
    },
    {
      id: 2,
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
  return (
    <View style={drawerStyles.container}>
      <View style={drawerStyles.drawercontainer}>
        <View style={drawerStyles.profileContainer}>
          <ProfileImage width={60} height={60} />
          <Text style={drawerStyles.userName}>Ezio Auditore</Text>
        </View>
        <View style={drawerStyles.contentContainer}>
          <ScrollView>
            {drawerData.map(item => {
              return (
                <TouchableOpacity style={drawerStyles.drawerBtns}>
                  {item.icon}
                  <Text style={drawerStyles.btnText}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
export default SideDrawerV2;
