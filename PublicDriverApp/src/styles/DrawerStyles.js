import {StyleSheet} from 'react-native';
import {colors, Fonts} from '../constants/constants';
import {height, width} from '../utils/Utils';
import {commonStyles} from './commonStyles';
import {Colors} from 'react-native/Libraries/NewAppScreen';

export const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  drawercontainer: {
    width: width * 0.75,
    backgroundColor: colors.white,
    height: '100%',
  },
  drawerOpenBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 50,
    top: 10,
    left: 10,
    ...commonStyles.shadow,
  },
  subView: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: height,
    width: width,
    zIndex: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconClose: {
    backgroundColor: Colors.white,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.white,
    ...commonStyles.shadow,
  },
  subContainer: {
    height: height,
    width: width * 0.8,
    backgroundColor: Colors.white,
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: '25%',
    aspectRatio: 1,
    backgroundColor: colors.yellow,
    borderRadius: 50,
  },
  profileNameContainer: {
    marginLeft: 10,
  },
  nameText: {
    fontFamily: Fonts.medium,
    fontSize: 20,
    color: colors.black,
  },
  numberText: {
    fontFamily: Fonts.light,
    fontSize: 16,
    color: colors.black,
  },
  contentConatiner: {
    backgroundColor: colors.white_light,
    padding: 8,
    borderRadius: 8,
    borderWidth: 0.3,
    marginBottom:15
  },
  drawerTitle: {
    fontFamily: Fonts.light,
    fontSize: 16,
    color: colors.grey_xxdark,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  titleTxt: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
});
