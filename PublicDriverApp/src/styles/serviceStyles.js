import { StyleSheet } from "react-native";
import { colors, Fonts } from "../constants/constants";
import { commonStyles } from "./commonStyles";

export const serviceStyles = StyleSheet.create({
    screen:{
      flex:1,
      backgroundColor:colors.white
    },
    container:{
      marginTop:80,
      width:'90%',
      alignSelf:'center'
    },
    serviceTypeBtn:{
      backgroundColor:colors.white,
      borderWidth:1,
      borderColor:colors.grey,
      borderRadius:8,
      flexDirection:'row',
      justifyContent:'space-between',
      paddingHorizontal:8,
      paddingVertical:8,
      marginTop:10,
      alignItems:'center'
    },
    serviceTypeBtnTxt:{
      fontFamily:Fonts.light,
      color:colors.black,
      fontSize:16
    },
    areaListcontainer:{
        width:'90%',
        alignSelf:'center'
    },
    bottomBtnContainer:{
        position:'absolute',
        bottom:20,
        zIndex:9999,
        right:20
    },
    plusBtn:{
        backgroundColor:colors.yellow,
        width:40,
        height:40,
        borderRadius:50,
        alignItems:'center',
        justifyContent:'center',
        ...commonStyles.shadow
    },
    dutyPrefernceTxt:{
        fontFamily:Fonts.regular,
        color:colors.black,
        fontSize:16
    }
  })