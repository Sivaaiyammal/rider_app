import {
  I18nManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { settingsStyles } from "../../Styles/SettingsScreen";
import NavBar from "../../Components/NavBar";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Colors } from "../../Constants/Contants";
import { useTranslation } from "react-i18next";
import RNRestart from "react-native-restart";
import { useStackScreenStore } from "../../Store/useStackScreen";

const LanguageScreen = () => {
  const langugaes = [
    { id: 1, name: "English", code: "en" },
    { id: 1, name: "Arabic", code: "ar" },
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

  return (
    <View style={settingsStyles.screen}>
      <NavBar title={"Choose Language"} onBackPress={() => onBackPress()} />
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
    </View>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({});
