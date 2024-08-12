import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

import InputContainer from "../../Components/InputContainer";

import EnergyIcon from "../../Assets/Icons/EnergyIcon.svg";
import { IconButton } from "react-native-paper";
import { useStackScreenStore } from "../../Store/useStackScreen";
import useMapStore from "../../Store/useMapStore";
import useLocationStore from "../../Store/useLocationStore";
import AlertModal from "../../Components/AlertModal";
import { Fonts } from "../../Constants";
import { Colors } from "../../Constants/Contants";
import { useTranslation } from "react-i18next";

const POIScreen = ({ setDragHeight, currentScreen }) => {
  const { setStackScreen } = useStackScreenStore();
  const { setSearchPOI } = useMapStore();
  const { location } = useLocationStore();

  const { t } = useTranslation();

  const [alertModal, setAlertModal] = useState(false);

  const [communityBy, setCommunityBy] = useState([
    {
      name: "Bus",
      icon: "bus",
      color: "#00b0ff",
    },
    {
      name: "Car",
      icon: "car",
      color: "#31bc92",
    },
    {
      name: "Walk",
      icon: "running",
      color: "#ed8a19",
    },
    {
      name: "Bike",
      icon: "bicycle",
      color: "#00b0ff",
    },
  ]);

  const clearText = () => {
    setSearchText("");
  };

  const onIconPress = (item) => {
    if (location === null) {
      setAlertModal(true);
    } else {
      if (item.poiID) {
        console.log(item.poiID);
        setSearchPOI({
          poiID: item.poiID,
          latitude: location[1],
          longitude: location[0],
        });
        setStackScreen("POIresult");
      } else {
        setStackScreen("Search", "poi");
      }
    }
  };

  const renderAlertModal = () => (
    <AlertModal
      isVisible={alertModal}
      onClose={() => {
        setAlertModal(false);
      }}
      leftBtnTxt={"Cancel"}
      successMessage={"Current Location Not Available"}
      SubText={"Please enable location permission"}
      onRightPress={() => Linking.openSettings()}
      rightBtnText={"Go To Settings"}
      animationType={"slide"}
    />
  );

  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setStackScreen("Search", "saved")}
          style={[styles.header, { backgroundColor: "#00b0ff" }]}
        >
          <Icon name="home" size={18} color="#fff" />
          <Text style={styles.title}>{t("home")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setStackScreen("Search", "saved")}
          style={[styles.header, { backgroundColor: "#31bc92" }]}
        >
          <Icon name="briefcase" size={18} color="#fff" />
          <Text style={styles.title}>{t("work")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setStackScreen("Search", "saved")}
          style={[styles.header, { backgroundColor: "#ed8a19" }]}
        >
          <Icon name="star-half-alt" size={18} color="#fff" />
          <Text style={styles.title}>{t("saved")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.poiContainer}>
        {[
          { name: t("food"), icon: "food", color: "#FF6B6B", poiID: 2 },
          {
            name: t("health"),
            icon: "hospital-box",
            color: "#4ECDC4",
            poiID: 40,
          },
          {
            name: t("shopping"),
            icon: "shopping",
            color: "#45B7D1",
            poiID: 309,
          },
          { name: t("leisure"), icon: "bed", color: "#FFA07A", poiID: 183 },
          { name: t("cash"), icon: "cash-marker", color: "#98D8C8", poiID: 32 },
          { name: t("public"), icon: "bank", color: "#F7B731", poiID: 14 },
          {
            name: t("airport"),
            icon: "airplane-marker",
            color: "#6A89CC",
            poiID: 71,
          },
          { name: t("more"), icon: "dots-horizontal", color: "#A3CB38" },
        ].map((item, index) => (
          <View key={index}>
            <IconButton
              key={index}
              icon={item.icon}
              size={20}
              color="#fff"
              iconColor="#fff"
              onPress={() => onIconPress(item)}
              style={[
                styles.poiItem,
                {
                  backgroundColor: item.color,
                  borderColor: item.color,
                },
              ]}
            />
            <Text style={styles.iconTxt}>{item.name}</Text>
          </View>
        ))}
      </View>
      {alertModal && renderAlertModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    color: "white",
    fontFamily: Fonts.semi_bold,
  },
  communityByContainer: {
    flexDirection: "column",
    padding: 10,
    gap: 10,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  communityByItems: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 10,
  },
  communityByItem: {
    padding: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  communityByContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  poiContainer: {
    flexDirection: "row",
    // justifyContent: "",
    alignItems: "center",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "#eeeeee",
    width: "90%",
    alignSelf: "center",
    justifyContent: "space-evenly",
  },
  poiItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconTxt: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
});

export default POIScreen;
