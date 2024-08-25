import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import React, { useCallback, useState } from "react";

import Login from "../../Assets/Icons/login";
import Google from "../../Assets/Icons/google";

import {
  authorize,
  refresh,
  revoke,
  prefetchConfiguration,
} from "react-native-app-auth";
import { UserScreenStyles } from "../../Styles/UserScreenStyles";
import { Colors } from "../../Constants/Contants";
import { DataStore } from "../../Constants/DataStore";
import { useNavigation } from "@react-navigation/native";

const GOOGLE_OAUTH_APP_GUID = "490539589076-ve73f8pke0kkmhee5riud8frkhm2croi";

const config = {
  issuer: "https://accounts.google.com",
  clientId: `${GOOGLE_OAUTH_APP_GUID}.apps.googleusercontent.com`,
  redirectUrl: `com.googleusercontent.apps.${GOOGLE_OAUTH_APP_GUID}:/oauth2redirect/google`,
  scopes: ["openid", "profile", "email"],
};

const LoginScreen = () => {
  const navigation = useNavigation()
  const handleAuthorize = useCallback(async () => {
    try {
      await authorize(config);
    } catch (e) {
      console.log("hari-->>login-->>error-->>", e);
    }
  }, []);

  const guestLogin = () => {
    DataStore.storeData('login', 'loginDone')
    navigation.navigate('Home')
  };

  return (
    <View style={UserScreenStyles.screen}>
      <Text style={UserScreenStyles.loginTxt}>Login</Text>
      <View style={UserScreenStyles.loginBg}>
        <Login />
      </View>
      <View style={UserScreenStyles.inputContainer}>
        <Text style={UserScreenStyles.inputTitle}>Email</Text>
        <TextInput placeholder="abc@gmail.com" style={UserScreenStyles.input} />
      </View>
      <View style={UserScreenStyles.inputContainer}>
        <Text style={UserScreenStyles.inputTitle}>Password</Text>
        <TextInput placeholder="abc@321" style={UserScreenStyles.input} />
      </View>
      <TouchableOpacity
        style={[UserScreenStyles.socialBtns, { backgroundColor: Colors.blue }]}
      >
        <Text style={UserScreenStyles.socialBtnTxt}>Login</Text>
      </TouchableOpacity>
      <View style={UserScreenStyles.orContainer}>
        <View style={UserScreenStyles.lineView} />
        <Text>or</Text>
        <View style={UserScreenStyles.lineView} />
      </View>
      <TouchableOpacity
        style={UserScreenStyles.socialBtns}
        onPress={() => handleAuthorize()}
      >
        <Google />
        <Text style={UserScreenStyles.socialBtnTxt}>Continue With Google</Text>
      </TouchableOpacity>
      <Text style={UserScreenStyles.useOfGmail}>
        Use your email id for sending mails about new features,reports, messages
        and usage tips
      </Text>
      <TouchableOpacity
        style={UserScreenStyles.bottomBtn}
        onPress={() => guestLogin()}
      >
        <Text style={UserScreenStyles.bottomTxt}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
