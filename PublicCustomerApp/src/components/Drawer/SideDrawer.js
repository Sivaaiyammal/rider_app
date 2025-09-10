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
import { useTranslation } from 'react-i18next';
import { drawerStyles } from '../../styles/DrawerStyles';
import { useStackScreenStore } from '../../store/useStackScreenStore';  

import { CommonActions, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

import ProfileImage from '../../assets/image/svgIcons/profileImage.svg';
import useUserInfoStore from '../../store/useUserInfoStore';
import useSupportStore from '../../features/support/store/useSupportStore';
import AdaptiveText from '../Common/AdaptiveText';
import BottomSheetWorkingExample from '../BottomSheetWorkingExample';   
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../../constants/constants';
const SideDrawerV2 = ({ handleMenu }) => {
  const { t } = useTranslation();
  const { userdetails,ratingData } = useUserInfoStore();
  const { setStackScreen } = useStackScreenStore();
  const { unreadCount } = useSupportStore();

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
      name: t('my_account'),
      screen: 'MyAccountScreen',
      icon: <Ionicons name="person" size={20} color="black" />,
    },
    {
      id: 'your-rides',
      name: t('my_rides'),
      screen: 'MyRidesScreen',
      icon: <Ionicons name="car" size={20} color="black" />,
    },
    {
      id: 'saved-places',
      name: t('saved_places'),
      screen: 'SavedPlacesScreen',
      icon: <Ionicons name="star" size={20} color="black" />,
    },
    // {
    //   id: 'preferences',
    //   name: t('preferences'),
    //   screen: 'PreferencesScreen',
    //   icon: <Ionicons name="options" size={20} color="black" />,
    // },
    // {
    //   id: 'receipts',
    //   name: 'Receipts',
    //   screen: 'ReceiptsScreen',
    //   icon: <Ionicons name="receipt" size={24} color="#1e3a8a" />,
    // },
    // {
    //   id: 'notification',
    //   name: t('notification'),
    //   screen: 'NotificationScreen',
    //   icon: <Ionicons name="notifications" size={20} color="black" />,
    // },
    {
      id: 'language',
      name: t('language'),
      screen: 'LanguageScreen',
      icon: <Ionicons name="globe" size={20} color="black" />,
    },
    {
      id: 'support',
      name: t('support'),
      screen: 'SupportScreen',
      icon: <Ionicons name="help-circle" size={20} color="black" />,
    },
    {
      id: 'contact-us',
      name: t('contact_us'),
      screen: 'ContactScreen',
      icon: <Ionicons name="headset" size={20} color="black" />,
    },
    // {
    //   id: 'about',
    //   name: 'About',
    //   screen: 'AboutScreen',
    //   icon: <Ionicons name="information-circle" size={24} color="#1e3a8a" />,
    // },
    {
      id: 'legal',
      name: t('legal'),
      screen: 'LegalScreen',
      icon: <Ionicons name="document-text" size={20} color="black" />,
    },
    // {
    //   id: 'test-screen',
    //   name: t('test_screen'),
    //   screen: 'BottomSheetWorkingExamples',
    //   icon: <Ionicons name="flask" size={20} color="black" />,
    // },
  ];

  const HandleOpenDrawerMenu = (menu) => {
    if (menu.screen) {
      if (menu.screen === 'LanguageScreen'){
        setStackScreen(menu.screen,{fromDrawer:true});
      }
      else{
        
        setStackScreen(menu.screen);
      }
      
    }
    closeDrawer();
  }


  return (
    <Animated.View style={[drawerStyles.container, {opacity: fadeAnim}]}>
      <Animated.View style={[drawerStyles.drawercontainer, {transform: [{translateX: slideAnim}]}]}>
        <LinearGradient colors={[colors.grey_dark,'#303030']}  start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}style={drawerStyles.profileContainer}>
          <ProfileImage width={60} height={60} />
          <View style={{flexDirection:'column',alignItems:'flex-start',gap:0,flex:1}}>
          <Text style={drawerStyles.userName}  numberOfLines={1} >{userdetails?.name}</Text>
        {(ratingData && ratingData.currentrating != null) && (
          <Text style={drawerStyles.ratingText}>
            ★ {ratingData.currentrating != null ? ratingData.currentrating.toFixed(1) : 0} ({ratingData.count != null ? ratingData.count : 0})
          </Text>
        )}
          </View>
        </LinearGradient>
        <View style={drawerStyles.contentContainer}>
          <ScrollView>
            {drawerData.map(item => {
              return (
                <>
                <TouchableOpacity
                  style={drawerStyles.drawerBtns}
                  key={`drawer-${item.id}`}
                  onPress={() => HandleOpenDrawerMenu(item)}
                >
                  <View style={{ position: 'relative',flexDirection:'row',alignItems:'center',gap:15 }}>
                    {item.icon}
                 
                  <Text style={drawerStyles.btnText}>{item.name}</Text>
                  </View>
                  <Ionicons name={'chevron-forward'} size={20} color={'#757575'} />
                </TouchableOpacity>
                {drawerData.indexOf(item) !== drawerData.length - 1 && <View style={drawerStyles.divider} />} 
                </>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>
      <View style={drawerStyles.closeBtnMainContainer} onPress={closeDrawer} >
        <TouchableOpacity onPress={closeDrawer} style={drawerStyles.closeBtnContainer}>
            <Ionicons name={'close'} size={30} color={'black'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

SideDrawerV2.propTypes = {
  handleMenu: PropTypes.func.isRequired,
};

export default SideDrawerV2;
