import {
  ScrollView,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNavigation } from '@react-navigation/native';
import { DataStore } from '../../controllers/DataStore';
import useUserInfoStore from '../../store/useUserInfoStore';
import { utils } from '../../utils/Utils';
import { deleteAccountMutation } from '../../API/APICalls/UserAPICalls';
import { showNotification } from '../../components/NotificationManger';
import DeleteAccountModal from '../../components/DeleteAccountModal';

import Mobile from '../../assets/image/account/mobile.svg';
import Card from '../../assets/image/account/card.svg';
import MainProfile from '../../assets/image/account/MainProfile.svg';
import Profile from '../../assets/image/account/profile.svg';

import MyAccountHeader from '../../components/Profile/MyAccountHeader';
import MyAccountProfileImage from '../../components/Profile/MyAccountProfileImage';
import MyAccountInfo from '../../components/Profile/MyAccountInfo';
import SwipeBtn from '../../components/SwipeBtn';
import { useStackScreenStore } from '../../store/useStackScreenStore';  

const MyAccountScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { goBack,reset } = useStackScreenStore();
  const { userdetails ,ratingData   } = useUserInfoStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  
  
  

  const [Info_Items] = useState([
    {
      key: t('full_name'),
      value: utils.toTitleCase(userdetails?.name) || '',
      image: <MainProfile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: t('gender'),
      value: userdetails.gender ? utils.toTitleCase(userdetails?.gender) : '',
      image: <Profile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: t('phone_number'),
      value: userdetails.phone || '',
      image: <Mobile width={'25'} height={'25'} />,
      imageType: 'svg',
    },
    {
      key: t('email_address'),
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
    goBack();
  };

  const Logout = async () => {
    await DataStore.storeData('access_token', null);
    await DataStore.storeData('refresh_token', null);
    await DataStore.storeData('userdetails', null);
    reset()
    navigation.navigate('LoginScreen');
    
  };

  // Delete account mutation
  const deleteAccount = deleteAccountMutation(async () => {
    showNotification(t('account_deletion_requested'), t('account_deletion_message'), 'success');
    await Logout();
  });

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (reason) => {
    try {
      await deleteAccount.mutateAsync({ reason });
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete account error:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      <MyAccountHeader 
        title={t('my_account')} 
        onBackClick={HandleBackBtn} 
        onDeleteAccount={handleDeleteAccount}
      />
      <MyAccountProfileImage
        name={utils.toTitleCase(userdetails?.name || '')}
        id={userdetails?._id || ''}
        ratingData={ratingData}
      />
      <MyAccountInfo infos={Info_Items} />
      
      <View style={{alignContent:'center',justifyContent:'center',marginTop:30}}>
      <SwipeBtn name={t('swipe_to_logout')} onHandleSwipeEnd={Logout} />
      </View>
      
      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteAccount.isLoading}
      />
    </ScrollView>
  );
};

export default MyAccountScreen;
