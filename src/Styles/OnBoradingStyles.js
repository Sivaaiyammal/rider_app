import { StyleSheet } from "react-native";
import { Colors, Fonts } from "../Constants/Contants";
import { HEIGHT, WIDTH } from "../Constants";

export const OnBoradingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  subcontainer: {
    padding: 18,
    marginTop: 30,
  },
  containerDetails: {
    height: HEIGHT * 0.3,
    alignItems: "center",
    justifyContent: "center",
  },
  containerImg: {
    width: WIDTH * 0.99,
    height: HEIGHT * 0.6,
  },

  title: {
    fontSize: 24,
    color: Colors.black,
    fontFamily: Fonts.semi_bold,
  },
  splashTitle: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.regular,
    marginTop: 20,
    textAlign: "center",
  },
  version: {
    color: Colors.black,
    textAlign: "center",
    fontFamily: Fonts.medium,
    top: 10,
    fontSize: 16,
  },

  backgroundImage: {
    bottom: 0,
    position: "absolute",
  },
  ActivityIndicator: {
    marginTop: 10,
    left: 0,
    alignItems: "flex-start",
    zIndex: 2,
  },
  onboardContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  slide: {
    width: WIDTH,
    alignItems: "center",
    top: 50,
  },
  slideImageContainer: {
    width: WIDTH * 0.9,
    height: HEIGHT * 0.5,
    justifyContent: "center",
  },
  slideImage: {
    width: "100%",
    resizeMode: "contain",
    height: "100%",
  },
  slideTitle: {
    fontSize: 24,
    fontFamily: Fonts.semi_bold,
    color: Colors.black,
    width: "90%",
    alignSelf: "center",
  },
  slideSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.black,
    width: "90%",
    textAlign: "center",
    marginTop: 20,
  },
  carousel: { flex: 1, backgroundColor: Colors.white },
  nextText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.white,
    textAlign: "center",
  },
  bottomViewSkipBtn: {
    width: "25%",
    alignItems: "center",
  },
  bottomViewSkip: {
    textAlign: "center",
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  pagination: {
    width: "50%",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: Colors.white,
    alignSelf: "center",
  },
  paginationSliderInactive: {
    width: 25,
    height: 4,
    backgroundColor: Colors.grey_light,
    justifyContent: "center",
    borderRadius: 5,
    marginVertical: 4,
    marginHorizontal: 5,
  },
  paginationSliderActive: {
    height: 5,
    backgroundColor: Colors.bright_orange,
    borderRadius: 10,
  },
  grantedBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.green_light,
    gap: 10,
  },
  grantedTxt: {
    color: Colors.green_dark,
    fontFamily: Fonts.regular,
  },
  loader: {
    position: "absolute",
    alignSelf: "center",
    bottom: 0,
  },
  bottomView: {
    width: "90%",
    bottom: 20,
    position: "absolute",
    alignSelf: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
});

export const userPreferenceStyles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
  },
  headingTxt: {
    fontFamily: Fonts.medium,
    color: Colors.black,
    fontSize: 30,
  },
  locBg: {
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 20,
  },
  locText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.black,
    width: "100%",
    textAlign: "center",
    marginTop: 20,
  },
  allowBtn: {
    width: "75%",
    alignSelf: "center",
    backgroundColor: Colors.blue,
    alignItems: "center",
    marginTop: 25,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
  },
  allowBtnTxt: {
    fontFamily:Fonts.regular,
        color:Colors.white,
  },
});
