import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../Constants/Contants';

export const navStyles = StyleSheet.create({
  navContainer: {
    width: '100%',
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignSelf: 'center',
    shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
  },
  leftIcon: {
    width: '20%',
    padding: 10,
    alignItems: 'center',
  },
  leftBtn: {
    borderRadius: 100,
    backgroundColor: Colors.white,
    padding: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    color: Colors.black,
    fontSize: 18,
    textAlign:'center'
  },
});
