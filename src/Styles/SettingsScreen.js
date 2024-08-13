import { StyleSheet } from "react-native";
import { Colors, Fonts } from "../Constants/Contants";


export const settingsStyles = StyleSheet.create({
    container: {
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
        shadowColor: '#000',
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
        alignItems:'center',
        shadowColor: '#000',
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
        alignItems:'center'
      },
      settingText: {
        fontFamily: Fonts.regular,
        color: Colors.black,
        fontSize: 16,
      },
})