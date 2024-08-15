import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";

import { Colors } from "../../Constants/Contants";
import { useStackScreenStore } from "../../Store/useStackScreen";
import NavBar from "../../Components/NavBar";
import {
  settingsDataA,
  settingsDataB,
  settingsDataC,
  settingsDataD,
  settingsDataE,
} from "../../Constants/JsonData";
import { settingsStyles } from "../../Styles/SettingsScreen";

const SettingsScreen = ({ navigation }) => {
  const { setStackScreen } = useStackScreenStore();

  const onSettingsPress = (item) => {
    setStackScreen(item.screenName);
  };

  return (
    <View style={settingsStyles.screen}>
      <NavBar title={"Settings"} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={settingsStyles.settingItemCard}>
          {settingsDataA.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={settingsStyles.settingItem}
              onPress={() => onSettingsPress(option)}
            >
              <View
                style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
              >
                {option.icon}
                <Text style={settingsStyles.settingText}>{option.name}</Text>
              </View>
              <View>
                <Entypo
                  name="chevron-small-right"
                  color={Colors.black}
                  size={20}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {settingsDataB.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[settingsStyles.settingItemCardSplit]}
            onPress={() => onSettingsPress(option)}
          >
            <View
              style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
            >
              {option.icon}
              <Text style={settingsStyles.settingText}>{option.name}</Text>
            </View>
            <View>
              <Entypo
                name="chevron-small-right"
                color={Colors.black}
                size={20}
              />
            </View>
          </TouchableOpacity>
        ))}
        <View style={settingsStyles.settingItemCard}>
          {settingsDataC.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={settingsStyles.settingItem}
              onPress={() => onSettingsPress(option)}
            >
              <View
                style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
              >
                {option.icon}
                <Text style={settingsStyles.settingText}>{option.name}</Text>
              </View>
              <View>
                <Entypo
                  name="chevron-small-right"
                  color={Colors.black}
                  size={20}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={settingsStyles.settingItemCard}>
          {settingsDataD.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={settingsStyles.settingItem}
              onPress={() => onSettingsPress(option)}
            >
              <View
                style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
              >
                {option.icon}
                <Text style={settingsStyles.settingText}>{option.name}</Text>
              </View>
              <View>
                <Entypo
                  name="chevron-small-right"
                  color={Colors.black}
                  size={20}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {settingsDataE.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[settingsStyles.settingItemCardSplit]}
            onPress={() => onSettingsPress(option)}
          >
            <View
              style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
            >
              {option.icon}
              <Text style={settingsStyles.settingText}>{option.name}</Text>
            </View>
            <View>
              <Entypo
                name="chevron-small-right"
                color={Colors.black}
                size={20}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
