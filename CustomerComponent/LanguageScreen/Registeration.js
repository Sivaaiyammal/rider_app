import React, {Component} from 'react';
import auth from '@react-native-firebase/auth';
import AuthenticationScreen from '../../Components/Authentication/AuthenticationScreen';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import {AuthendicationStyles} from '../../Styles/Language/authentication';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DataStore} from '../../Controllers/DataStore';
import CustomerLogo from '../../Assets/SplashScreen/DriverLogo.svg';
import APIRequest from '../../Controllers/APIRequest';
import ApiConfig from '../../Config/ApiConfig';

class Registeration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoginView: true,
      otp: '',
      PhoneVerified: false,
      phoneNumber: '',
      loggingIn: false,
      confirmation: null,
      recaptchaToken: null,
      otpCountVerfied: false,

      registerationStepperState: 0,
      registerationStepper: [
        {
          id: 'name',
          title: 'How do we call you?',
          placeholder: 'Your name',
          inputMode: 'text',
        },
        {
          id: 'email',
          title: "What's your Email Address",
          placeholder: 'user@xyz.com',
          inputMode: 'email',
        },
      ],
      name: '',
      email: '',
    };

    this.navigation = this.props.navigation;
  }

//   componentDidMount() {
//     this.unsubscribe = auth().onAuthStateChanged(this.onAuthStateChanged);
//   }

//   componentWillUnmount() {
//     if (this.unsubscribe) {
//       this.unsubscribe();
//     }
//   }

//   onAuthStateChanged = user => {
//     if (user) {
//       // Handle successful sign-in
//       // Hide code input components or navigate to another screen
//       console.log(user, 'user');
//     }
//   };

  handleReCAPTCHAVerify = token => {
    this.setState({recaptchaToken: token});
  };

  onChangeHandler = value => {
    this.setState({phoneNumber: value});
  };
  onLoginLinkClick = () => {
    this.navigation.navigate('AuthenticationScreen');
  };

  async user_profile_update() {
    const {updateLogin} = this.props;
    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/update-profile-details';

    const user_id = 8682918782; // this.props.phone;

    let payload = {
      phone: this.props.phone,
      name: this.state.name,
      email: this.state.email,
      language_setting: '2',
    };
    console.log('user_profile_update-->>payload-->>', payload);
    await api
      .request(url, 'POST', payload)
      .then(data => {
        if (data.status) {
          if (data.message == 'Customer updated successfully') {
            DataStore.storeData('isLoggedIn', false);
            updateLogin('1');
			      DataStore.storeData('isRegister',"Customer updated successfully");
          }
        }
        console.log('user_profile_update-->>data-->>', data);
      })
      .catch(e => console.log('user_profile_update-->>ERROR-->>', e));
    //   .finally(() => ());
  }

  handleOTPChange = otpCount => {
    console.log(otpCount, 'otp count');

    if (otpCount.length == 6) {
      this.setState({otpCountVerified: true});
    } else {
      this.setState({otpCountVerified: false});
    }

    this.setState({otp: otpCount});
  };

  verifyOTP = async () => {
    const {otpCountVerified, confirmation} = this.state;
    let verify = false;

    if (otpCountVerified) {
      try {
        // const credential = auth.PhoneAuthProvider.credential(confirmation.verificationId, this.state.otp);
        // verify = await auth().signInWithCredential(credential);
        // console.log(verify, 'verify')

        // this.navigation.navigate('HomeScreen');

        this.setState({otpCountVerfied: true});
        // this.resetState();
      } catch (error) {
        console.error('Invalid code:', error);
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
    // const authentication = auth.getAuth();

    // if (!this.state.recaptchaToken) {
    // 	console.log('Please complete the reCAPTCHA verification.');
    // 	return;
    // }

    try {
      console.log(`+91${this.state.phoneNumber}`, 'phone number');
      // const confirmation = await auth().verifyPhoneNumber(`+91${this.state.phoneNumber}`,true); // Replace '+91' with the country code as needed
      // Save the confirmation object to verify OTP later
      // const appVerifier = this.state.recaptchaToken;
      // const confirmation = await auth().signInWithPhoneNumber(`+91${this.state.phoneNumber}`);

      this.setState({confirmation: true, isLoginView: false});
    } catch (error) {
      console.error('Error requesting OTP:', error);
    }
  };

  resetState = () => {
    this.setState({
      isLoginView: true,
      otp: '',
      otpCountVerified: false,
      phoneNumber: '',
      loggingIn: false,
      confirmation: null,
    });
  };

  onStepperInputHandler = (id, value) => {
    this.setState({[id]: value});
  };

  onStepperNextHandler = async id => {
    let max_stepper_length = this.state.registerationStepper.length - 1;
    const verifyEmail = value =>
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);

    if (this.state[id].length <= 0) {
      alert(`Please fill ${id}.`);
      return;
    }

    if (id == 'email') {
      if (!verifyEmail(this.state[id])) {
        alert(`Please enter valid email address.`);
      } else {
        this.user_profile_update();
      }
    }

    if (this.state.registerationStepperState < max_stepper_length) {
      this.setState({
        registerationStepperState: this.state.registerationStepperState + 1,
      });
    } else if (this.state.registerationStepperState == max_stepper_length) {
      this.state.registerationStepper.map(stepper => {
        DataStore.storeData(`register-${stepper.id}`, this.state[stepper.id]);
      });

      //   this.navigation.navigate('HomeScreen');
    }
  };
  onStepperBackHandler = () => {
    let max_stepper_length = this.state.registerationStepper.length - 1;

    if (this.state.registerationStepperState == 0) {
    } else if (this.state.registerationStepperState <= max_stepper_length) {
      this.setState({
        registerationStepperState: this.state.registerationStepperState - 1,
      });
    }
  };

  render = () => {
    return (
      //   <>
      //     {!this.state.otpCountVerfied ? (
      //       <View style={AuthendicationStyles.container}>
      //         <View
      //           style={AuthendicationStyles.container}
      //           key={
      //             this.state.registerationStepper[
      //               this.state.registerationStepperState
      //             ].id
      //           }>
      //           <View style={{gap: 5}}>
      //             {this.state.registerationStepperState > 0 ? (
      //               <TouchableOpacity onPress={() => this.onStepperBackHandler()}>
      //                 <Icon
      //                   name="arrow-left"
      //                   style={{fontSize: 24, color: 'black', marginRight: 10}}
      //                 />
      //               </TouchableOpacity>
      //             ) : (
      //               ''
      //             )}
      //             <CustomerLogo width={55} height={90} />

      //             <Text style={AuthendicationStyles.stepperTitleStyle}>
      //               {
      //                 this.state.registerationStepper[
      //                   this.state.registerationStepperState
      //                 ].title
      //               }
      //             </Text>

      //             <View style={AuthendicationStyles.stepperInputContianer}>
      //               <TextInput
      //                 style={{width: '100%', fontSize: 16}}
      //                 placeholder={
      //                   this.state.registerationStepper[
      //                     this.state.registerationStepperState
      //                   ].placeholder
      //                 }
      //                 placeholderTextColor="#000"
      //                 inputMode={
      //                   this.state.registerationStepper[
      //                     this.state.registerationStepperState
      //                   ].inputMode
      //                 }
      //                 autoCapitalize="none"
      //                 autoCorrect={false}
      //                 value={
      //                   this.state[
      //                     this.state.registerationStepper[
      //                       this.state.registerationStepperState
      //                     ].id
      //                   ]
      //                 }
      //                 onChangeText={value =>
      //                   this.onStepperInputHandler(
      //                     this.state.registerationStepper[
      //                       this.state.registerationStepperState
      //                     ].id,
      //                     value,
      //                   )
      //                 }
      //                 color="#000"
      //               />
      //             </View>
      //           </View>
      //           <TouchableOpacity
      //             style={{padding: 10, alignItems: 'flex-end'}}
      //             onPress={() =>
      //               this.onStepperNextHandler(
      //                 this.state.registerationStepper[
      //                   this.state.registerationStepperState
      //                 ].id,
      //               )
      //             }>
      //             <View style={AuthendicationStyles.requestBtn}>
      //               <Text style={{color: 'white'}}>
      //                 {this.state.registerationStepperState ==
      //                 this.state.registerationStepper.length - 1
      //                   ? 'Continue'
      //                   : 'Next'}{' '}
      //               </Text>
      //               <Icon
      //                 name="arrow-right"
      //                 style={{fontSize: 16, color: 'white'}}
      //               />
      //             </View>
      //           </TouchableOpacity>
      //         </View>
      //       </View>
      //     ) : (
      //       <AuthenticationScreen
      //         title={['VM Routes - For Public']}
      //         subtitle={'Sign in using Mobile Number'}
      //         onChangeHandler={this.onChangeHandler}
      //         isLoginLinkEnable={true}
      //         onLoginLinkClick={this.onLoginLinkClick}
      //         value={this.state.phoneNumber}
      //         onLoading={this.state.loggingIn}
      //         onRequestOTP={this.onRequestOTP}
      //         isLoginView={this.state.isLoginView}
      //         onHandleOTPChange={this.handleOTPChange}
      //         verifyOTP={this.verifyOTP}
      //         otpCountVerified={this.state.otpCountVerified}
      //         Colors={'#4b48ab'}
      //         Logo={<CustomerLogo width={55} height={90} />}
      //       />
      //     )}
      //   </>

      <View style={AuthendicationStyles.container}>
        <View
          style={AuthendicationStyles.container}
          key={
            this.state.registerationStepper[
              this.state.registerationStepperState
            ].id
          }>
          <View style={{gap: 5}}>
            {this.state.registerationStepperState > 0 ? (
              <TouchableOpacity onPress={() => this.onStepperBackHandler()}>
                <Icon
                  name="arrow-left"
                  style={{fontSize: 24, color: 'black', marginRight: 10}}
                />
              </TouchableOpacity>
            ) : (
              ''
            )}
            <CustomerLogo width={55} height={90} />

            <Text style={AuthendicationStyles.stepperTitleStyle}>
              {
                this.state.registerationStepper[
                  this.state.registerationStepperState
                ].title
              }
            </Text>

            <View style={AuthendicationStyles.stepperInputContianer}>
              <TextInput
                style={{width: '100%', fontSize: 16}}
                placeholder={
                  this.state.registerationStepper[
                    this.state.registerationStepperState
                  ].placeholder
                }
                placeholderTextColor="#000"
                inputMode={
                  this.state.registerationStepper[
                    this.state.registerationStepperState
                  ].inputMode
                }
                autoCapitalize="none"
                autoCorrect={false}
                value={
                  this.state[
                    this.state.registerationStepper[
                      this.state.registerationStepperState
                    ].id
                  ]
                }
                onChangeText={value =>
                  this.onStepperInputHandler(
                    this.state.registerationStepper[
                      this.state.registerationStepperState
                    ].id,
                    value,
                  )
                }
                color="#000"
              />
            </View>
          </View>
          <TouchableOpacity
            style={{padding: 10, alignItems: 'flex-end'}}
            onPress={() =>
              this.onStepperNextHandler(
                this.state.registerationStepper[
                  this.state.registerationStepperState
                ].id,
              )
            }>
            <View style={AuthendicationStyles.requestBtn}>
              <Text style={{color: 'white'}}>
                {this.state.registerationStepperState ==
                this.state.registerationStepper.length - 1
                  ? 'Continue'
                  : 'Next'}{' '}
              </Text>
              <Icon name="arrow-right" style={{fontSize: 16, color: 'white'}} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
}

export default Registeration;
