import {StyleSheet} from 'react-native';
import {colors, Fonts} from '../constants/constants';

export const loginStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header:{
    flexDirection:'row',
    width:'90%',
    alignSelf:'center',
    marginTop:20,
    paddingVertical:10,
    alignItems:'center'
  },
  headerTxt:{
    fontFamily:Fonts.bold,
    color:colors.black,
    fontSize:24,
    marginLeft:10
  },
  contectContainer :{
    width:'90%',
    alignSelf:'center',
    paddingVertical:10,
  },
  signInTxt:{
    fontFamily:Fonts.light,
    color:colors.black,
    fontSize:16
  },
  inputConatiner:{
    width:'100%',
    marginTop:10,
    borderRadius:10,
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:colors.white,
    borderWidth:1
  },
  countryPicker:{
    width:'30%',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:colors.white,
    borderRightWidth:0.3,
  },
  input:{ 
    width:'60%',
    paddingLeft:10,
    fontFamily:Fonts.regular,
    color:colors.black,
    fontSize:16
  },
  phoneIcon:{
    width: '10%',
    alignItems:'center'
  },
  callingCode:{
    fontFamily:Fonts.regular,
    color:colors.black,
    fontSize:16
  },
  otpBtn:{
    position: 'absolute',
    bottom: 20,
    backgroundColor: colors.blue_xxdark,
    width: '80%',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf:'center'
  },
  otptxt :{
    fontFamily: Fonts.medium,
    color: colors.white,
    fontSize: 14,
  }
});
