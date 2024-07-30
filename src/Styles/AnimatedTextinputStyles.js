import { StyleSheet } from "react-native";
import { Colors, Fonts } from "../Constants/Contants";
import { HEIGHT } from "../Constants/Metrics";

export const addLocation = StyleSheet.create({
  container: {
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    alignSelf: "center",
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
  addLocationContainer: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  draggableCard: {
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    width: "90%",
    alignSelf: "center",
  },
  draggableInput: {
    width: "95%",
    height: HEIGHT * 0.06,
    marginLeft: 5,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  dragIcon: {
    position: "absolute",
    right: 5,
  },
  bottomContainer: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    paddingBottom:40
  },
  directionType:{
    flexDirection:'row',
    marginTop:20,
    justifyContent:'space-around',
    borderBottomWidth:1,
    paddingBottom:12,
    width:'90%',
    alignSelf:'center',
    borderBottomColor:Colors.grey_light
  },
  optionBtnsContainer:{
    flexDirection:'row',
    marginTop:20,
    justifyContent:'space-around',
    alignItems:'center'
  },
  optionBtn:{
    backgroundColor:Colors.grey_xxlight,
    flexDirection:'row',
    gap:10,
    alignItems:'center',
    borderRadius:40,
    paddingVertical:5,
    paddingHorizontal:10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionBtnTxt:{
    fontFamily:Fonts.medium,
    fontSize:16,
    color:Colors.black,

  }
});
