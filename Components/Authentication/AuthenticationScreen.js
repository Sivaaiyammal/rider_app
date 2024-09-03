// Reactnative component for basic login screen with email and password fields

import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Appearance,
} from 'react-native';
import PropTypes from 'prop-types';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import OTPTextInput from 'react-native-otp-textinput';
import APIRequest from '../../Controllers/APIRequest';

import Login from './Login';
import {lightThemeStyles, darkThemeStyles} from '../../Styles/ColorSet';
import {styles} from '../../Styles/Components/Authentication/Authentication';
import {getRedirection} from 'react-native-translation/src/LanguageProvider';
import TranslationFile from '../../DriverComponent/locales/TranslationFile';

class AuthenticationScreen extends Component {
  constructor(props) {
    super(props);

    // State to handle both views
    this.state = {
      timer: this.props.timer,
      // timer: 5,
      theme: Appearance.getColorScheme(),
    };

    Appearance.addChangeListener(({colorScheme}) => {
      this.setState({theme: colorScheme});
    });

    this.translation = getRedirection(TranslationFile);
  }

  componentDidUpdate(prevProps) {
    // Check if timer prop has changed
    if (this.props.timer !== prevProps.timer) {
      this.setState({timer: this.props.timer});
    }
  }

  getVerifyOTPView = () => {
    let {value, onHandleOTPChange, verifyOTP, otpCountVerified} = this.props;
    let colors = this.props.Colors;
    let ColorSet =
      Appearance.getColorScheme() === 'light'
        ? lightThemeStyles
        : darkThemeStyles;
    // console.log("state of myAccount", this.state, ColorSet)
    // console.log({ ...styles.container, backgroundColor: ColorSet.white })

    return (
      <View style={{...styles.container, backgroundColor: ColorSet.white}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: colors,
            height: 100,
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
          }}>
          <TouchableOpacity
            onPress={() => {
              this.props.onVerifyOtpBack ? this.props.onVerifyOtpBack() : null;
            }}>
            {/* <Image source={require('../../Assets/Icons/back.png')} style={{ width: 20, height: 20, margin: 10 }} /> */}
            <Icon name="arrow-left" size={25} style={{margin: 10}} />
          </TouchableOpacity>
          <View style={{padding: 10}}>
            <Text style={{color: ColorSet._white}}>Enter</Text>
            <Text
              style={{
                color: ColorSet._white,
                fontWeight: 'bold',
                fontSize: 24,
              }}>
              {this.translation['One Time Password (OTP)']
                ? this.translation['One Time Password (OTP)']
                : 'One Time Password (OTP)'}
            </Text>
          </View>
        </View>
        <View style={{alignItems: 'center', marginTop: 40}}>
          <View style={{color: ColorSet.black, width: '80%'}}>
            <Text style={{color: ColorSet.black, textAlign: 'center'}}>
              {this.translation[
                'An OTP has been sent to your registered mobile number'
              ]
                ? this.translation[
                    'An OTP has been sent to your registered mobile number'
                  ]
                : 'An OTP has been sent to your registered mobile number'}{' '}
              <Text style={{fontWeight: 'bold'}}>{value}</Text>
            </Text>
          </View>
          <OTPTextInput
            containerStyle={{flexDirection: 'row', marginTop: 20}}
            inputCount={6}
            textInputStyle={{
              width: 40,
              height: 60,
              borderColor: 'gray',
              borderWidth: 1,
              margin: 5,
              borderRadius: 5,
              color: ColorSet.black,
            }}
            handleTextChange={onHandleOTPChange}
            focusedBorderColor="#2785ff"
            inputCellLength={1}
            autoFocus={true}
          />
        </View>
        {/* <Text style={{ textAlign: 'center' }}>
					{this.state.timer > 0
						? `Resend OTP in 00:${this.state.timer}`
						: ''}
				</Text> */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 20,
            width: '100%',
            position: 'absolute',
            bottom: 0,
          }}>
          {/* {this.state.timer <= 0 ? (
						<TouchableOpacity
							style={{ padding: 10, alignItems: 'center', width: 130, borderRadius: 5, backgroundColor: colors, marginHorizontal: 20 }}
							onPress={() => {
								// Handle the Resend OTP button click
								// For example, you can call onRequestOTP() here
							}}
						>
							<Text style={{ color: ColorSet._white }}>Resend OTP</Text>
						</TouchableOpacity>
					) : ( */}
          <View></View>
          {/* )} */}
          <TouchableOpacity
            style={{
              padding: 10,
              alignItems: 'center',
              backgroundColor: !otpCountVerified ? '#e0e0e0' : colors,
              width: 130,
              borderRadius: 5,
              marginHorizontal: 20,
            }}
            onPress={() => verifyOTP()}>
            <View>
              {/* style={{ flexDirection: 'row', justifyContent: 'center', width: 130, alignItems: 'center', backgroundColor: !otpVerfied ? '#e0e0e0' : ColorSet._black, padding: 10, color: ColorSet._white, borderRadius: 5 }} */}
              <Text style={{color: ColorSet._white}}>Verify OTP</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render = () => {
    // const {isLoginView} = this.state
    let {
      title,
      subtitle,
      value,
      onLoading,
      onChangeHandler,
      onRequestOTP,
      isLoginView,
      isRegisterLinkEnable,
      onRegisterLinkClick,
      isLoginLinkEnable,
      onLoginLinkClick,
      Logo,
    } = this.props;
    return isLoginView ? (
      <Login
        title={title}
        isRegisterLinkEnable={false}
        onRegisterLinkClick={onRegisterLinkClick}
        isLoginLinkEnable={isLoginLinkEnable || false}
        onLoginLinkClick={onLoginLinkClick}
        subtitle={subtitle}
        onChangeHandler={onChangeHandler}
        value={value}
        onRequestOTP={onRequestOTP}
        onLoading={onLoading}
        Logo={Logo}
      />
    ) : (
      (() => {
        return this.getVerifyOTPView();
      })()
    );
  };
}

AuthenticationScreen.prototype = {
  subtitle: PropTypes.string,
  value: PropTypes.string,
  onLoading: PropTypes.bool,
  onChangeHandler: PropTypes.func,
  onRequestOTP: PropTypes.func,
  isLoginView: PropTypes.bool,
  onHandleOTPChange: PropTypes.func,
  verifyOTP: PropTypes.func,
  Colors: PropTypes.string,
};

AuthenticationScreen.defaultProps = {
  title: '',
  subtitle: '',
  value: '',
  onLoading: false,
  isRegisterEnable: false,
  onRegisterclick: () => {},
  onChangeHandler: () => {},
  onRequestOTP: () => {},
  isLoginView: true,
  onHandleOTPChange: () => {},
  verifyOTP: () => {},
  Colors: '#6f00ff',
};

export default AuthenticationScreen;
