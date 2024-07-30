import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import MultiStopStartEndLocation from "./Home/Routes/MultiStopStartEndLocation";
import { setRouteStyles } from "../Styles/setRouteStyles";
import BottomSheet from "../Components/BottomSheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "../Constants/Contants";
import { addLocation } from "../Styles/AnimatedTextinputStyles";
import useMapStore from "../Store/useMapStore";
import Feather from "react-native-vector-icons/Feather";

const SetRouteScreen = () => {
  const { directionReadyCallback } = useMapStore();

  const getDirectionIcon = (text) => {
    if (text.includes("Drive north")) {
      return "arrow-left-top";
    } else if (text.includes("Turn right")) {
      return "arrow-right-top";
    } else if (text.includes("Turn left")) {
      return "arrow-left-top";
    } else if (text.includes("roundabout")) {
      return "progress-upload";
    } else if (text.includes("exit")) {
      return "arrow-left-top";
    } else {
      return "md-pin";
    }
  };

  const renderItem = ({ item }) => (
    <View style={setRouteStyles.item}>
      <MaterialCommunityIcons
        name={getDirectionIcon(item.text)}
        size={24}
        color={Colors.black}
        style={setRouteStyles.icon}
      />
      <Text style={setRouteStyles.text}>{item.text}</Text>
    </View>
  );

  return (
    <View style={setRouteStyles.screen}>
      <BottomSheet minHeight={300} maxHeight={500}>
        <View>
          <Text style={setRouteStyles.title}>Routes</Text>
          <FlatList
            data={directionReadyCallback?.routeInstructions}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={10}
            contentContainerStyle={{paddingBottom:100}}
          />
        </View>
      </BottomSheet>
      <View
        style={[
          addLocation.optionBtnsContainer,
          {
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 80,
            backgroundColor: Colors.grey_light,
            zIndex: 99999,
            borderTopRightRadius:20,
            borderTopLeftRadius:20
          },
        ]}
      >
        <TouchableOpacity
          style={addLocation.optionBtn}
          onPress={() => onRoutesPress()}
        >
          <Feather name="map" color={Colors.black} />
          <Text style={addLocation.optionBtnTxt}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={addLocation.optionBtn}>
          <MaterialCommunityIcons
            name="navigation"
            color={Colors.blue}
            size={16}
          />
          <Text style={addLocation.optionBtnTxt}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SetRouteScreen;

const styles = StyleSheet.create({});
