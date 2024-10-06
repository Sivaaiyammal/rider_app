import {StyleSheet} from 'react-native';
import {colors, Fonts} from '../constants/constants';
import {height, width} from '../utils/Utils';

export const SplashStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  logoContainer: {
    width: '90%',
    justifyContent: 'center',
    flex: 0.35,
    alignSelf: 'center',
  },
  logo: {
    width: '25%',
    height: 80,
  },
  splashTitle: {
    fontFamily: Fonts.bold,
    color: colors.black,
    fontSize: 24,
    marginTop: 15,
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
    width: '100%',
    alignItems: 'center',
  },
});

export const LanguageStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  langContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },
  langBtn: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 0.3,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  langTxt: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: colors.black,
  },
  nextBtn: {
    backgroundColor: colors.black,
    position: 'absolute',
    bottom: height * 0.05,
    right: width * 0.05,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nextBtnTxt: {
    color: colors.white,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  welcomeCards: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.white_dirt,
  },
  welcomeDesc: {
    fontFamily: Fonts.light,
    fontSize: 16,
    width: '80%',
    color: colors.black,
  },
});

export const onBoardingStyles = StyleSheet.create({
  onboardContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backBtn:{
    left:15,
    top:15,
    zIndex:1
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
    marginTop: 20,
  },
  yellowSeperator:{
    width:'30%',
    height:5,
    backgroundColor:colors.yellow,
    top:10
  },
  slideSubtitle: {
    fontFamily: Fonts.regular,
    color: colors.black,
    width: '90%',
    textAlign: 'center',
    marginTop: 20,
  },
  pagination: {
    width: '50%',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.white,
    alignSelf: 'center',
    gap:10
  },
  carousel: {flex: 1, backgroundColor: colors.white},
  bottomBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
  nextBtn: {
    backgroundColor: colors.black,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nextText: {
    color: colors.white,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
});

export const thingstoKnowStyles = StyleSheet.create({
   header :{
      width:'100%',
      alignItems:'center',
      flexDirection:'row',
      justifyContent:'center',
      gap:5,
   },
   headerTxt:{
    fontFamily:Fonts.semi_bold,
    fontSize:24,
    color:colors.black,
    marginTop:10
   },
   termsContainer:{
    width:'90%',
    alignSelf:'center',
    flexDirection:'row',
    alignItems:'center',
    gap:10
   },
   termsText:{
    fontFamily:Fonts.light,
    color:colors.black,
    fontSize:12,
    width:'92%'
   },
   linkText:{
    fontFamily:Fonts.regular,
    color:colors.black,
    fontSize:12,
    textDecorationLine:'underline',
   }
})
