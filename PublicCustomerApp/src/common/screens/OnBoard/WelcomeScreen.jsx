import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import AdaptiveText from '../../../notCustomer/components/Common/AdaptiveText';
import { colors, Fonts } from '../../../notCustomer/constants/constants';
import { useTranslation } from 'react-i18next';
import useUserStore from '../../store/useUserStore';
import { DataStore } from '../../../notCustomer/controllers/DataStore';
import { firebaselog_userRole } from '../../utils/FirebaseAnalytics';

const passengerImage = require('../../../notCustomer/assets/image/ContinueAsPassenger.webp');
const driverImage = require('../../../notCustomer/assets/image/ContinueAsDriver.webp');

const WelcomeScreen = ({ navigation }) => {
  const { width: screenWidth } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const contentWidth = Math.max(screenWidth - 96, 0);
  const mediaWidth = contentWidth > 0 ? contentWidth * 0.5 : screenWidth * 0.5;
  const {setUserRole} = useUserStore();
  // Keep illustration offset proportional while splitting space evenly with copy.
  const cardImageMarginTop = -mediaWidth * 0.45;





  const handleCustomerContinue = () => {
    setUserRole('customer');
    DataStore.storeData('userRole', 'customer');
    firebaselog_userRole('UR_Selected(UR_S)', 'UR_S:customer');
    navigation.navigate('LoginScreen', {navRole: 'customer'});
  };

  const handleDriverContinue = () => {
    setUserRole('driver');
    DataStore.storeData('userRole', 'driver');
    firebaselog_userRole('UR_Selected(UR_S)', 'UR_S:driver');
    navigation.navigate('LoginScreen', {navRole: 'driver'});
  };

  return (
    <View style={styles.container}>
      <AdaptiveText style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
        {t('title')}
      </AdaptiveText>
      <AdaptiveText style={styles.subtitleText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
        {t('subtitle')}
      </AdaptiveText>
      <View style={styles.actions}>

        <TouchableOpacity
          style={[styles.card, styles.passengerCard]}
          activeOpacity={0.85}
          onPress={handleCustomerContinue}
        >
          <View style={[styles.cardContent, styles.cardContentPassenger]}>
            <View
              style={[
                styles.cardMedia,
                styles.cardMediaPassenger,
                { width: mediaWidth },
              ]}
            >
              <Image
                source={passengerImage}
                style={[
                  styles.cardImage,
                  { marginTop: cardImageMarginTop },
                ]}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                styles.cardBody,
                styles.cardBodyPassenger,
                { width: mediaWidth },
              ]}
            >
              {i18n.language?.startsWith('ta') ? (
                // Tamil-specific sentence formation: "Customer continue as"
                <AdaptiveText
                   style={[styles.cardTitlePassenger,{fontSize:20,lineHeight:30,textAlign:'center'}]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {`${t('customer')} ${t('continue_as')}`}
                </AdaptiveText>
              ) : (
                <>
                  <AdaptiveText style={[styles.cardLabel, styles.cardLabelPassenger]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                    {t('continue_as')}
                  </AdaptiveText>
                  <AdaptiveText style={[styles.cardTitle, styles.cardTitlePassenger]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                    {t('customer')}
                  </AdaptiveText>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.separator}>

        </View>
        <TouchableOpacity
          style={[styles.card, styles.driverCard]}
          activeOpacity={0.85}
          onPress={handleDriverContinue}
        >
          <View style={[styles.cardContent, styles.cardContentDriver]}>
            <View
              style={[
                styles.cardMedia,
                styles.cardMediaDriver,
                { width: mediaWidth },
              ]}
            >
              <Image
                source={driverImage}
                style={[
                  styles.cardImage,
                  { marginTop: cardImageMarginTop },
                ]}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                styles.cardBody,
                styles.cardBodyDriver,
                {paddingBottom:15},
                { width: mediaWidth },
              ]}
            >
              {i18n.language?.startsWith('ta') ? (
                <AdaptiveText
                  style={[styles.cardTitleDriver,{fontSize:20,lineHeight:30,textAlign:'center'}]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  color={'white'}
                  fontSize={18}
                >
                  {t('welcome_driver_ta_full')}
                </AdaptiveText>
              ) : (
                <>
                  <AdaptiveText style={[styles.cardLabel, styles.cardLabelDriver]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                    {t('become_a')}
                  </AdaptiveText>
                  <AdaptiveText style={[styles.cardTitle, styles.cardTitleDriver]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} color={'white'}>
                    {t('driver')}
                  </AdaptiveText>
                  <AdaptiveText style={[styles.cardLabel, styles.cardLabelDriver]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                    {t('and_earn_money')}
                  </AdaptiveText>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: Fonts.semi_bold,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
    color: colors.black,
  },
  subtitleText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 36,
    color: colors.black,
  },
  actions: {
    paddingVertical: 30,
    width: '100%',
    gap: 10,
  },
  separator: {
    marginBottom: 30,
    width: '90%',
    height:1,
    backgroundColor: colors.grey_light,
    marginHorizontal: 12,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    paddingTop:30,
    paddingBottom: 0,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    minHeight: 50,
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.grey_light,
    position: 'relative',
    overflow: 'visible',
  },
  passengerCard: {
    backgroundColor: '#FFD100',
    borderColor: '#FFE266',
    marginBottom: 18,
  },
  driverCard: {
    backgroundColor: '#0F223C',
    borderColor: '#1C3154',
  },
  cardContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContentPassenger: {
    justifyContent: 'flex-start',
  },
  cardContentDriver: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  cardMedia: {
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    height: undefined,
  },
  cardMediaPassenger: {
    alignItems: 'flex-start',
  },
  cardMediaDriver: {
    alignItems: 'flex-end',
  },
  cardBody: {
    justifyContent: 'center',
  },
  cardBodyDriver: {
    alignItems: 'flex-start',
  },
  cardBodyPassenger: {
    alignItems: 'flex-end',
  },
  cardEyebrow: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: colors.blue_xxdark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardEyebrowDriver: {
    color: colors.white,
    opacity: 0.7,
  },
  cardTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 25,
  },
  cardTitleDriver: {
    color: colors.white,
  },
  cardLabel: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  cardLabelPassenger: {
    textAlign: 'right',
    color: colors.black,
  },
  cardLabelDriver: {
    color: '#ffffffff',
    textAlign: 'left',
    fontFamily: Fonts.regular,
  },
  cardSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
    lineHeight: 20,
    marginTop: 8,
  },
  cardSubtitleDriver: {
    color: '#EAF2FF',
  },
  cardTitlePassenger: {
    textAlign: 'right',
  },
});
