import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import MultiStopStartEndLocation from "./Home/Routes/MultiStopStartEndLocation";
import { setRouteStyles } from "../Styles/setRouteStyles";
import BottomSheet from "../Components/BottomSheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "../Constants/Contants";
import { addLocation } from "../Styles/AnimatedTextinputStyles";

const SetRouteScreen = () => {
  const dummyData = [
    {
      text: "Drive north.",
    },
    {
      text: "Turn right.",
    },
    {
      text: "Turn left.",
    },
    {
      text: "Turn left.",
    },
    {
      text: "Turn left onto Yellandu Road.",
    },
    {
      text: "Enter the roundabout and take the 3rd exit onto NH365BB/Khammam Bypass.",
    },
    {
      text: "Exit the roundabout onto NH365BB/Khammam Bypass. Continue on NH365BB.",
    },
    {
      text: "Enter the roundabout and take the 2nd exit onto NH365A/365BB.",
    },
    {
      text: "Exit the roundabout onto NH365A/365BB.",
    },
    {
      text: "Turn left to stay on NH365A/365BB.",
    },
    {
      text: "Enter the roundabout and take the 2nd exit onto NH365A/365BB.",
    },
    {
      text: "Exit the roundabout onto NH365A/365BB.",
    },
    {
      text: "Enter the roundabout and take the 1st exit onto NH365A/Kodad-Khammam.",
    },
    {
      text: "Exit the roundabout onto NH365A/Kodad-Khammam.",
    },
    {
      text: "Turn left to stay on NH365A.",
    },
  ];

  const getDirectionIcon = (text) => {
    if (text.includes("Drive north")) {
      return "arrow-left-top"; // Example icon for north direction
    } else if (text.includes("Turn right")) {
      return "arrow-right-top";
    } else if (text.includes("Turn left")) {
      return "arrow-left-top";
    } else if (text.includes("roundabout")) {
      return "progress-upload";
    } else if (text.includes("exit")) {
      return "arrow-left-top";
    } else {
      return "md-pin"; // Default icon
    }
  };

  const renderItem = ({ item }) => (
    <View style={setRouteStyles.item}>
      <MaterialCommunityIcons name={getDirectionIcon(item.text)} size={24} color={Colors.black} style={setRouteStyles.icon} />
      <Text style={setRouteStyles.text}>{item.text}</Text>
    </View>
  );

  return (
    <View style={setRouteStyles.screen}>
      <BottomSheet minHeight={150} maxHeight={300}>
        <View>
          <Text style={setRouteStyles.title}>Routes</Text>
          <FlatList
            data={dummyData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            initialNumToRender={10}
          />
        </View>
        {/* <View style={[addLocation.optionBtnsContainer,{position:'absolute', bottom:0, width:'100%', height:100, backgroundColor:Colors.green, }]}>
         <Text style={addLocation.optionBtnTxt}>30min<Text style={{fontSize:10}}>{' '}(3km)</Text></Text>
         <TouchableOpacity style={addLocation.optionBtn} onPress={()=>onRoutesPress()}>
          <Routes />
         <Text style={addLocation.optionBtnTxt}>Map</Text>
         </TouchableOpacity>
         <TouchableOpacity style={addLocation.optionBtn}>
          <MaterialCommunityIcons name="navigation" color={Colors.blue} size={16}/>
         <Text style={addLocation.optionBtnTxt}>Start</Text>
         </TouchableOpacity>
        </View> */}
      </BottomSheet>
    </View>
  );
};

export default SetRouteScreen;

const styles = StyleSheet.create({

});
