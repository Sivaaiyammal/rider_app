import {
  BackHandler,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import MultiStopStartEndLocation from "./Home/Routes/MultiStopStartEndLocation";
import { setRouteStyles } from "../Styles/setRouteStyles";
import BottomSheet from "../Components/BottomSheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "../Constants/Contants";
import { addLocation } from "../Styles/AnimatedTextinputStyles";
import useMapStore from "../Store/useMapStore";
import Feather from "react-native-vector-icons/Feather";
import { useStackScreenStore } from "../Store/useStackScreen";
import { useTranslation } from "react-i18next";

const SetRouteScreen = ({goBack, onStartPress}) => {
  const { directionReadyCallback } = useMapStore();
  // const {goBack} = useStackScreenStore()

  const {t} = useTranslation()

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", () => {});
    };
  }, []);

  const onRoutesPress = () => {
    goBack();
  }

  const _onStartPress = () => {
    onStartPress()
  }

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
      <View style={setRouteStyles.iconsBg}>
      <MaterialCommunityIcons
        name={getDirectionIcon(item.text)}
        size={24}
        color={Colors.black}
      />
      </View>
      <Text style={setRouteStyles.text}>{item.text}</Text>
    </View>
  );

  return (
    <View style={setRouteStyles.screen}>
      <BottomSheet minHeight={300} maxHeight={500}>
        <View style={{width:'90%', alignSelf:'center'}}>
          <Text style={setRouteStyles.title}>{t('routes')}</Text>
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
          <Text style={addLocation.optionBtnTxt}>{t('map')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={addLocation.optionBtn}
         onPress={()=>_onStartPress()}>
          <MaterialCommunityIcons
            name="navigation"
            color={Colors.blue}
            size={16}
          />
          <Text style={addLocation.optionBtnTxt}>{t('start')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SetRouteScreen;

const styles = StyleSheet.create({});
