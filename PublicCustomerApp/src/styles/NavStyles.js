import {StyleSheet} from 'react-native';
import { colors, Fonts } from '../constants/constants';

export const navStyles = StyleSheet.create({
  navContainer: {
    width: '100%',
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  leftIcon: {
    width: '20%',
    padding: 10,
    alignItems: 'center',
  },
  leftBtn: {
    borderRadius: 50,
    backgroundColor: colors.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding:8
  },
  rightIcon: {
    width: '20%',
    padding: 13,
  },
  content: {
    width: '60%',
    padding: 10,
    alignItems: 'center',
  },
  contentTxt: {
    fontFamily: Fonts.semi_bold,
    color: colors.black,
    fontSize: 18,
    textAlign:'center'
  },
});
