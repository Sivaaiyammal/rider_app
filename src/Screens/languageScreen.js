import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Image, Button, Alert } from "react-native";
import { FAB } from "react-native-paper";
import { useNavigation, CommonActions } from "@react-navigation/native";

import LocationPermissionImg from "../Assets/Icons/locationPermission.svg";

import { DataStore } from "../Constants/DataStore";

const LanguageScreen = () => {
  const [screen, setScreen] = useState("language");
  const [locationPermission, setLocationPermission] = useState(false);
  const languages = ["English", "Arabic"];
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const navigation = useNavigation();

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const handleContinue = () => {
    DataStore.storeData("language", selectedLanguage);
    setScreen("location");
  };

  const handleLocationPermission = async () => {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      navigation.dispatch(
        CommonActions.navigate("Home")
      )
    } else if (result === PermissionsAndroid.RESULTS.DENIED) {

      Alert.alert("Location Permission", "Location permission denied", [
        { text: "OK", onPress: () => navigation.dispatch(CommonActions.navigate("Home")) }
      ])

    }

  }

  const handleLocationPermissionUI = () => {

    return (
      <View style={{ flex: 1, alignItems: 'center', padding: 10, paddingTop: 100, justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: 'darkblue', width: '80%' }}>We need to access your location</Text>
        {/* <Image 
          source={require("../Assets/images/location.png")} 
          style={{ width: 100, height: 100, marginBottom: 20 }}
        /> */}
        <LocationPermissionImg />
        <Text style={{ margin: 20, fontSize: 16, width: '80%' }}>
          We need your location to provide accurate navigation and location-based services.
          Your privacy is important to us, and we only use your location when you're using the app.
        </Text>
        <View style={{ width: '80%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            title="Allow Location"
            onPress={handleLocationPermission}
            style={{ marginBottom: 10, backgroundColor: '#007AFF', padding: 10, borderRadius: 5 }}
            titleStyle={{ color: '#FFFFFF', fontSize: 16 }}
          />
        </View>
      </View>
    )

  }

  const handleLanguageUI = () => {

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Choose Your Language</Text>
        {languages.map((language, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.languageButton,
              {
                backgroundColor: selectedLanguage === language ? "#007AFF" : "#f0f0f0"
              }
            ]}
            onPress={() => {
              handleLanguageSelect(language);
            }}>
            <Text style={[
              styles.languageText,
              {
                color: selectedLanguage === language ? "#ffffff" : "#212121"
              }
            ]}>{language}</Text>
          </TouchableOpacity>
        ))}

        <FAB
          icon="arrow-right"
          color="#fff"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    );

  }

  return (
    <>
      {screen === "language" ? handleLanguageUI() : handleLocationPermissionUI()}
    </>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#000",
    fontWeight: "bold",
  },
  languageButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  languageText: {
    fontSize: 18,
    color: "#212121",
    fontWeight: "bold",
  },
  continueButtonContainer: {
    // flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  continueButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    borderRadius: 50,
  },
});

export default LanguageScreen;