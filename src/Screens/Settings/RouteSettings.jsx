import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useContext, useState } from "react";
import { settingsStyles } from "../../Styles/SettingsScreen";
import NavBar from "../../Components/NavBar";
import { useStackScreenStore } from "../../Store/useStackScreen";
import { Picker } from "@react-native-picker/picker";
import { Colors, Fonts } from "../../Constants/Contants";
import Switch from "../../Components/Switch";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { routeOptionsData } from "../../Constants/JsonData";
import GlobalContext from "../../Context/GlobalContext";

const routOptions = [
  {
    id: 1,
    name: "Efficient",
    type:'route',
  },
  {
    id: 2,
    name: "Efficient",
    type:'route',
  },
  {
    id: 3,
    name: "Efficient",
    type:'route',
  },
];

const navigationOption = [
  {
    id: 1,
    name: "Real",
    type:'navigation',
  }
];

const audioOption = [
  {
    id: 1,
    name: "Text to speech",
    type:'audi',
  }
];

const distanceOption = [
  {
    id: 1,
    name: "Kilometers",
    unit:'km',
    type:'distance',
  },
  {
    id: 2,
    name: "Miles",
    unit:'mi',
    type:'distance',
  }
];

const RouteSettings = () => {
  const { goBack } = useStackScreenStore();

  const {updateDistanceUnit, distanceConfig} = useContext(GlobalContext);

  const [drivingRoute, setDrivingRoute] = useState(routOptions[0]);
  const [cycleRoute, setCycleRoute] = useState(routOptions[0]);
  const [navigationType, setNavigationType] = useState(navigationOption[0]);
  const [audioType, setAudioType] = useState(audioOption[0]);
  const [isEnabledTraffic, setIsEnabledTraffic] = useState(false);
  const [isEnabled3D, setIsEnabled3D] = useState(false);
  const [selectedRouteOption, setSelectedRouteOption] = useState("");

  const onBackPress = () => {
    goBack();
  };

  const updateRouteOptions = useCallback(
    (item) => {
      const id = item.id;
      const index = selectedRouteOption.indexOf(id);
      if (index !== -1) {
        const updatedItems = [...selectedRouteOption];
        updatedItems.splice(index, 1);
        setSelectedRouteOption(updatedItems);
      } else {
        setSelectedRouteOption([...selectedRouteOption, id]);
      }
    },
    [selectedRouteOption]
  );

  const onPickerChange = (updateState, itemValue) => {
    updateState(itemValue);
    console.log("hari-->>picker", itemValue);
    if (itemValue.type === 'distance'){
      updateDistanceUnit(itemValue.unit)
    }
  };

  const _renderPicker = (value, update, pickerData, placeholder) => {
    return (
      <View style={settingsStyles.pickerContainer}>
        <Text
          style={{
            color: Colors.black,
            fontSize: 14,
            fontFamily: Fonts.medium,
          }}
        >
          {placeholder}
        </Text>
        <View style={settingsStyles.pickerComp}>
          <Picker
            dropdownIconColor={Colors.black}
            selectedValue={value}
            mode="dropdown"
            onValueChange={(e)=>onPickerChange(update,e)}
          >
            {pickerData.map((item) => (
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
            ))}
          </Picker>
        </View>
        <Text />
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
      <NavBar title={"Route Settings"} onBackPress={() => onBackPress()} />
      <ScrollView contentContainerStyle={settingsStyles.container}>
        {_renderPicker(drivingRoute, setDrivingRoute, routOptions, "Driving Route")}
        {_renderPicker(cycleRoute, setCycleRoute, routOptions, "Bicycle Route")}
        {_renderPicker(cycleRoute, setCycleRoute, distanceOption, "Distance Formate - (Kilometers/Meters)")}
        {_renderPicker(
          navigationType,
          setNavigationType,
          navigationOption,
          "Navigation Type"
        )}
        {_renderPicker(audioType, setAudioType, audioOption, "Audio Advice Type")}
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
        <View style={{marginTop:15}}>
        {routeOptionsData.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              style={settingsStyles.routeOptionsBtn}
              onPress={() => updateRouteOptions(item)}
            >
              <MaterialIcons
                name={
                  selectedRouteOption.includes(item.id)
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={16}
                color={
                  selectedRouteOption.includes(item.id)
                    ? Colors.blue
                    : Colors.black
                }
              />
              <Text style={settingsStyles.routeOptionsBtnTxt}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
            </View>
      </ScrollView>
    </View>
  );
};

export default RouteSettings;
