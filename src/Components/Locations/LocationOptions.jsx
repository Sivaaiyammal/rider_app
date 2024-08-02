import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { addLocation } from "../../Styles/AnimatedTextinputStyles";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Routes from "../../Assets/Icons/routes.svg";
import { Colors, Fonts } from "../../Constants/Contants";
import useLocationStore from "../../Store/useLocationStore";
import { useTranslation } from "react-i18next";

const LocationOptions = (props) => {
  const { onRoutesPress, onStartNavigationPress, directions } = props;

  const {savedRoutes,setSavedRoutes} = useLocationStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [routeNameErr, setRouteNameErr] = useState("");

  const {t} = useTranslation()

  const saveLocation = () => {
    if (routeName.length === 0) {
      setRouteNameErr("Please Enter Route Name");
    } else {
      const savedAddress = {
        routeName: routeName,
        locations: directions
      };
      setSavedRoutes(savedAddress)
      setRouteNameErr("");
      setModalVisible(false)
    }
  };

  const saveLocModal = () => {
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
              <Text style={styles.title}>{t('save_loc')}</Text>
              <Text style={styles.inputTitle}>{t('route_name')}</Text>
              <TextInput
                onChangeText={(e) => setRouteName(e)}
                placeholder="Route Name"
                style={styles.input}
              />
              {routeNameErr.length !== 0 ? (
                <Text style={styles.errTxt}>{routeNameErr}</Text>
              ) : (
                <></>
              )}
              <Text style={styles.inputTitle}>{t('your_location')}</Text>
              <TextInput
                editable={false}
                placeholder={directions[0].locationName}
                style={styles.input}
              />
              <Text style={styles.inputTitle}>{t('end_location')}</Text>
              <TextInput
                editable={false}
                placeholder={directions[2].locationName}
                style={styles.input}
              />
              <View style={styles.saveLocationBtns}>
                <Pressable
                  style={[styles.saveLocBtn, { backgroundColor: Colors.white }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.saveLocBtnTxt, { color: Colors.black }]}>
                  {t('cancel')}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.saveLocBtn}
                  onPress={() => saveLocation()}
                >
                  <Text style={styles.saveLocBtnTxt}>{t('save_loc')}</Text>
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
      <View style={addLocation.optionBtnsContainer}>
        {/* <Text style={addLocation.optionBtnTxt}>30min<Text style={{fontSize:10}}>{' '}(3km)</Text></Text> */}
        <TouchableOpacity
          style={addLocation.optionBtn}
          onPress={() => onRoutesPress()}
        >
          <Routes />
          <Text style={addLocation.optionBtnTxt}>{t('routes')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={addLocation.optionBtn}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="content-save-outline"
            color={Colors.blue}
            size={16}
          />
          <Text style={addLocation.optionBtnTxt}>{t('save')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={addLocation.optionBtn}
          onPress={() => onStartNavigationPress()}
        >
          <MaterialCommunityIcons
            name="navigation"
            color={Colors.blue}
            size={16}
          />
          <Text style={addLocation.optionBtnTxt}>{t('start')}</Text>
        </TouchableOpacity>
      </View>
      {saveLocModal()}
    </>
  );
};

export default LocationOptions;

const styles = StyleSheet.create({
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
});
