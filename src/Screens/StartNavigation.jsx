import {
  View,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  NativeModules,
} from "react-native";
import React, { useEffect, useState } from "react";
import BottomSheet from "../Components/BottomSheet";
import useMapStore from "../Store/useMapStore";
import { Fonts } from "../Constants";
import { Colors } from "../Constants/Contants";
import { useTranslation } from "react-i18next";
import Entypo from "react-native-vector-icons/Entypo";
import { utils } from "../Constants/utils";
import Routes from "../Assets/Icons/routes.svg";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SetRouteScreen from "./SetRouteScreen";
import Switch from "../Components/Switch";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { routeOptionsData } from "../Constants/JsonData";

const { NeNativeModule } = NativeModules;

const StartNavigation = ({ goBack }) => {
  const { setStartNavigation, disduration } = useMapStore();
  const [showRoute, setShowRoute] = useState(false);
  const [selectedRouteOption, setSelectedRouteOption] = useState("");

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


  const updateRouteOptions = (item) => {
    const id = item.id;
    const index = selectedRouteOption.indexOf(id);
    if (index !== -1) {
      const updatedItems = [...selectedRouteOption];
      updatedItems.splice(index, 1);
      setSelectedRouteOption(updatedItems);
    } else {
      setSelectedRouteOption([...selectedRouteOption, id]);
    }
  };

  const renderSwitch = () => {
    return <Switch />;
  };

  const navigationOptions = () => {
    return (
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setShowRoute(true)}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Routes />
            <Text style={styles.optionTxt}>Routes</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.optionCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <FontAwesome5 name="traffic-light" color={Colors.blue} size={16} />
            <Text style={styles.optionTxt}>Show Traffic</Text>
          </View>
          {renderSwitch()}
        </View>
        <View style={styles.optionCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MaterialCommunityIcons
              name="printer-3d"
              color={Colors.blue}
              size={16}
            />
            <Text style={styles.optionTxt}>3d Map View</Text>
          </View>
          {renderSwitch()}
        </View>
        <View style={styles.optionCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MaterialCommunityIcons
              name="theme-light-dark"
              color={Colors.blue}
              size={16}
            />
            <Text style={styles.optionTxt}>Color Theme</Text>
          </View>
          {renderSwitch()}
        </View>
        <View style={[styles.optionCard, { flexDirection: "column" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MaterialCommunityIcons
              name="map-marker-path"
              color={Colors.blue}
              size={16}
            />
            <Text style={styles.optionTxt}>Route Options</Text>
          </View>
          <View style={styles.routeOptions}>
            {routeOptionsData.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.routeOptionsBtn}
                  onPress={() => updateRouteOptions(item)}
                >
                  <MaterialIcons
                    name={
                      selectedRouteOption.includes(item.id)
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={16}
                    color={ selectedRouteOption.includes(item.id) ? Colors.blue : Colors.black}
                  />
                  <Text style={styles.routeOptionsBtnTxt}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <BottomSheet minHeight={150}>
      <View style={styles.navigationContainer}>
        <View>
          <Text style={styles.destinationTxt}>
            Destination Will be Reaced In
          </Text>
          <Text style={styles.destinationTxtTime}>
            {utils.secondsToReadableTime(disduration?.location[3])}
          </Text>
          <Text style={styles.destinationTxtkm}>
            {utils.metersToKilometers(disduration?.location[2]).toFixed(2)} km
            Away
          </Text>
        </View>
        <TouchableOpacity style={styles.stopBtn} onPress={() => onPressEvent()}>
          <Entypo name={"cross"} color={Colors.white} size={20} />
        </TouchableOpacity>
      </View>
      {showRoute ? (
        <SetRouteScreen
          goBack={() => setShowRoute(false)}
          type={"navigation"}
        />
      ) : (
        navigationOptions()
      )}
    </BottomSheet>
  );
};

export default StartNavigation;

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.4,
  },
  stopBtn: {
    alignSelf: "center",
    backgroundColor: Colors.black,
    borderRadius: 50,
    width: "15%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stopBtnTxt: {
    fontFamily: Fonts.semi_bold,
    color: Colors.white,
  },
  destinationTxt: {
    fontFamily: Fonts.regular,
    color: Colors.black,
    fontSize: 16,
  },
  destinationTxtTime: {
    fontFamily: Fonts.medium,
    color: Colors.blue,
    fontSize: 18,
  },
  destinationTxtkm: {
    fontFamily: Fonts.medium,
    color: Colors.blue,
    fontSize: 18,
    marginTop: 5,
  },
  optionContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
  },
  optionCard: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: Colors.grey_xlight,
  },
  optionTxt: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    color: Colors.black,
  },
  routeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 5,
  },
  routeOptionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    margin: 5,
  },
  routeOptionsBtnTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  routeOptionsBtnTxt: {
    fontFamily: Fonts.light,
    color: Colors.black,
    fontSize: 14,
  },
});
