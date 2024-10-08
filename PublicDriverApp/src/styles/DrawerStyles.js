import {StyleSheet} from 'react-native';
import {colors, Fonts} from '../constants/constants';
import {height, width} from '../utils/Utils';

export const drawerStyles = StyleSheet.create({
  container: {backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1, flex: 1},
  drawercontainer: {
    width: width * 0.75,
    backgroundColor: colors.white,
    height:'100%'
  },
  profileContainer:{
    width:'90%',
    marginTop:20,
    flexDirection:'row',
    alignItems:'center',
    paddingVertical:10,
    alignSelf:'center',
    gap:10,
    borderBottomWidth:0.3,
  },
  userName:{
    fontFamily:Fonts.semi_bold,
    fontSize:24,
    color:colors.black
  },
  contentContainer:{
    marginTop:10,
    width:'90%',
    alignSelf:'center'
  },
  drawerBtns:{
    flexDirection:'row',
    alignItems:'center',
    gap:10,
    paddingVertical:15,
    paddingHorizontal:5
  },
  btnText:{
    fontFamily:Fonts.regular,
    fontSize:18,
    color:colors.black
  }
});
