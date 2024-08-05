import {
  View,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  NativeModules,
} from "react-native";
import React, { useEffect } from "react";
import BottomSheet from "../Components/BottomSheet";
import useMapStore from "../Store/useMapStore";
import { Fonts } from "../Constants";
import { Colors } from "../Constants/Contants";
import { useTranslation } from "react-i18next";
import Entypo from 'react-native-vector-icons/Entypo';

const { NeNativeModule } = NativeModules;

const StartNavigation = ({ goBack }) => {
  const { setStartNavigation, disduration } = useMapStore();

  const { t } = useTranslation();

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
  };

  // console.log("hari-->>disduration-->>", disduration);

  return (
    <BottomSheet minHeight={150}>
      <View style={styles.navigationContainer}>
        <View>
        {/* <Text>{disduration?.location[2]}</Text>
        <Text>{disduration?.location[3]}</Text> */}
        </View>
      <TouchableOpacity style={styles.stopBtn} onPress={() => onPressEvent()}>
        {/* <Text style={styles.stopBtnTxt}>{t("stop_navigation")}</Text> */}
        <Entypo name={"cross"} color={Colors.white} size={20}/>
      </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

export default StartNavigation;

const styles = StyleSheet.create({
  navigationContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    width:'90%',
    alignSelf:'center',
    paddingVertical:10
  },
  stopBtn: {
    alignSelf: "center",
    backgroundColor: Colors.black,
    borderRadius:50,
    width:'15%',
    aspectRatio:1,
    alignItems:'center',
    justifyContent:'center'
  },
  stopBtnTxt: {
    fontFamily: Fonts.semi_bold,
    color: Colors.white,
  },
});
