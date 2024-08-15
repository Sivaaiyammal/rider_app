import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import useMapStore from "../../Store/useMapStore";
import Marker from "../../Constants/NEMap/Marker";

import DirectionIcon from "../../Assets/Icons/directionIcon.svg";
import { useStackScreenStore } from "../../Store/useStackScreen";
import BottomSheet from "../../Components/BottomSheet";
import { Colors, Fonts } from "../../Constants/Contants";
import NavBar from "../../Components/NavBar";
import { useTranslation } from "react-i18next";

const TargetLocation = ({ data }) => {
  const [locationDetails, setLocationDetails] = useState([]);
  const { setMapMarkers, setMapLocation } = useMapStore();
  const { setStackScreen, goBack } = useStackScreenStore();
  const { address, name, coordinates, distance } = data;

  const {t} = useTranslation()

  const closeBottomSheet = () => {
    setMapMarkers([]);
    // setStackScreen("Home");
    goBack()
  };

  useEffect(() => {
    let locationDetails = [
      {
        name: "Open Now",
        icon: "clock-o",
        value: "12:00",
      },
      {
        name: "Star Rating",
        icon: "star",
        value: "4.5",
      },
      {
        name: "Distance",
        icon: "map-marker",
        value: "1234",
      },
    ];

    if (coordinates) {
      const marker = new Marker(
        String(new Date().getTime() + Math.random()),
        "Location",
        coordinates[0],
        coordinates[1],
        "marker_start",
        36
      );

      setMapMarkers([marker]);
      setMapLocation({
        lat: coordinates[1],
        lng: coordinates[0],
        zoom: 15,
      });
    }

    setLocationDetails(locationDetails);
  }, [data]);

  const shareLocation = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
    );
  };

  const saveLocation = () => {};

  return (
    <>
    <NavBar onBackPress={closeBottomSheet} />
    <BottomSheet minHeight={200}>
      <View style={styles.container}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationName}>{name}</Text>
          <Icon
            name="close"
            size={20}
            color="#212121"
            onPress={closeBottomSheet}
          />
        </View>
        <View style={styles.loctionDetails}>
          <Entypo name="location-pin" size={14} style={{ marginTop: 2 }} />
          <Text style={styles.subName}>{address}</Text>
        </View>
        <View style={styles.loctionDetails}>
          <MaterialIcons name="alt-route" size={14} style={{ marginTop: 2 }} />
          <Text style={styles.subName}>{distance} km</Text>
        </View>
        <View style={styles.locationActions}>
          <TouchableOpacity
            style={[styles.locationAction, { backgroundColor: "#3087eb" }]}
            onPress={() => setStackScreen("Directions", data)}
          >
            <DirectionIcon />
            <Text style={styles.locationActionTxt}>{t('direction')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.locationAction, { borderColor: "#3087eb" }]}
          >
            <Icon name="bookmark-o" size={20} color="#3087eb" />
            <Text style={[styles.locationActionTxt, { color: "#3087eb" }]}>
              {t('saved')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.locationAction, { borderColor: "#3087eb" }]}
            onPress={shareLocation}
          >
            <Icon name="share" size={20} color="#3087eb" />
            <Text style={[styles.locationActionTxt, { color: "#3087eb" }]}>
            {t('share')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
  },
  selectLocationContainer: {
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  locationName: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  subName: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 5,
  },
  locationDetailsContainer: {
    flexDirection: "row",
    marginVertical: 5,
  },
  locationActionTxt: {
    fontFamily: Fonts.regular,
    color: Colors.white,
  },
  locationDetailsName: {
    // marginLeft: 10,
    fontSize: 12,
    color: "#212121",
  },
  locationActions: {
    flexDirection: "row",
    margin: 5,
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
  },
  locationAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 25,
  },
  loctionDetails: {
    flexDirection: "row",
    alignItems: "center",
    color: Colors.grey,
    gap: 5,
  },
});

export default TargetLocation;
