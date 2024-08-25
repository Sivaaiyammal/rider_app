import React, { useEffect } from "react";
import { View, Image, Text } from "react-native";
import { ProgressBar } from "@react-native-community/progress-bar-android";
import { useNavigation, CommonActions } from "@react-navigation/native";

import SplashScreenIcon from "../Assets/splash/splashScreen.jpg";
import { DataStore } from "../Constants/DataStore";

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(async () => {
      const language = await DataStore.loadData("language");
      const onBoard = await DataStore.loadData("onBoarding");
      const login = await DataStore.loadData("login");

      if (language.data === "languageDone") {
        if (onBoard.data === "onBoardingDone"){
          if (login.data === 'loginDone'){
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: "LoginScreen" }],
            });
          }
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "onBoardingScreen" }],
          });
        }
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "LanguageScreen" }],
        });
      }
    }, 3000);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingBottom: 20,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 100,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#000",
          }}
        >
          ITC
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#666",
            marginTop: 10,
          }}
        >
          Version 1.0.0
        </Text>
      </View>
      {/* <View> */}
      <Image
        source={SplashScreenIcon}
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "contain",
        }}
      />

      {/* </View> */}
      <ProgressBar
        styleAttr="Horizontal"
        indeterminate={true}
        color="blue"
        style={{
          width: "100%",
          height: 10,
        }}
      />
    </View>
  );
};

export default SplashScreen;
