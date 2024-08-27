import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { settingsStyles } from "../../Styles/SettingsScreen";
import NavBar from "../../Components/NavBar";
import { useStackScreenStore } from "../../Store/useStackScreen";
import { Picker } from "@react-native-picker/picker";
import { Colors, Fonts } from "../../Constants/Contants";
import Switch from "../../Components/Switch";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  distanceFormate,
  pickerRoute,
  routeOptionsData,
} from "../../Constants/JsonData";
import { useSettingsPropsStore } from "../../Store/useSettingsPropsStore";

const RouteSettings = (props) => {
  const { screen, onDonePress } = props;
  const { goBack } = useStackScreenStore();

  const [isEnabledTraffic, setIsEnabledTraffic] = useState(false);
  const [isEnabled3D, setIsEnabled3D] = useState(false);

  const { settings, updateSettings } = useSettingsPropsStore();

  const onBackPress = () => {
    goBack();
  };

  const onPickerChange = (key, value) => {
    updateSettings({ ...settings, [key]: value?.name });
  };

  const renderPicker = (key, pickerData, placeholder, icon, infoIcon) => {
    const selectedValue = pickerData?.filter(
      (item) => item?.name === settings[key]?.name
    );
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
          <TouchableOpacity style={{ position: "absolute", right: 15 }}>
            {infoIcon && infoIcon}
          </TouchableOpacity>
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
              );
            })}
          </Picker>
        </View>
      </View>
    );
  };

  const toggleTraffic = () =>
    setIsEnabledTraffic((previousState) => !previousState);

  const toggle3D = () => setIsEnabled3D((previousState) => !previousState);

  const renderSwitch = (toggleSwitch, isEnabled) => {
    return (
      <Switch
        barHeight={25}
        switchWidth={25}
        switchHeight={15}
        value={isEnabled}
        onValueChange={toggleSwitch}
        disabled={false}
        backgroundActive={"#0095ff"}
        backgroundInactive={"#d1d1d1"}
        circleActiveColor={"white"}
        circleInActiveColor={"white"}
        changeValueImmediately={true}
        innerCircleStyle={{
          borderWidth: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
        renderActiveText={false}
        renderInActiveText={false}
        switchLeftPx={3}
        switchRightPx={3}
        switchWidthMultiplier={2}
        switchBorderRadius={30}
      />
    );
  };

  return (
    <View style={settingsStyles.screen}>
      {screen === "navigation" ? (
        <View style={settingsStyles.navigationTitle}>
            <Text style={settingsStyles.navigationTitleTxt}>Route Settings</Text>
          </View>
      
      ) : (
        <NavBar title={"Route Settings"} onBackPress={() => onBackPress()} />
      )}

      <ScrollView contentContainerStyle={settingsStyles.container}>
        {renderPicker("highways", pickerRoute, "Highways")}
        {renderPicker("tolls", pickerRoute, "Tolls")}
        {renderPicker("ferry", pickerRoute, "Ferry")}
        {renderPicker("livingStreet", pickerRoute, "Living Street")}
        {renderPicker("distanceFormate", distanceFormate, "Distance Formate")}
        <View style={settingsStyles.optionCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <FontAwesome5 name="traffic-light" color={Colors.blue} size={16} />
            <Text style={settingsStyles.optionTxt}>Show Traffic</Text>
          </View>
          {renderSwitch(toggleTraffic, isEnabledTraffic)}
        </View>
        <View style={settingsStyles.optionCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MaterialCommunityIcons
              name="printer-3d"
              color={Colors.blue}
              size={16}
            />
            <Text style={settingsStyles.optionTxt}>3d Map View</Text>
          </View>
          {renderSwitch(toggle3D, isEnabled3D)}
        </View>
        {screen === "navigation" && (
          <TouchableOpacity style={settingsStyles.doneBtn} onPress={()=>onDonePress()}>
            <Text style={settingsStyles.bottombtnTxt}>Done</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default RouteSettings;
