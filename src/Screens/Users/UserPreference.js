import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Image,
  Button,
  Alert,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { DataStore } from "../../Constants/DataStore";
import {
  RequestFineLocationPermission
} from '../../Controllers/PermissionHandler';

import LocationPermissionImg from "../../Assets/Icons/locationPermission";
import { userPreferenceStyles } from "../../Styles/OnBoradingStyles";
import { Colors } from "../../Constants/Contants";

const UserPreference = () => {
  const navigation = useNavigation();
  
  const handleContinue = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
    DataStore.storeData("userPreference", "userPreferenceDone");
  };

  const handleLocationPermission = async () => {
    RequestFineLocationPermission()
  };

  const handleLocationPermissionUI = () => {
    return (
      <View style={userPreferenceStyles.screen}>
        <Text style={userPreferenceStyles.headingTxt}>
          We need to access your location
        </Text>
        <View style={userPreferenceStyles.locBg}>
          <LocationPermissionImg />
        </View>

        <Text style={userPreferenceStyles.locText}>
          We need your location to provide accurate navigation and
          location-based services. Your privacy is important to us, and we only
          use your location when you're using the app.
        </Text>
        <TouchableOpacity style={userPreferenceStyles.allowBtn}
         onPress={()=> handleLocationPermission()}>
          <Text style={userPreferenceStyles.allowBtnTxt}>
            Allow Location Permission
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[userPreferenceStyles.allowBtn,{backgroundColor:Colors.white}]}
         onPress={()=> handleContinue()}>
          <Text style={[userPreferenceStyles.allowBtnTxt,{color:Colors.black}]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return <>{handleLocationPermissionUI()}</>;
};

export default UserPreference;
