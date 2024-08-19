import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import { Picker } from "@react-native-picker/picker";
import Routes from "../../Assets/Icons/settings/routes.svg";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Language from "../../Assets/Icons/settings/language.svg";

import { Colors, Fonts } from "../../Constants/Contants";
import { useStackScreenStore } from "../../Store/useStackScreen";
import NavBar from "../../Components/NavBar";
import { settingsStyles } from "../../Styles/SettingsScreen";
import useTabScreenStore from "../../Store/useTabScreenStore";
import { useSettingsPropsStore } from "../../Store/useSettingsPropsStore";
import { pickerAccuracy, pickerAppearance } from "../../Constants/JsonData";

const SettingsScreen = ({ navigation }) => {
  const { setStackScreen } = useStackScreenStore();
  const { setCurrentScreen } = useTabScreenStore();

  const { settings, updateSettings } = useSettingsPropsStore();

  const onBackPress = () => {
    setCurrentScreen("Home");
  };

  const onPickerChange = (key, value) => {
    updateSettings({ ...settings, [key]: value });
  };

  const renderPicker = (key, pickerData, placeholder, icon, infoIcon) => {
    const selectedValue = pickerData?.filter((item) => item?.name === settings[key]?.name)
    return (
      <View style={settingsStyles.pickerContainer}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          width: "100%",
        }}
      >
        {icon && icon}
        <Text
          style={{
            color: Colors.black,
            fontSize: 16,
            fontFamily: Fonts.regular,
          }}
        >
          {placeholder}
        </Text>
        {/* <TouchableOpacity style={{ position: "absolute", right: 15 }}>
          {infoIcon && infoIcon}
        </TouchableOpacity> */}
      </View>
      <View style={settingsStyles.pickerComp}>
        <Picker
          dropdownIconColor={Colors.black}
          selectedValue={selectedValue[0]}
          mode="dropdown"
          onValueChange={(value) => onPickerChange(key, value)}
        >
          {pickerData.map((item) => {
            return (
              <Picker.Item
              style={{
                fontFamily: Fonts.light,
                borderRadius: 10,
                color: Colors.black,
                backgroundColor: Colors.white_Two,
              }}
              key={item.id}
              label={item.name}
              value={item}
            />
            )
          })}
        </Picker>
      </View>
    </View>
    )
  } 

  return (
    <View style={settingsStyles.screen}>
      <NavBar title={"Settings"} onBackPress={() => onBackPress()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity
          style={[settingsStyles.settingItemCardSplit]}
          onPress={() => setStackScreen("RouteSettings")}
        >
          <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
            <Routes />
            <Text style={settingsStyles.settingText}>Route Settings</Text>
          </View>
          <View>
            <Entypo name="chevron-small-right" color={Colors.black} size={20} />
          </View>
        </TouchableOpacity>

        <View style={[settingsStyles.settingItemCardSplit]}>
          <View style={{ width: "100%" }}>
            {renderPicker(
              "gpsReliability",
              pickerAccuracy,
              "GPS Reliability",
              <FontAwesome5 name="satellite" color={Colors.black} size={16} />,
              <Entypo name="info-with-circle" color={Colors.blue} size={16} />
            )}
          </View>
        </View>

        <View style={[settingsStyles.settingItemCardSplit]}>
          <View style={{ width: "100%" }}>
            {renderPicker(
              "navAccuracy",
              pickerAccuracy,
              "Navigation Accuracy",
              <FontAwesome5
                name="location-arrow"
                color={Colors.black}
                size={14}
              />,
              <Entypo name="info-with-circle" color={Colors.blue} size={16} />
            )}
          </View>
        </View>

        <View style={[settingsStyles.settingItemCardSplit]}>
          <View style={{ width: "100%" }}>
            {renderPicker(
              "mapAppearance",
              pickerAppearance,
              "Map Appearance",
              <FontAwesome5 name="map-marked" color={Colors.black} size={14} />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[settingsStyles.settingItemCardSplit]}
          onPress={() => setStackScreen("Languages")}
        >
          <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
            <Language />
            <Text style={settingsStyles.settingText}>Language</Text>
          </View>
          <View>
            <Entypo name="chevron-small-right" color={Colors.black} size={20} />
          </View>
        </TouchableOpacity>
{/* 
        <TouchableOpacity
          style={[settingsStyles.settingItemCardSplit]}
          onPress={() => setStackScreen("Languages")}
        >
          <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
            <Language />
            <Text style={settingsStyles.settingText}>Choose Map Style</Text>
          </View>
          <View>
            <Entypo name="chevron-small-right" color={Colors.black} size={20} />
          </View>
        </TouchableOpacity> */}

      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
