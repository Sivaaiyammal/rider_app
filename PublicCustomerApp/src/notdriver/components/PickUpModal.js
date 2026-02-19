import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useRef, useState} from 'react'
import OTPInput from '../../common/components/OTPInput';
import {  width } from '../../common/utils/scalingutils';
import { Colors, Fonts } from '../../common/constants/constants';
import Locgrey from '../../notdriver/assets/icons/loc_grey.svg'
import { useTranslation } from 'react-i18next';

const PickUpModal = ({
  stopsDetails,
  onConfirmPress,
  isLoading,
  isPublicRide,
  otpLoading,
}) => {
  const {t} = useTranslation()
  const [otpCode, setOtpCode] = useState(0);
  const [otpError, setOtpError] = useState('');

  const handleValueChange = value => {
    setOtpCode(value);
  };

  const _onConfirmPress = (otp) => {
    if (!isPublicRide) {
      onConfirmPress();
      return
    }
    if (otp.length !== 4) {
      setOtpError(t('please_enter_otp'));
    }
    else{
      setOtpError('');
      onConfirmPress(otp);
    }
  };

  return (
    <View style={styles.container}>
     
      {isPublicRide ?  
      <>
      <Text style={styles.title}>{t('you_have_reached_your_pickup_location')} </Text>
      <Text style={[styles.title,{marginVertical:10, fontSize:14}]}>{t('please_enter_the_otp')} </Text>
      </>
      : 
      <Text style={styles.title}>
      {t('you_have_reached_your_next_stop_location')}
      </Text>}
      {/* <Text style={styles.stop}>{isPublicRide ? stopsDetails?.bookingForName : stopsDetails?.name}</Text> */}
      <View style={styles.addressContainer}>
        <View style={styles.locBgImg}>
          <Locgrey />
        </View>
        <Text style={styles.address}>{isPublicRide ?  stopsDetails?.stops?.[0]?.address : stopsDetails?.address}</Text>
      </View>
        <View style={{width: '80%', alignSelf: 'center', marginVertical: 10}}>
          {/* <OTPTextView
            ref={otpRef}
            inputCount={4}
            textInputStyle={{
              width: 40,
              height: 50,
              borderWidth: 1,
              borderRadius: 5,
            }}
            tintColor={Colors.periwinkle}
            autoFocus
            handleTextChange={value => handleValueChange(value)}
            keyboardType={'numeric'}
          /> */}
          <OTPInput
                    inputCount={4}
                    onChange={handleValueChange}
                    // onComplete={(code) => setOtpInput(code)}  // your effect will auto-verify when length===6
                    autoFocus
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    focusedBorderColor={Colors.blue_xxdark}
                    tintColor={[
                      Colors.grey_xdark,
                      Colors.grey_xdark ,
                      Colors.grey_xdark,
                      Colors.grey_xdark,
                    ]}
                    inputStyle={{
                      width: 40,
                      height: 60,
                      borderWidth: 1,    
                      margin: 5,
                      borderRadius: 5,
                      color: Colors.black,
                    }}
                />
       
        {(otpCode.length !== 4 && otpError) && <Text style={styles.otpError}>{otpError}</Text>}
        </View>
    

      <TouchableOpacity disabled={otpLoading} style={styles.pickUpBtn} onPress={()=>_onConfirmPress(otpCode)}>
        {otpLoading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.pickUpBtnTxt}>{t('confirm')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PickUpModal;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.black,
    textAlign: 'center',
  },
  stop: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  address: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.black,
    width: width * 0.6,
  },
  locBgImg: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 15,
    borderBottomWidth: 0.3,
    paddingBottom: 10,
    width: width * 0.8,
  },
  pickUpBtn: {
    width: 200,
    alignSelf: 'center',
    backgroundColor: Colors.periwinkle,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  pickUpBtnTxt: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  passangerContainer: {
    width: width * 0.75,
    borderWidth: 0.3,
    alignSelf: 'center',
    marginVertical: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  passangerName: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  passangerStatus: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    backgroundColor: '#fff0e5',
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginVertical: 5,
    borderRadius: 3,
    color: '#ff7700',
  },
  passangerDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '90%',
    marginVertical: 5,
    paddingBottom: 10,
  },
  passangerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  passangerCount: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  otpError:{
    color: 'red',
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginVertical: 5,
    alignSelf: 'center',
  }
});
