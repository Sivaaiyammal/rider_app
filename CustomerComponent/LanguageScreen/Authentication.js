import React, {Component} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import auth from '@react-native-firebase/auth';

import AuthenticationScreen from '../../Components/Authentication/AuthenticationScreen';
import CustomerLogo from '../../Assets/SplashScreen/DriverLogo.svg';
import {DataStore} from '../../Controllers/DataStore';
import {AuthendicationStyles} from '../../Styles/Language/authentication';
import Registeration from '../../CustomerComponent/LanguageScreen/Registeration';
import APIRequest from '../../Controllers/APIRequest';
import FullScreenLoader from '../../Components/Loaders/FullScreenLoader';
import {GlobalContext} from '../Store/CreateStore';
import ApiConfig from '../../Config/ApiConfig';
// import { GlobalContext } from '../Store/CreateStore';

class Authentication extends Component {
  constructor(props, globalContext) {
    super(props);
    this.state = {
      isLoginView: true,
      otp: '',
      otpCountVerified: false,
      PhoneVerified: false,
      phoneNumber: '',
      loggingIn: false,
      confirmation: null,
      recaptchaToken: null,
      isLoading: true,
      timer: 60,
      showRegisterView: false,
      isRegisterLinkEnable: true,
      isLoginLinkEnable: false,
    };
    this.globalContext = globalContext;
    this.navigation = this.props.navigation;
    this.requestDetailsTimer = undefined;
  }

  componentDidMount() {
    this.unsubscribe = auth().onAuthStateChanged(this.onAuthStateChanged);
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.stopTimer();
  }

  onAuthStateChanged = async user => {
    this.setState({isLoading: true});
    const isLoggedIn = await DataStore.loadData('isRegister');
    if (user && isLoggedIn.data === 'Customer updated successfully') {
      this.stopTimer();
      // const phone = user.phoneNumber.slice(3)
      this.globalContext.setUser({
        userInfo: user.phoneNumber.slice(3),
        app_id: 'customer',
      });
      this.navigation.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      });
      // Handle successful sign-in
      // Hide code input components or navigate to another screen
    }
    this.setState({isLoading: false});
  };

  handleReCAPTCHAVerify = token => {
    this.setState({recaptchaToken: token});
  };

  onChangeHandler = value => {
    this.setState({phoneNumber: value});
  };
  onRegisterLinkClick = () => {
    // this.navigation.navigate('RegisterationScreen');
    this.setState({
      isRegisterLinkEnable: false,
      isLoginLinkEnable: true,
    });
  };

  onLoginLinkClick = () => {
    this.setState({
      isRegisterLinkEnable: true,
      isLoginLinkEnable: false,
    });
  };

  handleOTPChange = otpCount => {
    console.log(otpCount, 'otp count');

    if (otpCount.length == 6) {
      this.setState({otpCountVerified: true});
    } else {
      this.setState({otpCountVerified: false});
    }

    this.setState({otp: otpCount});
  };

  async register_user() {
    this.setState({isLoading: true});
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/register';

    let payload = {
      phone: this.state.phoneNumber,
    };
    console.log('register_user-->>payload-->>', payload);
    console.log('register_user-->>payload-->>','three');
    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.success) {
          this.globalContext.setUser({
            userInfo: this.state.phoneNumber,
            app_id: 'customer',
          });
          this.setState({showRegisterView: true, isLoginView: true});
        } else {
          this.globalContext.setUser({
            userInfo: this.state.phoneNumber,
            app_id: 'customer',
          });
          this.resetState();
          DataStore.storeData('isRegister', 'Customer updated successfully');
          this.setState({showRegisterView: false, isLoginView: false});
          this.navigation.reset({
            index: 0,
            routes: [{name: 'HomeScreen'}],
          });
        }
      })
      .catch(
        e => (
          console.log('register_user-->>ERROR-->>', e),
          this.setState({isLoading: false})
        ),
      )
      .finally(() => this.setState({isLoading: false}));
  }

  update_login = async value => {
    if (value === '1') {
      this.navigation.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      });
      this.resetState();
    }
    console.log('hari-->>update_login-->>', true);
  };

  verifyOTP = async () => {
    const {otpCountVerified, confirmation} = this.state;
    let verify = false;
    this.setState({isLoading: true});
    const app_type = this.props.route.params.app_type || null;

    if (otpCountVerified) {
      try {
        const credential = auth.PhoneAuthProvider.credential(
          confirmation.verificationId,
          this.state.otp,
        );
        verify = await auth().signInWithCredential(credential);
        DataStore.storeData('user', true);
        DataStore.storeData('USER_DATA', { user_id: this.state.phoneNumber, app_id: 'customer' })
        this.stopTimer();

        this.setState({isLoading: true});
        if (this.state.isRegisterLinkEnable) {
          await this.register_user();
        } else {
          // if (!this.state.isRegisterLinkEnable) {
          //   this.navigation.navigate('RegisterationScreen');
          //   return
          // }
          console.log('register_user-->>payload-->>','two');
          this.navigation.reset({
            index: 0,
            routes: [{name: 'HomeScreen'}],
          });
          this.resetState();
          this.setState({isLoading: false});
        }
      } catch (error) {
        console.error('Invalid code:', error);
        this.setState({isLoading: false});
      }
    } else {
      alert('Please enter a valid OTP.');
    }
  };

  onLogin = async () => {
    this.setState({loggingIn: true});
    // let api = new APIRequest();

    try {
      // const data = await api.request(
      //     '/api/employee/login',
      //     'POST',
      //     { employee_id: this.state.phone },
      //     {},
      //     {}
      // )
      this.setState({loggingIn: false, isLoginView: false});

      // if (data.status) {
      //     this.props.onComplete()
      // } else {
      // }
    } catch (error) {
      this.setState({loggingIn: false});
      console.error('Error fetching data:', error.message);
    }
  };

  onRequestOTP = async () => {
    console.log('otp requested');
    this.setState({isLoading: true});
    // const authentication = auth.getAuth();

    // if (!this.state.recaptchaToken) {
    // 	console.log('Please complete the reCAPTCHA verification.');
    // 	return;
    // }

    try {
      console.log(`+91${this.state.phoneNumber}`, 'phone number');
      // const confirmation = await auth().verifyPhoneNumber(`+91${this.state.phoneNumber}`,true); // Replace '+91' with the country code as needed
      // Save the confirmation object to verify OTP later
      // const appVerifier = this.state.updateLogin;
      const confirmation = await auth().signInWithPhoneNumber(
        `+91${this.state.phoneNumber}`,
      );
      console.log(confirmation, 'confirmation');
      this.setState({confirmation, isLoginView: false, timer: 60});
      this.startTimer();
      this.setState({isLoading: false});
    } catch (error) {
      console.error('Error requesting OTP:', error);
      this.setState({isLoading: false});
    }
  };

  resetState = (timer = false) => {
    this.setState({
      isLoginView: true,
      otp: '',
      otpCountVerified: false,
      phoneNumber: '',
      loggingIn: false,
      confirmation: null,
      timer: 60,
    });
    timer ? this.startTimer() : null;
  };

  startTimer = async () => {
    await this.stopTimer();
    this.requestDetailsTimer = setInterval(() => {
      console.log(this.state.timer, 'timer');
      if (this.state.timer > 0) {
        this.setState({timer: this.state.timer - 1});
      } else {
        clearInterval(this.requestDetailsTimer);
      }
    }, 1000);
  };

  stopTimer = () => {
    try {
      // this.timerInterval ? clearInterval(this.timerInterval) : null;
      if (this.requestDetailsTimer) {
        clearTimeout(this.requestDetailsTimer);
      }
    } catch {}
  };

  render = () => {
    return this.state.isLoading ? (
      <FullScreenLoader />
    ) : (
      <>
        {!this.state.showRegisterView ? (
          <AuthenticationScreen
            title={['VM Routes - For Public']}
            subtitle={'Sign in using Mobile Number'}
            onChangeHandler={this.onChangeHandler}
            // isRegisterLinkEnable={this.state.isRegisterLinkEnable}
            // isLoginLinkEnable={this.state.isLoginLinkEnable}
            // onRegisterLinkClick={this.onRegisterLinkClick}
            // onLoginLinkClick={this.onLoginLinkClick}
            value={this.state.phoneNumber}
            onLoading={this.state.loggingIn}
            onRequestOTP={this.onRequestOTP}
            isLoginView={this.state.isLoginView}
            onHandleOTPChange={this.handleOTPChange}
            verifyOTP={this.verifyOTP}
            otpCountVerified={this.state.otpCountVerified}
            Colors={'#4b48ab'}
            timer={this.state.timer}
            Logo={<CustomerLogo width={55} height={90} />}
          />
        ) : (
          <>
            <Registeration
              phone={this.state.phoneNumber}
              app_type={'customer'}
              updateLogin={this.update_login}
            />
          </>
        )}
      </>
    );
  };
}

Authentication.contextType = GlobalContext;
export default Authentication;
