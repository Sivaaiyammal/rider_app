import {StyleSheet} from 'react-native';
import { Colors, Fonts } from '../constants/constants';
import { scale } from '../utils/scalingutils';


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
    borderRadius: 100,
    backgroundColor: Colors.white,
    padding: 10,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
  },
  rightIcon: {
    width: '20%',
    padding: scale(13),
  },
  content: {
    width: '60%',
    padding: 10,
    alignItems: 'center',
  },
  contentTxt: {
    fontFamily: Fonts.regular,
    color: Colors.black,
    fontSize: 14,
    textAlign:'center'
  },
});
