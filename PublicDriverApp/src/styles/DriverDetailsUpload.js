import { StyleSheet } from "react-native";
import { colors, Fonts } from "../constants/constants";

export const driverDetailStyles = StyleSheet.create({
    tabContainer: {
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20,
      },
      titleText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: colors.grey_dark,
      },
      selectedtitleText: {
        color: colors.yellow,
        fontFamily: Fonts.medium,
        fontSize: 16,
        textDecorationLine: 'underline',
      },
      tabBtns: {
        width: '50%',
        alignItems: 'center',
      },
      subConatiner:{
        width:'90%',
        alignSelf:'center',
        marginTop:10
      },
      GenderContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'center',
      },
      GenderBtn: {
        width: '48%',
        borderWidth: 1,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
      },
      GenderTxt: {
        fontFamily: Fonts.regular,
        color: colors.black,
        fontSize: 16,
      },
      nextBtn: {
        alignSelf: 'flex-end',
        backgroundColor: colors.black,
        paddingVertical: 5,
        paddingHorizontal: 20,
        gap: 8,
        flexDirection: 'row',
      },
      nextTxt: {
        color: colors.white,
        fontFamily: Fonts.regular,
      },
      container: {
        flex: 1,
        backgroundColor: colors.white,
      },
      infoContainer: {
        backgroundColor: colors.yellow_light,
        marginTop: 10,
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 5,
      },
      infoText: {
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: colors.black,
      },
      imageuploadContainer:{
        width:'90%',
        alignSelf:'center',
        alignItems:'center',
        justifyContent:'center',
        borderWidth:0.3,
        backgroundColor:colors.white_dirt,
        marginVertical:10,
        borderRadius:8,
        gap:5,
        paddingVertical:20
      },
      imageContainer:{
        width:'90%',
        alignItems:'center',
        marginVertical:10,
        alignSelf:'center'
      },
      browseBtn:{
        backgroundColor:colors.black,
        paddingVertical:10,
        width:'45%',
        borderRadius:8,
        alignItems:'center',
        marginVertical:10,
      },
      browseBtnTt:{
        fontFamily:Fonts.medium,
        fontSize:16,
        color:colors.white
      },
      uploadText:{
        color:colors.black,
        fontSize:16,
        fontFamily:Fonts.light,
        marginTop:5
      },
      btnContainer:{
        flexDirection:'row',
        width:'90%',
        alignSelf:'center',
        justifyContent:'space-evenly'
      }
  });