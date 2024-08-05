import { StyleSheet } from "react-native";
import { Colors, Fonts } from "../Constants/Contants";

export const searchTabsStyles = StyleSheet.create({
  contianer: {
    flex: 1,
    // paddingHorizontal: 18,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  tabContianer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tabBtns: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    borderBottomWidth:1
  },
  tabBtnsTxt: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.black,
  },
  components: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  POIcontainer:{
    flex:1,
    // paddingHorizontal:10
  },
  sectionHeader: {
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  sectionHeaderText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.black,
  },
  poibtns: {
    alignItems: 'center',
    borderRadius: 5,
  },
  itemText:{
    borderWidth:0.4,
    borderRadius:10,
    paddingVertical:5,
    paddingHorizontal:10,
    fontFamily:Fonts.light,
    color:Colors.black
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems:'center',
    width:'100%',
    alignSelf:'center',
    padding:5
  },
  poiListCard: {
    marginVertical: 5,
    margin:10,
  },
});
