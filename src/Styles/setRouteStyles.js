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
  iconsBg:{
    width:'15%',
    backgroundColor:Colors.grey_light,
    aspectRatio:1,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:50,
    marginRight:10
  },
  navCloseBtn:{
    backgroundColor:Colors.black,
    marginTop:10,
    paddingVertical:5,
    paddingHorizontal:15,
    borderRadius:10,
    alignSelf:'flex-end'
  },
  navCloseBtnTxt:{
    fontFamily:Fonts.regular,
    color:Colors.white    
  }
});
