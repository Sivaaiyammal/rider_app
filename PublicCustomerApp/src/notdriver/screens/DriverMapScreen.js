import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, NativeModules } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import { useMapMarkerStore } from '../../common/store/useMapMarkerStore';
import SideDrawerPublicRides from '../components/SideDrawerPublicRides';
import HotSpotRegions from '../components/HotSpotRegions';
import HomeHeader from '../components/HomeHeader';
import TrackingMapIcons from '../../common/components/Alerts/TrackingMapIcons';
import { Fonts } from '../../common/constants/constants';
import { Colors } from '../../common/constants/constants';
import { RouteScreenStyles } from '../styles/RouteScreenStyles';
import { height } from '../../common/utils/scalingutils';
import FloatingButton from '../components/FloatingButton';
import { useTranslation } from 'react-i18next';

const {NeNativeModule} = NativeModules;

const DriverMapScreen = (props) => {
  const {setStackScreen} = useStackScreenStore();
  const {approved, blocked, isBankVerified, refreshStatus, isLoading} = props;
  const {directionPoints, setDirectionPoints} = useMapMarkerStore();
  const [layOutHeight, setLayoutHeight] = useState(null);
  const { t } = useTranslation();

  useEffect(()=>{
    NeNativeModule.clearDirectionPoints()
  },[])

  // Refresh state & spinner animation
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefreshPress = useCallback(() => {
    if (isRefreshing) return; // guard
    setIsRefreshing(true);
    try { refreshStatus && refreshStatus(); } catch (e) { console.log('[refreshStatus error]', e); }
    // Disable for 10 seconds then stop animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 10000);
  }, [isRefreshing, refreshStatus]);

  const refreshBtn = () => {
    return (
      <TouchableOpacity
        style={[styles.refreshBtn, isRefreshing && styles.refreshBtnDisabled]}
        onPress={onRefreshPress}
        disabled={isRefreshing}
      >
        <View style={styles.refreshContentRow}>
          <Text style={[styles.contactText, {bottom:5}]}>
            {isRefreshing ? t('refreshing') || 'Refreshing...' : t('check_status')}
          </Text>
          {isRefreshing && <ActivityIndicator animating={isRefreshing} size={14} color={'#1976D2'}/>}
          
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
        {<SideDrawerPublicRides />}
        <HotSpotRegions />
        {isLoading ? <></> : <> 
       <HomeHeader screen={'drive'}/>
        <View style={RouteScreenStyles.mapIconContainer}>
        <TrackingMapIcons markersData={[]} ishomeDriver/>
        </View>
        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
        {blocked ? 
        <View style={[styles.blockedContainer,{bottom: height * 0.09 +(layOutHeight ||0)}]}>
          <Text style={styles.blockedTitle}>{t('your_account_has_been_blocked')}</Text>
          <Text style={styles.blockedSubtitle}>{t('due_to_one_or_more_of_the_following_reasons')}</Text>
          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonText}>• {t('pending_payment_dues')}</Text>
            <Text style={styles.reasonText}>• {t('high_number_of_rejected_trips')}</Text>
            <Text style={styles.reasonText}>• {t('low_driver_ratings')}</Text>
          </View>
          <TouchableOpacity style={styles.contactBtn} onPress={() => setStackScreen('SupportScreen')}>
          <Text style={styles.contactText}>{t('please_contact_support_for_more_information')}</Text>
          </TouchableOpacity>
          {refreshBtn()}
        </View> 
        : !approved ? <View style={[styles.blockedContainer,{bottom: height * 0.09 +(layOutHeight ||0)}]}>
        <Text style={styles.blockedTitle}>{t('your_account_is_under_review')}</Text>
        <Text style={styles.blockedSubtitle}>{t('please_wait_while_we_verify_your_account')}</Text>
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonText}>• {t('document_verification_in_progress')}</Text>
          <Text style={styles.reasonText}>• {t('background_check_pending')}</Text>
          <Text style={styles.reasonText}>• {t('vehicle_inspection_review')}</Text>
           {refreshBtn()}
        </View>
      </View> : !isBankVerified ? 
        <View style={[styles.bankVerificationContainer,{bottom:height * 0.09 +(layOutHeight ||0)}]}>
          <Text style={styles.bankVerificationTitle}>{t('bank_details_under_review')}</Text>
          <Text style={styles.bankVerificationSubtitle}>{t('your_bank_account_is_being_verified_for_payment_processing')}</Text>
          <View style={styles.bankReasonsContainer}>
            <Text style={styles.bankReasonText}>• {t('bank_account_verification_in_progress')}</Text>
            <Text style={styles.bankReasonText}>• {t('payment_details_being_validated')}</Text>
            <Text style={styles.bankReasonText}>• {t('this_process_usually_takes_1_2_business_days')}</Text>
          </View>
          <TouchableOpacity style={styles.bankContactBtn} onPress={() => setStackScreen('SupportScreen')}>
            <Text style={styles.bankContactText}>{t.contact_support_if_verification_takes_longer}</Text>
          </TouchableOpacity>
           {refreshBtn()}
        </View>: <FloatingButton layOutHeight={layOutHeight}/> }
        </>
        }
    </>
  )
}

export default DriverMapScreen

const styles = StyleSheet.create({
  animatedStyles: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  searchcontainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 0.3,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  searchcontainerTxt: {
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  blockedContainer: {
    position: 'absolute',
    
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  blockedTitle: {
    fontSize: 20,
    fontFamily: Fonts.semi_bold,
    color: '#E53935',
    marginBottom: 8,
    textAlign: 'center',
  },
  blockedSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonsContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reasonText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#424242',
    marginBottom: 8,
    lineHeight: 20,
  },
  contactText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 8,
  },
  refreshContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap:10,
  },
  refreshIcon: {
    // marginRight: 6,
  },
  refreshIconTxt: {
    fontSize: 16,
    color: '#1976D2',
    fontFamily: Fonts.medium,
  },
  contactBtnDisabled: {
    opacity: 0.5
  },
  // Bank verification styles
  bankVerificationContainer: {
    position: 'absolute',
    // bottom: height * 0.09,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bankVerificationTitle: {
    fontSize: 20,
    fontFamily: Fonts.semi_bold,
    color: '#FF9800',
    marginBottom: 8,
    textAlign: 'center',
  },
  bankVerificationSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  bankReasonsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bankReasonText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#424242',
    marginBottom: 8,
    lineHeight: 20,
  },
  bankContactBtn: {
    marginTop: 8,
  },
  bankContactText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#1976D2',
    textAlign: 'center',
  },
  refreshBtn:{
    backgroundColor:Colors.grey_light,
    alignItems:'center',
    alignSelf:'center',
    paddingVertical:6,
    paddingHorizontal:12,
    borderRadius:8,
    marginTop:10,
    elevation:2
  }
});
