import {StyleSheet} from 'react-native';
import {colors, Fonts} from '../constants/constants';
import {height, width} from '../utils/Utils';

export const SplashStyles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.35,
  },
  splashTitle: {
    fontFamily: Fonts.bold,
    color: colors.black,
    fontSize: 24,
    marginTop: 15,
    textAlign: 'center',
  },
  versionTxt: {
    fontFamily: Fonts.regular,
    marginTop: 10,
    fontSize: 16,
    color: colors.grey_dark,
  },
  splashBg: {
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
  },
});

export const LanguageStyles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: Fonts.semi_bold,
    fontSize: 32,
    color: colors.black,
    marginTop: 30,
    textAlign: 'center',
  },
  langContainer: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  langBtn: {
    backgroundColor: colors.white,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 30,
    width: '25%',
    alignItems: 'center',
  },
  langTxt: {
    fontFamily: Fonts.semi_bold,
    color: colors.black,
    fontSize: 16,
  },
  nextBtn: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: colors.blue_xxdark,
    width: '80%',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextBtnTxt: {
    fontFamily: Fonts.medium,
    color: colors.white,
    fontSize: 14,
  },
});

export const onBoardingStyles = StyleSheet.create({
  onboardContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  slide: {
    width: width,
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 24,
    fontFamily: Fonts.semi_bold,
    color: colors.black,
    textAlign: 'center',
    width: '80%',
    marginTop:20
  },
  slideSubtitle: {
    fontFamily: Fonts.regular,
    color: colors.black,
    width: '90%',
    textAlign: 'center',
    marginTop:20
  },
  pagination: {
    width: '50%',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.white,
    top: 5,
    alignSelf: 'center',
  },

  carousel: {flex: 1, backgroundColor: colors.white},
  nextBtn: {
    alignSelf: 'center',
    padding: 10,
    width: width * 0.8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: colors.white,
    textAlign: 'center',
    backgroundColor:colors.blue_xxdark,
    width:'100%',
    paddingVertical:10,
    borderRadius:50
  },
  skipBtn: {
    width: width * 0.94,
    alignSelf: 'center',
    padding:15,
    alignItems: 'flex-end',
  },
  skipBtnText: {
    fontFamily: Fonts.regular,
    color: colors.warm_grey,
  },
  paginationSliderInactive: {
    width: '100%',
    height: 5,
    backgroundColor: colors.white_Two,
    justifyContent: 'center',
    borderRadius: 10,
  },
  paginationSliderActive: {
    height: 5,
    backgroundColor: colors.bright_orange,
    borderRadius: 10,
  },
});
