import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef, useState, useCallback, useEffect} from 'react';

import CountryPicker, {FlagButton} from 'react-native-country-picker-modal';
import {registerationStyles} from '../../styles/UserStyles';
import BackArrow from '../../assets/image/backArrow.svg';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {showNotification} from '../../components/NotificationManger';
import {DataStore} from '../../controllers/DataStore';
import {useGetQuery} from '../../hooks/useQuery';
import useUserInfoStore from '../../store/useUserInfoStore';
import {utils} from '../../utils/Utils';

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
import {fetchUserDetails} from '../../API/APICalls/UserAPICalls';
import FullScreenLoader from '../../components/Loaders/FullScreenLoader';

const MyAccountScreen = () => {
  const navigation = useNavigation();

  const {userdetails, setUserdetails} = useUserInfoStore();

  const {data: userProfile, isLoading: isProfileLoading} = fetchUserDetails();

  console.log('hari-->>userProfile-->>', userProfile, isProfileLoading);

  const [UserId, setUserId] = useState('');
  const [Name, setName] = useState('');
  const [Gender, setGender] = useState('0');
  const [DOB, setDOB] = useState('');
  const [Phone, setPhone] = useState('');
  const [Email, setEmail] = useState('');
  const [HomeAddress, setHomeAddress] = useState('');
  const [WorkAddress, setWorkAddress] = useState('');

  const [Info_Items, setInfo_Items] = useState([
    {
      key: 'Full Name',
      value: utils.toTitleCase(Name) || '',
      image: <MainProfile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: 'Gender',
      value: Gender >= 0 ? (Gender == 0 ? 'Male' : 'Female') : '',
      image: <Profile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: 'Phone Number',
      value: Phone || '',
      image: <Mobile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: 'Email Address',
      value: Email || '',
      image: <Card width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: 'Home',
      value: HomeAddress || '',
      image: <HomeLocation width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: 'Work',
      value: WorkAddress || '',
      image: <OfficeLocation width={'25'} height={'25'} />,
      imageType: 'svg',
    },
  ]);

  const HandleBackBtn = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
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

  const setProfileDetails = () => {
    if (!userProfile?.data) return []
    const personalDetails = userProfile?.data?.personalDetails;
    let info_Items = [...Info_Items];
    info_Items[0].value = personalDetails.name;
    info_Items[1].value = personalDetails.gender || '';
    info_Items[2].value = personalDetails.phone;
    info_Items[3].value = personalDetails.email;
    info_Items[4].value = personalDetails.homeAddress || '';
    info_Items[5].value = personalDetails.workAddress || '';
    return info_Items;
  };

  return (
    <ScrollView>
      {isProfileLoading && <FullScreenLoader />}
      <MyAccountHeader title="My Account" onBackClick={HandleBackBtn} />
      <MyAccountProfileImage
        name={utils.toTitleCase(Name)}
        id={userProfile?.data?._id}
      />
      <MyAccountInfo infos={setProfileDetails()} />
      <SwipeBtn name="SWIPE TO LOGOUT" onHandleSwipeEnd={Logout} />
    </ScrollView>
  );
};

export default MyAccountScreen;
