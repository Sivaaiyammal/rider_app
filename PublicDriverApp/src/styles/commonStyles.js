import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
    shadow :{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    rowSpaceBetween :{
        flexDirection:'row', 
        justifyContent:'space-between'
    }
})