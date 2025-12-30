/* eslint-disable no-console */
import { Platform, useColorScheme } from 'react-native';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getRedirection } from "react-native-translation"
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

import APIRequest from '../Controllers/APIRequest';
import { DataStore } from '../Controllers/DataStore';
import useDeviceAPIStore from '../Store/useDeviceAPIStore';
import wsService from '../Controllers/SocketServices';
import useCurrentScreenStore from '../Store/useCurrentScreenStore';
import { showNotification } from '../Components/Common/NotificationManager';
import { useMapMarkerStore } from '../Store/useMapMarkerStore';
import useSelectedDeviceStore from '../Store/useSelectedDeviceStore';
import { DistanceConfig } from '../Utils/DistanceConfig';
import SubscriptionHandler from '../Components/Subscriptions/SubscriptionHandler';
import TranslationFile from '../locales/TranslationFile';
import { KeyValueStore } from '../Controllers/KeyValueStore';
import { useSubscriptionStore } from '../Store/useSubscriptionStore';
import { useUserStore } from '../Store/useUserStore';
import DriverAnalytics from '../Core/Analytics/DriverAnalytics';
import PassangerAnalytics from '../Core/Analytics/PassangerAnalytics';
import useResetStore from '../hooks/useResetStore';
import useDriverStatusStore from '../Store/useDriverStatusStore';
import driverWSService from '../Controllers/DriverSockerServices';
import publicrideDriverApi from '../PublicrideDriver/Apis/publicrideDriverApi';
import usePublicDriverStore from '../Store/usePublicDriverStore';
import instance from '../Controllers/DriverSockerServices';
import BGLocationTask from '../Controllers/LocationBackgroundTask';

export const GlobalContext = createContext();

const getFcmToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    return fcmToken;
  } catch (error) {
    console.log('Error getting FCM token: ', error);
  }
};

export const ContextProvider = ({ children }) => {
  const t = getRedirection(TranslationFile);

  const navigation = useNavigation();
  const { fetchAllDevices, setDeviceData } = useDeviceAPIStore();
  const { setCurrentScreen } = useCurrentScreenStore();
  const { reset: markerStoreReset, } = useMapMarkerStore();
  const { reset: selectedDeviceStoreReset } = useSelectedDeviceStore();
  const { setUsedFreeTrial } = useSubscriptionStore();
  const resetAllStore = useResetStore();
  const {driverStatus, setDriverStatus} = useDriverStatusStore();
  const {resetPublicDriverState} = usePublicDriverStore();

  const [reFetching, setRefectech] = useState(false)

  const {setMapMarkers} = useMapMarkerStore();
  const {userDeviceId} = useDeviceAPIStore();

  const [distanceConfig, setDistanceConfig] = useState(DistanceConfig.km);

  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const [themeValue, setThemeValue] = useState('');
  const [initialValue, setInitialValue] = useState(0);

  const {setUserRole} = useUserStore();

  const themes = useColorScheme();

  const onBoardActivity = async () => {
    await DataStore.storeData('onBoardDone', 'onBoardDone');
  };

  const setTheme = useCallback(async (theme, isDefault) => {
    DataStore.storeData('Theme', theme);
    DataStore.storeData('IsDefault', isDefault);
    setThemeValue(theme);
  }, []);

  const themeOperations = theme => {
    switch (theme) {
      case 'dark':
        setTheme(theme, false);
        setInitialValue(2);
        return;
      case 'light':
        setTheme(theme, false);
        setInitialValue(1);
        return;
      case 'default':
        setTheme(themes, true);
        setInitialValue(3);
        return;
    }
  };

  const getAppTheme = useCallback(async () => {
    const theme = await DataStore.loadData('Theme');
    const isDefault = await DataStore.loadData('IsDefault');
    isDefault.data ? themeOperations('default') : themeOperations(theme.data);
    setThemeValue(theme.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addListener = useCallback((token,userRole) => {
    wsService.initSocket(token,userRole);
  }, []);

  const addDrvierListener = useCallback(async(user)=> {
    driverWSService.initDriverRoomSocket(user._id).then((res)=>{
      if (res) {
        driverWSService.emit('join_driver_room', { driver_id: user._id })
      }
    })
    await publicrideDriverApi.initToken()
  })

  const getDistanceUnit = async () => {
    setIsLoading(true);
    try {
      const unitType = await DataStore.loadData('unitType');
      setDistanceConfig(DistanceConfig[unitType?.data] || DistanceConfig.km);
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting distance unit:', error);
      setIsLoading(false);
    }
  };

  const updateDistanceUnit = async unitType => {
    setIsLoading(true);
    try {
      await DataStore.storeData('unitType', unitType);
      setDistanceConfig(DistanceConfig[unitType] || DistanceConfig.km);
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting distance unit:', error);
      setIsLoading(false);
    }
  };

  const getUserSubscription = async token => {
    const api = new APIRequest();
    const url = `/user/getUserSubscription`;
    try {
      const subscriptionRes = await api.request(url, 'GET', {}, token);
      
      if (subscriptionRes.success) {
        if (subscriptionRes?.subscription) {
          // console.log(JSON.stringify(subscriptionRes?.subscription),'subscription response check from api')
          let subscriptionData = {};
          setUsedFreeTrial(true);
          if (Platform.OS === 'ios') { 
            const subscription = subscriptionRes?.subscription?.subscription;
           subscriptionData = {
            planName: subscription?.productId,
            expiryDate: subscription?.expiry,
            packageName: subscription?.bundleId,
            token: "",
            orderId: subscriptionRes?.orderId,
            basePlanId: subscription?.productId
            };
          } else {
            const subscription = subscriptionRes?.subscription?.subscription;
            const gRes = subscriptionRes?.subscription?.gRes;
            subscriptionData = {
            planName: gRes?.productId,
            expiryDate: subscription?.expiry,
            packageName: subscription?.packageName,
            token: subscription?.token,
            orderId: subscriptionRes?.orderId,
            basePlanId: gRes?.offerDetails?.basePlanId
          };
           
          }
          await DataStore.storeData('subscriptionData', subscriptionData);
        }else{
          setUsedFreeTrial(false)
        }
        SubscriptionHandler.checkForSubscriptions();
      } else {
        console.log('hari-->>response-->>Sub-->>error', subscriptionRes);
      }
    } catch (e) {
      console.log('hari-->>response-->>Sub-->>error', e);
    }
  };

  const updateDriverStatus = async (userData) => {
    if (userData?.user?.publicRidesDriver) {
      const status = userData?.user?.driverStatus?.status ? userData?.user?.driverStatus?.status : 'offline'
      setDriverStatus(status)
    }
  }

  const isLoggedIn = useCallback(async value => {
    try {
      const userRoles = await DataStore.loadData('role');
      let userData = await DataStore.loadData('userInfo');
      const isSet = await DataStore.loadData('userPreference');
      userData = JSON.parse(userData?.data);
      if (userData && userData?.user?.token) {
        setUserRole(userRoles?.data)
        setUserInfo(userData);
        await getDistanceUnit();
        // await updateDriverStatus(userData)
        if (userRoles?.data !== 'Driver') {
          addListener(userData?.user?.token,userRoles?.data);
        }
        if (userRoles?.data === 'PublicRideDriver') {
          addDrvierListener(userData?.user);
        }
        setRefectech(true)
        if (userRoles?.data === 'StandardUser') {
          getUserSubscription(userData.user.token);
        }
        if (value === 'newLogin') {
          if (isSet?.data === 'userPreference' || userRoles?.data === 'PublicRideDriver') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeTabScreen' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'userPreferenceScreen' }],
            });
          }
        }
      }
    } catch (e) {
      console.log(`is logged in error ${e}`);
      showNotification(
        e?.message ?? t.cant_proceed_now,
        t.pls_try_later,
        'danger',
      );
    }
  }, []);

  const driverlogin = async data => {
    setIsLoading(true);
    try {
      const api = new APIRequest();
      const url = `/user/driver/login?platform=${Platform.OS}`;
      const payload = data;
      const loginData = await api.request(url, 'POST', payload);
      if (loginData.success) {
        const userData = loginData;

        const deviceId = await DeviceInfo.getUniqueId();
        /* For background location */
        await KeyValueStore.storeData("bg_userToken", loginData.user.token)
        await KeyValueStore.storeData("bg_deviceImei", deviceId)
        await DataStore.storeData('userInfo', JSON.stringify(userData));
        await isLoggedIn('newLogin');
        setIsLoading(false);
        await DriverAnalytics.triggerDriverLogin('driver_login','driver_authentication','login_success');
      } else {
        setIsLoading(false);
        await DriverAnalytics.triggerDriverLogin('driver_login','driver_authentication','login_fail');
        throw new Error(loginData.message || "Cannot proceed at the moment")
        
      }
    } catch (err) {
      let info = undefined
      console.log('API==Err==>login==>>Passanger', err.message);
      if (err.message === "Passanger does not exists") info = t.pls_register
      showNotification(
        err.message ?? t.cant_proceed_now,
        info ?? t.pls_try_later,
        'danger',
      );
      setIsLoading(false);
    }
  };

  const passangerlogin = async data => {
    setIsLoading(true);
    try {
      const api = new APIRequest();
      const url = `/user/passanger/login?platform=${Platform.OS}`;
      const payload = data;
      const loginData = await api.request(url, 'POST', payload);
      if (loginData.success) {
        const userData = loginData;

        const deviceId = await DeviceInfo.getUniqueId();
        /* For background location */
        await KeyValueStore.storeData("bg_userToken", loginData.user.token)
        await KeyValueStore.storeData("bg_deviceImei", deviceId)
        await DataStore.storeData('userInfo', JSON.stringify(userData));
        await isLoggedIn('newLogin');
        setIsLoading(false);
        await PassangerAnalytics.triggerPassangerLogin('passenger_login','passenger_authentication','login_success');
      } else {
        setIsLoading(false);
        await PassangerAnalytics.triggerPassangerLogin('passenger_login','passenger_authentication','login_fail');
        throw new Error(loginData.message || "Cannot proceed at the moment")
      }
    } catch (err) {
      let info = undefined
      console.log('API==Err==>login==>>Passenger', err.message);
      if (err.message === "Passanger does not exists") info = t.pls_register
      showNotification(
        err.message ?? t.cant_proceed_now,
        info ?? t.pls_try_later,
        'danger',
      );
      setIsLoading(false);
    }
  };

  const verifyDriverLoginOTP = async data => {
    setIsLoading(true);
    try {
      const api = new APIRequest();
      const url = `/publicrides/driver/verifyOTP?platform=${Platform.OS}`;
      const payload = data;
      const loginData = await api.request(url, 'POST', payload);
      console.log('loginData', loginData)
      if (loginData.success) {
        const userData = loginData;
        const deviceId = await DeviceInfo.getUniqueId();
        /* For background location */
        await KeyValueStore.storeData("bg_userToken", loginData?.user?.token)
        await KeyValueStore.storeData("bg_deviceImei", deviceId)
        await DataStore.storeData('userInfo', JSON.stringify(userData));
        await isLoggedIn('newLogin');
        showNotification(t.otp_verified_successfully,'', 'success');
        setIsLoading(false);
      } else {
        setIsLoading(false);
        showNotification(loginData.message,'', 'danger');
      }
    } catch (err) {
      setIsLoading(false);
      showNotification(
        'Error verifying OTP',
        JSON.stringify(err),
        'danger',
      );
      // console.log('hari-->>err-->>verifyDriverLoginOTP', err)
    }
  }

  const publicrideDriverLogin = async (data, isResend = false) => {
    setIsLoading(true);
    try {
      const api = new APIRequest();
      const url = `/publicrides/driver/sendOTP?platform=${Platform.OS}&isdev=${true}`;
      const payload = data;
      const loginData = await api.request(url, 'POST', payload);
     
      if (loginData.success) {
        if(isResend) {
          showNotification(t.otp_resent_successfully_to_registered_phone_number, '', 'success');
          setIsLoading(false);
          return;
        }
        navigation.navigate('DriverLoginOTPScreen', {phoneNumber: data.phone});
        showNotification(t.otp_sent_successfully,'', 'success');
        setIsLoading(false);
      } else {
        showNotification(loginData?.message, t.pls_try_later, 'danger');
        setIsLoading(false);
      }
    } catch (err) {
      const info = undefined
      console.log('API==Err==>login', err?.message); 
      showNotification(
        err?.message ?? t.cant_proceed_now,
        info ?? t.pls_try_later,
        'danger',
      );
      setIsLoading(false);
    }
  };

  const login = async data => {
    setIsLoading(true);
    try {
      const api = new APIRequest();
      const url = `/user/login?platform=${Platform.OS}`;
      const payload = data;
      const loginData = await api.request(url, 'POST', payload);

      if (loginData.success) {
        const userData = loginData;

        const deviceId = await DeviceInfo.getUniqueId();
        /* For background location */
        await KeyValueStore.storeData("bg_userToken", loginData.user.token)
        await KeyValueStore.storeData("bg_deviceImei", deviceId)

        await DataStore.storeData('userInfo', JSON.stringify(userData));
        // await fetchAllDevices(userData.user.token, navigation);
        await isLoggedIn('newLogin');
        setIsLoading(false);
      } else {
        // showNotification(loginData.message, t.pls_register, 'danger');
        setIsLoading(false);
        throw new Error(loginData.message || "Cannot proceed at the moment")
      }
    } catch (err) {
      let info = undefined
      console.log('API==Err==>login', err?.message);
      if (err?.message === "User does not exists") info = t.pls_register
      showNotification(
        err?.message ?? t.cant_proceed_now,
        info ?? t.pls_try_later,
        'danger',
      );
      setIsLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    GoogleSignin.configure({
      scopes: ['email', 'profile', 'openid'],
      webClientId:
        '1061496527627-4n6c8djg4p849c4sf393l2huepd4a4nk.apps.googleusercontent.com',
      offlineAccess: true,
    });
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo', userInfo)
      if (!userInfo.data)
        return showNotification(
          'Error',
          'Something went wrong',
          'danger',
          3000,
          'toast',
        );
      const { idToken } = userInfo.data;
      const { user } = userInfo.data;
      const { email, name, photo, id } = user;
      const fcm = await getFcmToken();
      const deviceId = await DeviceInfo.getUniqueId();
      const payload = {
        idToken: idToken,
        email: email,
        name: name,
        imageUrl: photo,
        uid: id,
      };

      if (fcm && deviceId) {
        payload.fcmToken = {
          token: fcm,
          deviceImei: deviceId,
        };
      }


      const api = new APIRequest();
      const response = await api.request(`/user/googleSignIn?platform=${Platform.OS}`, 'POST', payload);
      if (response.success) {
        const userData = response;
        userData.user = {
          email: email,
          name: name,
          token: response.token,
          _id: response._id
        };

        const deviceId = await DeviceInfo.getUniqueId();

        /* For background location */
        await KeyValueStore.storeData("bg_userToken", response.token)
        await KeyValueStore.storeData("bg_deviceImei", deviceId)

        await DataStore.storeData('userInfo', JSON.stringify(userData));
        isLoggedIn('newLogin');
        showNotification(t.signin_success, '', 'success');
      } else {
        console.log('googleSignIn', response);
        showNotification(response?.message || t.cant_proceed_now, t.pls_register, 'danger');
        setIsLoading(false);
        GoogleSignin.signOut();
      }
    } catch (error) {
      console.log('googleError', error);
      setIsLoading(false);
    }
  };

  // const handleAppleSignin = async () => {
  //   try {
  //     const appleAuthRequestResponse = await appleAuth.performRequest({
  //       requestedOperation: appleAuth.Operation.LOGIN,
  //       requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  //     });

  //     const { identityToken, user, email, fullName } = appleAuthRequestResponse;

  //     if (identityToken) {
  //       const fcm = await getFcmToken();
  //       const deviceId = await DeviceInfo.getUniqueId();
  //       const payload = {
  //         idToken: identityToken,
  //         userDetails: {
  //           email: email,
  //           name: (fullName?.givenName || '') + ' ' + (fullName?.familyName || ''),
  //         },
  //         uid: user,
  //       };
  
  //       if (fcm && deviceId) {
  //         payload.fcmToken = {
  //           token: fcm,
  //           deviceImei: deviceId,
  //         };
  //       }
  //       const api = new APIRequest();
  //       const response = await api.request(`/user/appleSignIn?platform=${Platform.OS}`, 'POST', payload);

  //       console.log(response)

  //       if (response.success) {
  //         const userData = response;
  //         userData.user = {
  //           email: response.email,
  //           name: response.name,
  //           token: response.token,
  //           _id: response._id
  //         };
  
  //         const deviceId = await DeviceInfo.getUniqueId();
  
  //         /* For background location */
  //         await KeyValueStore.storeData("bg_userToken", response.token)
  //         await KeyValueStore.storeData("bg_deviceImei", deviceId)
  
  //         await DataStore.storeData('userInfo', JSON.stringify(userData));
  //         isLoggedIn('newLogin');
  //         showNotification(t.signin_success, '', 'success');
  //       } else {
  //         console.log('appleSignIn', response);
  //         showNotification(response.message || t.cant_proceed_now, t.pls_register, 'danger');
  //         setIsLoading(false);
  //         appleAuth.onCredentialRevoked();
  //       }
  //     } else {
  //       console.error('Apple Sign-In failed - no identity token');
  //       appleAuth.onCredentialRevoked();
  //     }
  //   } catch (error) {
  //     console.error('Apple Sign-In Error', error);
  //     appleAuth.onCredentialRevoked();
  //   }
  // };
  

  const register = async (data,userRole="StandardUser") => {
    setIsLoading(true);
    try {
      const api = new APIRequest();
      const url = userRole === "StandardUser" ? `/user/register?platform=${Platform.OS}` : `/publicrides/driver/signup?platform=${Platform.OS}`;
      const payload = data;
      const fcm = await getFcmToken();
      const deviceId = await DeviceInfo.getUniqueId();
      if (deviceId && fcm) {
        payload.fcmTokens = [
          {
            token: fcm,
            deviceImei: deviceId
          }
        ]
      }

      const registerData = await api.request(url, 'POST', payload);

      if (!registerData.success) throw new Error(registerData.message || "Cannot proceed at the moment")
      if (registerData.success) {
        //  navigation.goBack();
        const userData = registerData;
        userData.user = {
          email: data.email,
          name: data.name,
          phone: data.phone,
          token: registerData.token,
        };
        /* For background location */
        try {
          await KeyValueStore.storeData("bg_userToken", registerData.token)
          await KeyValueStore.storeData("bg_deviceImei", deviceId)
        } catch (error) {
          console.log('Error storing background location data:', error);
          // Continue with registration process even if background data storage fails
        }

        await DataStore.storeData('userInfo', JSON.stringify(userData));
        isLoggedIn('newLogin');
        showNotification(t.reg_success, t.login_to, 'success');
        setIsLoading(false);
      }
    } catch (err) {
      console.log('API==Err==>register', err);
      showNotification(
        err?.message ?? t.cant_proceed_now,
        t.pls_try_later,
        'danger',
      );
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // setIsLoading(true);
      setUserInfo(null);
      DataStore.clearData('userInfo');
      DataStore.clearData('Theme');
      DataStore.clearData('IsDefault');
      DataStore.clearData('subscriptionData');
      DataStore.clearData('role')
      DataStore.clearData('activeTripId')
      DataStore.clearData('bg_userToken')
      DataStore.clearData('userPreference')
      DataStore.clearData('trackingMode')
      DataStore.clearData('isFamilyTracking')
      setDeviceData([]);
      resetPublicDriverState()
      setCurrentScreen('Map');
      markerStoreReset();
      selectedDeviceStoreReset();
      DataStore.clearSession();
      wsService.close();
      instance.close();
      if (Platform.OS === 'android') {
        GoogleSignin.signOut();
      }
      setRefectech(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserRoleScreen' }],
      });
      showNotification(
        t.logout_success,
        t.login_to,
        'success',
      );
      setIsLoading(false);
    } catch (error) {
      console.log('API==Err==>logout', error);
      showNotification(error?.message ?? t.cant_proceed_now, t.pls_try_later, 'danger');
      setIsLoading(false);
    }
  };


  const handlePassangerLogout = async () => {
      setIsLoading(true)
      const url = `/user/passanger/logout?platform=${Platform.OS}`;
      const api = new APIRequest();
      try {
        const response = await api.request(
          url,
          'POST',
          {fcmToken: {deviceImei: userDeviceId, token: userInfo?.user?.token}},
          userInfo?.user?.token,
        );
  
        // if (!response.success)
        //   throw new Error(response.message || 'Network request failed');
  
        setIsLoading(true);
        setMapMarkers(null);
        wsService.close();
  
        setTimeout(() => {
          resetAllStore();
          logout('Passanger');
          setIsLoading(false);
        }, 1000);
  
        DataStore.clearSession();
      } catch (error) {
        console.log(error, 'Error logging out');
        showNotification(
          error?.message || 'Network request failed',
          t.pls_try_later,
          'danger',
        );
        setIsLoading(false);
      }
    };

  useEffect(() => {
    isLoggedIn();
    console.log('isLoggedIn complete');
    getAppTheme();
    console.log('theme complete');
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        logout,
        publicrideDriverLogin,
        setUserInfo,
        verifyDriverLoginOTP,
        userInfo,
        isLoading,
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;

ContextProvider.propTypes = {
  children: PropTypes.any,
};

ContextProvider.defaultProps = {
  children: [],
};
