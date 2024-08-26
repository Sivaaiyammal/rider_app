import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import RNRestart from "react-native-restart";
import { settingsStyles } from "../Styles/SettingsScreen";
import { Colors } from "../Constants/Contants";
import { useStackScreenStore } from "../Store/useStackScreen";
import NavBar from "../Components/NavBar";
import { DataStore } from "../Constants/DataStore";
import { CommonActions, useNavigation } from "@react-navigation/native";

const LanguageScreen = () => {
  const navigation = useNavigation()

  const langugaes = [
    { id: 1, name: "English", code: "en" },
    { id: 2, name: "Arabic", code: "ar" },
  ];

  const { goBack } = useStackScreenStore();

  const onBackPress = () => {
    goBack();
  };

  const { i18n } = useTranslation();

  const changeLanguage = () => {
    i18n
      .changeLanguage(i18n.language === "ar" ? "en" : "ar")
      .then(() => {
        I18nManager.forceRTL(i18n.language === "ar");
        RNRestart.Restart();
      })
      .catch((err) => {
        console.log("something went wrong while applying RTL", err);
      });
  };

  const onNextPress = () => {
     DataStore.storeData('language', 'languageDone')
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "onBoardingScreen" }],
      })
    );
  }

  return (
    <View style={settingsStyles.screen}>
      <View style={settingsStyles.navContainer}> 
      <Text style={settingsStyles.navContainerTxt}>Choose Language</Text>
      </View>
      <View style={[settingsStyles.container, { width: "100%" }]}>
        {langugaes.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              style={[settingsStyles.settingItemCardSplit]}
              onPress={() => changeLanguage()}
            >
              <View
                style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
              >
                <Text style={settingsStyles.settingText}>{item.name}</Text>
              </View>
              <View>
                <FontAwesome
                  name={
                    i18n.language === item.code ? "dot-circle-o" : "circle-o"
                  }
                  color={Colors.black}
                  size={20}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={settingsStyles.bottombtn} onPress={()=>onNextPress()}>
        <Text style={settingsStyles.bottombtnTxt}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({});
