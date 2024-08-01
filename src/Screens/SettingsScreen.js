import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";

import { Colors } from "../Constants/Contants";
import { useStackScreenStore } from '../Store/useStackScreen';

const SettingsScreen = ({ navigation }) => {
  const { setStackScreen } = useStackScreenStore();

  const settingsOptions = [
    {
      title: "Dark Mode",
      enabled: true,
      onPress: () => {},
    },
    {
      title: "Notifications",
      enabled: false,
      onPress: () => {},
    },
    {
      title: "Auto-update",
      enabled: true,
      onPress: () => {},
    },
    {
      title: "Location Services",
      enabled: true,
      onPress: () => {},
    },
  ]

  const Header = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setStackScreen("Home")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        {settingsOptions.map((option, index) => (
          <View key={index} style={styles.settingItem}>
            <Text style={styles.settingText}>{option.title}</Text>
            <TouchableOpacity
              style={[
                styles.checkbox,
                option.enabled && { backgroundColor: Colors.black }
              ]}
              onPress={option.onPress}
            >
              {option.enabled && (
                <Ionicons name="checkmark" size={18} style={styles.checkboxIcon} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    // marginBottom: 20,
    color: Colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: "12%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    aspectRatio: 1,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 5,
  },
  checkboxIcon: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});

export default SettingsScreen;
