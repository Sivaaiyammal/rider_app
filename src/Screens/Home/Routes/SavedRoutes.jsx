import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Colors } from "../../../Constants/Contants";
import NavBar from "../../../Components/NavBar";
import { useStackScreenStore } from "../../../Store/useStackScreen";

const SavedRoutes = () => {
    const {goBack} = useStackScreenStore();

  const onBackPress = () => {
     goBack()
  };  
  return (
    <View style={styles.screenContainer}>
      <NavBar onBackPress={() => onBackPress()} title={"saved_routes"} withBg />
      <Text>SavedRoutes</Text>
    </View>
  );
};

export default SavedRoutes;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
