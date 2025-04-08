import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';

import { CommonActions, useNavigation } from '@react-navigation/native';
import { DataStore } from '../../controllers/DataStore';
import useUserInfoStore from '../../store/useUserInfoStore';
import { utils } from '../../utils/Utils';

import Mobile from '../../assets/image/account/mobile.svg';
import Card from '../../assets/image/account/card.svg';
import MainProfile from '../../assets/image/account/MainProfile.svg';
import HomeLocation from '../../assets/image/account/home_location.svg';
import OfficeLocation from '../../assets/image/account/office_location.svg';
import Profile from '../../assets/image/account/profile.svg';

import MyAccountHeader from '../../components/Profile/MyAccountHeader';
import MyAccountProfileImage from '../../components/Profile/MyAccountProfileImage';
import MyAccountInfo from '../../components/Profile/MyAccountInfo';
import SwipeBtn from '../../components/SwipeBtn';

const MyAccountScreen = () => {
  const navigation = useNavigation();
  const { userdetails } = useUserInfoStore();

  const [Info_Items, setInfo_Items] = useState([
    {
      key: 'Full Name',
      value: utils.toTitleCase(userdetails.name) || '',
      image: <MainProfile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: 'Gender',
      value: userdetails.gender ? utils.toTitleCase(userdetails.gender) : '',
      image: <Profile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: 'Phone Number',
      value: userdetails.phone || '',
      image: <Mobile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: 'Email Address',
      value: userdetails.email || '',
      image: <Card width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    // {
    //   key: 'Home',
    //   value: userdetails.homeAddress || '',
    //   image: <HomeLocation width={'25'} height={'25'} />,
    //   imageType: 'svg',
    // },
    // {
    //   key: 'Work',
    //   value: userdetails.workAddress || '',
    //   image: <OfficeLocation width={'25'} height={'25'} />,
    //   imageType: 'svg',
    // },
  ]);

  const HandleBackBtn = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      }),
    );
  };

  const Logout = async () => {
    await DataStore.storeData('access_token', null);
    await DataStore.storeData('refresh_token', null);
    await DataStore.storeData('userdetails', null);

    navigation.dispatch(
      CommonActions.navigate({
        name: 'LoginScreen',
      }),
    );
  };

  return (
    <ScrollView>
      <MyAccountHeader title="My Account" onBackClick={HandleBackBtn} />
      <MyAccountProfileImage
        name={utils.toTitleCase(userdetails.name)}
        id={userdetails._id}
      />
      <MyAccountInfo infos={Info_Items} />
      <SwipeBtn name="SWIPE TO LOGOUT" onHandleSwipeEnd={Logout} />
    </ScrollView>
  );
};

export default MyAccountScreen;
