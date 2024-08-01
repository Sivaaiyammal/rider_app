import {View, BackHandler, StyleSheet, Text, TouchableOpacity, NativeModules } from "react-native";
import React, { useEffect } from "react";
import BottomSheet from "../Components/BottomSheet";
import useMapStore from "../Store/useMapStore";
import { Fonts } from "../Constants";
import { Colors } from "../Constants/Contants";

const { NeNativeModule } = NativeModules;

const StartNavigation = ({ goBack }) => {
const {setStartNavigation} = useMapStore();

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", () => {});
    };
  }, []);

  const onPressEvent = () => {
    setStartNavigation(false);
    NeNativeModule.endNavigation();
    goBack();
  }

  return (
    <TouchableOpacity style={styles.stopBtn} onPress={()=>onPressEvent()}>
      <Text style={styles.stopBtnTxt}>Stop Navigation</Text>
    </TouchableOpacity>
  );
};

export default StartNavigation;

const styles = StyleSheet.create({
  stopBtn:{
    position:'absolute',
    bottom:40,
    alignSelf:'center',
    backgroundColor:Colors.black,
    paddingVertical:10,
    paddingHorizontal:15
  },
  stopBtnTxt:{
    fontFamily:Fonts.semi_bold,
    color:Colors.white
  }
});
