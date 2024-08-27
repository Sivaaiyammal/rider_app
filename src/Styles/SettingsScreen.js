import { StyleSheet } from "react-native";
import { Colors, Fonts } from "../Constants/Contants";

export const settingsStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.white,
    zIndex: 9999,
  },
  settingItemCard: {
    backgroundColor: Colors.white,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  settingItemCardSplit: {
    backgroundColor: Colors.white,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
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
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 5,
    alignItems: "center",
  },
  settingText: {
    fontFamily: Fonts.regular,
    color: Colors.black,
    fontSize: 16,
  },
  container: {
    width: "90%",
    alignSelf: "center",
    paddingBottom: 100,
  },
  pickerContainer: {
    marginTop: 10,
  },
  pickerComp: {
    borderBottomWidth: 0.3,
    height: 40,
  },
  optionCard: {
    width: "100%",
    paddingVertical: 20,
    borderBottomWidth: 0.3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionTxt: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.black,
  },
  routeOptionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    margin: 5,
  },
  routeOptionsBtnTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  routeOptionsBtnTxt: {
    fontFamily: Fonts.medium,
    color: Colors.black,
    fontSize: 14,
  },
  navContainer:{
    height:100,
    width:'100%',
    alignItems:'center',
    justifyContent:'center'
  },
  navContainerTxt:{
    fontFamily:Fonts.medium,
    color:Colors.black,
    fontSize:18
  },
  bottombtn:{
    position:'absolute',
    bottom:20,
    height:40,
    width:'60%',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:Colors.blue,
    alignSelf:'center',
    borderRadius:10,
  },
  bottombtnTxt:{
    fontSize:16,
    fontFamily:Fonts.regular,
    color:Colors.white
  },
  doneBtn:{
    // position:'absolute',
    // bottom:20,
    height:40,
    width:'60%',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:Colors.blue,
    alignSelf:'center',
    borderRadius:10,
    marginTop:40
  },
  navigationTitle:{
    alignItems:'center',
    height:50,
    justifyContent:'center'
  },
  navigationTitleTxt:{
    fontFamily:Fonts.semi_bold,
    color:Colors.black,
    fontSize:18
  }
});
