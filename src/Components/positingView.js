import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { FloatingAction } from "react-native-floating-action";
import Icon from "react-native-vector-icons/FontAwesome";
import useMapStore from "../Store/useMapStore";
import { useTranslation } from "react-i18next";
import { Colors, Fonts } from "../Constants/Contants";
import Entypo from "react-native-vector-icons/Entypo";
import { radioBtns } from "../Constants/JsonData";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SearchAPI } from "../Constants/NEMap/Search";
import GlobalContext from "../Context/GlobalContext";

// Define the geographical bounds of your static view
const GEO_BOUNDS = {
  latTop: 85, // Top latitude of your area
  latBottom: -85, // Bottom latitude of your area
  lngLeft: -180, // Left longitude of your area
  lngRight: 180, // Right longitude of your area
};

// Convert latitude and longitude to x and y coordinates
const latLngToXY = (lat, lng, width, height) => {
  const x =
    ((lng - GEO_BOUNDS.lngLeft) / (GEO_BOUNDS.lngRight - GEO_BOUNDS.lngLeft)) *
    width;
  const y =
    ((GEO_BOUNDS.latTop - lat) / (GEO_BOUNDS.latTop - GEO_BOUNDS.latBottom)) *
    height;
  return { x, y };
};

const PositionBasedView = ({ latLng, setPositioningView }) => {
  const [coords, setCoords] = useState(latLng); // Example coordinates
  const { width, height } = Dimensions.get("window"); // Dimensions of the view
  const [floatingView, setFloatingView] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationNameErr, setLocationNameErr] = useState("");
  const [selectedOption, setSelectedOption] = useState(radioBtns[0]);
  const [addressName, setAddressName] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  const {saveAddress} = useContext(GlobalContext)

  const search = new SearchAPI();

  const { t } = useTranslation();

  const { mapMoving } = useMapStore();
 

  // Calculate position based on latitude and longitude
  const position = latLngToXY(
    coords.lat,
    coords.lng,
    width - 130,
    height + 130
  );

  console.log(position, width, height, "lknclkdns", latLng);

  const iconConfigs = [
    { name: "save", delay: 0 },
    { name: "map-marker", delay: 400 },
    { name: "direction", delay: 600 },
    { name: "3d", delay: 800 },
    { name: "close", delay: 1000 },
  ];

  const animatedValues = useRef(
    iconConfigs.map(() => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    animatedValues.forEach((value, index) => {
      Animated.parallel([
        Animated.timing(value.opacity, {
          toValue: 1,
          duration: 1000,
          delay: iconConfigs[index].delay,
          useNativeDriver: true,
        }),
        Animated.spring(value.scale, {
          toValue: 1,
          friction: 4,
          delay: iconConfigs[index].delay,
          useNativeDriver: true,
        }),
      ]).start();
    });

    setTimeout(() => {
      setFloatingView(true);
    }, 1000);
  }, []);

  console.log(mapMoving, "mapMoving");

  const fetchAddressName = async () => {
    const coordinates = [latLng.lat, latLng.lng];
    setAddressLoading(true);
    try {
      const response = await search.reverseGeocode(coordinates);
      if (response) {
        setAddressName(response.properties.street);
        setAddressLoading(false);
      }
    } catch (e) {
      setAddressLoading(false);
    }
  };

  const onMarkerIconsPress = (icon) => {
    if (icon.name === "close") {
      setFloatingView(false);
      setPositioningView(false);
    }
    if (icon.name === "save") {
      setModalVisible(true);
      fetchAddressName();
    }
  };

  const saveLocation = () => {
    if (locationName.length === 0) {
      setLocationNameErr("please_enter_location_name");
    } else {
      const savedAddress = {
        name: locationName,
        latitude: latLng.lat,
        longitude: latLng.lng,
        type: "TYPE_" + selectedOption.name,
        address:addressName?  addressName : "",
      };
      setLocationNameErr("");
      setLocationName("");
      setModalVisible(false);
      saveAddress(savedAddress)
    }
  };

  const saveModalView = () => {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.title}>{t("save_loc")}</Text>
              <Text style={styles.inputTitle}>{t("loc_name")}</Text>
              <TextInput
                onChangeText={(e) => setLocationName(e)}
                placeholder={t("enter_location_name")}
                style={styles.input}
              />
              {locationNameErr.length !== 0 ? (
                <Text style={styles.errTxt}>{t(locationNameErr)}</Text>
              ) : (
                <></>
              )}
              {addressName && 
                  <View style={styles.loctionDetails}>
                  <Entypo
                    name="location-pin"
                    size={14}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={styles.subName}>
                    {addressLoading ? <ActivityIndicator /> : addressName}
                  </Text>
                </View>
              }
          
              <View style={styles.radionBtnContainer}>
                {radioBtns.map((item) => {
                  return (
                    <TouchableOpacity
                      style={styles.radionBtns}
                      onPress={() => setSelectedOption(item)}
                    >
                      <FontAwesome
                        name={
                          selectedOption.value === item.value
                            ? "dot-circle-o"
                            : "circle-o"
                        }
                        size={16}
                      />
                      <Text style={styles.radionBtnsTxt}>{t(item.name)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.saveLocationBtns}>
                <Pressable
                  style={[styles.saveLocBtn, { backgroundColor: Colors.white }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.saveLocBtnTxt, { color: Colors.black }]}>
                    {t("cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.saveLocBtn}
                  onPress={() => saveLocation()}
                >
                  <Text style={styles.saveLocBtnTxt}>{t("save_loc")}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <>
      {floatingView && (
        <View
          style={{
            position: "absolute",
            left: position.x - 10,
            top: position.y - 210,
            zIndex: 1000,
          }}
        >
          {iconConfigs.map((icon, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: animatedValues[index].opacity,
                transform: [{ scale: animatedValues[index].scale }],
              }}
            >
              <TouchableOpacity
                style={styles.iconView}
                onPress={() => onMarkerIconsPress(icon)}
              >
                <Icon
                  name={icon.name}
                  style={styles.icon}
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={[
          {
            position: "absolute",
            left: position.x - 10,
            top: position.y - 10,
          },
        ]}
        onPress={() => alert("Marker Pressed!")}
      >
        <Text style={styles.markerText}>📍</Text>
      </TouchableOpacity>
      {modalVisible && saveModalView()}
    </>
  );
};

const styles = StyleSheet.create({
  markerText: {
    color: "white",
    fontSize: 32,
  },
  iconView: {
    margin: 5,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00b0ff",
    borderRadius: 50,
  },
  icon: {},
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontFamily: Fonts.medium,
    color: Colors.black,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.white,
    width: "100%",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.grey_light,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontFamily: Fonts.regular,
    marginBottom: 10,
  },
  inputTitle: {
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  saveLocBtn: {
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  saveLocBtnTxt: {
    fontFamily: Fonts.semi_bold,
    color: Colors.white,
  },
  saveLocationBtns: {
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    justifyContent: "space-around",
  },
  errTxt: {
    fontSize: 12,
    fontFamily: Fonts.light,
    bottom: 5,
    color: "red",
  },
  radionBtnContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    marginVertical: 10,
  },
  radionBtns: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 5,
    paddingVertical: 5,
  },
  radionBtnsTxt: {
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  loctionDetails: {
    flexDirection: "row",
    alignItems: "center",
    color: Colors.grey,
    gap: 5,
  },
  subName: {
    fontSize: 12,
    fontFamily: Fonts.light,
    marginTop: 2,
    width: "90%",
  },
});

export default PositionBasedView;
