import {StyleSheet} from 'react-native';
import { colors, Fonts } from '../constants/constants';

export const navStyles = StyleSheet.create({
  navContainer: {
    width: '100%',
    zIndex: 3,
    minHeight:50,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  leftIcon: {
    position:'absolute',
    left:0,
    padding: 15,
   
    alignItems: 'center',
  },
  leftBtn: {
   
  },
  rightIcon: {
    width: '20%',
    padding: 13,
  },
  content: {
    flex:1,
    alignItems: 'center',
  },
  leftcontent: {
    alignItems: 'flex-start',
  },
  contentTxt: {
    fontFamily: Fonts.regular,
    color: colors.black,
    fontSize: 17,
    textAlign:'center'
  },
  leftcontentTxt: {
    fontFamily: Fonts.regular,
    color: colors.black,
    fontSize: 16,
    textAlign:'left',
    paddingLeft:0
  },
});
