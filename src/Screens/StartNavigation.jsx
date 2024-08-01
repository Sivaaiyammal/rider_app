import { BackHandler, StyleSheet, Text, TouchableOpacity, NativeModules } from "react-native";
import React, { useEffect } from "react";
import BottomSheet from "../Components/BottomSheet";
import useMapStore from "../Store/useMapStore";

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
  }

  return (
    <BottomSheet minHeight={150}>
        <TouchableOpacity onPress={()=>onPressEvent()}>
        <Text>Stop Navigation</Text>
        </TouchableOpacity>
    </BottomSheet>
  );
};

export default StartNavigation;

const styles = StyleSheet.create({});
