import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import { useNavigation, CommonActions } from "@react-navigation/native";

import { DataStore } from "../Constants/DataStore";

const LanguageScreen = () => {
  const languages = ["English", "Spanish", "French", "German", "Chinese"];
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const navigation = useNavigation();

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const handleContinue = () => {
    DataStore.storeData("language", selectedLanguage);
    navigation.dispatch(
        CommonActions.navigate("Home")
    )
  };

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