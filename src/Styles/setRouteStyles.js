import { StyleSheet } from "react-native";
import { Colors, Fonts } from "../Constants/Contants";
import { HEIGHT } from "../Constants/Metrics";

export const setRouteStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  directionTypeConatiner: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    alignSelf: "center",
  },
  title: {
    fontFamily: Fonts.semi_bold,
    color: Colors.black,
    fontSize: 16,
    marginLeft: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    width: "90%",
    alignSelf: "center",
  },
  icon: {
    marginRight: 10,
    padding: 10,
    borderRadius: 50,
  },
  text: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.black,
    width: "90%",
  },
});
