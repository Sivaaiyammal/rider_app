import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState, useCallback, useContext } from 'react';

import CountryPicker, { FlagButton } from 'react-native-country-picker-modal';
import { registerationStyles } from '../../styles/UserStyles';
import BackArrow from '../../assets/image/backArrow.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { showNotification } from '../../components/NotificationManger';
import { DataStore } from '../../controllers/DataStore';
import { usePostQuery } from '../../hooks/useQuery';
import useUserInfoStore from '../../store/useUserInfoStore';
import { utils } from '../../utils/Utils';
import DatePicker from 'react-native-date-picker'
import { GlobalContext } from '../../context/GlobalContext';
const RegisterationScreen = () => {
  const navigation = useNavigation();

  const { id: UserId, userdetails, setUserdetails } = useUserInfoStore();

  const [FormStepperState, setFormStepperState] = useState(0);
  const [FormStepper, setFormStepper] = useState(
    [
      {
        id: 'name',
        title: "How do we call you?",
        placeholder: "Your name",
        inputMode: 'text',
        maxlength:40
      },
      {
        id: 'phonenumber',
        title: "Your Phone Number",
        placeholder: "1234567890",
        inputMode: 'number',
        maxlength:10
      },
      {
        id: 'email',
        title: "What's your Email Address",
        placeholder: "user@xyz.com",
        inputMode: 'email',
        maxlength:40
      },
      {
        id: 'gender',
        title: "What's your Gender",
        inputMode: 'text'
      },
      {
        id: 'password',
        title: "Create a Password",
        inputMode: 'text',
        maxlength:20
      },
    ]
  );

  const [Name, setName] = useState('');
  const [DOB, setDOB] = useState(new Date());
  const {addListener} = useContext(GlobalContext);
  const [Email, setEmail] = useState('');
  const [OpenDatePicker, setOpenDatePicker] = useState(false)
  const [Phone, setPhone] = useState('');
  const [Gender,setGender]=useState('');
  const [Password,setPassword]=useState('');
  const [ShowPassword, setShowPassword] = useState(false);

  const [InputErrorId, setInputErrorId] = useState('')
  const [InputErrorMssage, setInputErrorMssage] = useState('')

  const verifyEmail = (value) => (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))
  const verifyPassword = (value) => (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(value))


  const onRegisterSuccess = (data) => {


    console.log(data, 'data');

    if (data.success) {
      showNotification('Registeration Completed Successfully', '', 'success');
      console.log(data, 'data');
      let {token} = data?.user;
      console.log("token", token)
      DataStore.storeData('access_token', token);
      DataStore.storeData('userdetails', data?.user);
      setUserdetails(data?.user);
      addListener(token);
     
      navigation.dispatch(
        CommonActions.navigate({
          name: 'HomeScreen',
        }),
      );
    
    } else {
      showNotification('Please try again', data.message, 'danger');
    }

  }

  const onRegisterError = (data) => {
    console.log('data');
    if (!data.success) showNotification('Please try again', data.message, 'danger');

  }

  const { mutate: RegisterMutate, isSuccess } = usePostQuery({
    onSuccess: onRegisterSuccess,
    onError: onRegisterError
  });

  const onStepperBackHandler = () => {
    let max_stepper_length = FormStepper.length - 1

    if (FormStepperState != 0 && FormStepperState <= max_stepper_length) setFormStepperState(FormStepperState - 1)
  }
  const onStepperNextHandler = async (id) => {

    if (InputErrorId == id) return

    let max_stepper_length = FormStepper.length - 1
    const verifyEmail = (value) => (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))

    if (
      (id == 'name' && Name.length <= 0)
      || (id == 'dob' && DOB.length <= 0)
      || (id == 'email' && Email.length <= 0)
      || (id == 'phonenumber' && Phone.length <= 0)
      || (id == 'gender' && Gender.length <= 0)
      || (id == 'password' && Password.length <= 0)
    ) return alert(`Please fill ${id}.`);

    if (id == 'email' && !verifyEmail(Email)) return alert(`Please enter valid email address.`);
    if (id == 'password' && !verifyPassword(Password)) return alert(`Password must contain at least 8 characters, including uppercase, lowercase, number and special character.`);

    if (FormStepperState < max_stepper_length) setFormStepperState(FormStepperState + 1)
    else if (FormStepperState == max_stepper_length) {

      const payload = {
        name: Name,
        email: Email,
        phone: `+91${Phone}`,  
        password: Password,
        gender: Gender
      }
      console.log(payload, 'payload');

      RegisterMutate({
        queryKey: 'profileUpdateQuery',
        url: '/publicrides/customer/signup',
        payload: payload
      })

     
    }

  }
  const onStepperInputHandler = (id, value) => {
    if (id == 'name') setName(value)
    else if (id == 'dob') setDOB(value)
    else if (id == 'phonenumber') setPhone(value)
    else if (id == 'gender') setGender(value)
    else if (id == 'password') setPassword(value)
    else if (id == 'email') {

      console.log(verifyEmail(value), 'ashdgasd');

      if (!verifyEmail(value)) {
        setInputErrorId(id)
        setInputErrorMssage('Please enter valid email address.')
      } else {
        setInputErrorId('')
        setInputErrorMssage('')
      }
      setEmail(value)
    }
  }

  const onStepperInputFocusHandler = (id, value) => {
    if (id == 'dob') setOpenDatePicker(true)
  }

  const getStepperInputValue = (id) => {

    if (id == 'name') return Name
    else if (id == 'dob') return utils.formatDate(DOB, 'DD-MM-YYYY')
    else if (id == 'phonenumber') return Phone

    else if (id == 'email') return Email
  }
  const onDOBDateChange = (date) => {
    setOpenDatePicker(false)
    setDOB(date)
  }
  const onDatePickerClose = () => {
    setOpenDatePicker(false)
  }


  return (
    <View
      style={registerationStyles.container}
      key={FormStepper[FormStepperState].id}
    >
      <View style={{ gap: 5 }}>
        {FormStepperState > 0 ?
          <TouchableOpacity onPress={() => onStepperBackHandler()}>
            <BackArrow />
          </TouchableOpacity>
          : ""}
        <Text style={registerationStyles.stepperTitleStyle}>
          {FormStepper[FormStepperState].title}
        </Text>

        {FormStepper[FormStepperState].id=='gender' ?
          <View style={{flexDirection:'row',gap:10,padding:10}}>
            <TouchableOpacity style={{width:'50%',borderWidth:1,borderColor:'#000',padding:10,borderRadius:5,backgroundColor:Gender=='male'?'#000':'#fff',}} onPress={()=>setGender('male')}>
              <Text style={{color:Gender=='male'?'#fff':'#000',textAlign:'center'}}>
                Male
                
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{width:'50%',borderWidth:1,borderColor:'#000',padding:10,borderRadius:5,backgroundColor:Gender=='female'?'#000':'#fff'}} onPress={()=>setGender('female')}>
              <Text style={{color:Gender=='female'?'#fff':'#000',textAlign:'center'}}>
                Female
               
              </Text>
            </TouchableOpacity>
          </View>
          :
        <View style={[
          InputErrorId == FormStepper[FormStepperState].id
            ? registerationStyles.stepperInputError : {},
          registerationStyles.stepperInputContianer
        ]}>
          {FormStepper[FormStepperState].id=='phonenumber' && <View><Text>+91</Text></View>}
         
          <TextInput
            style={{ width: "100%", fontSize: 16 }}
            placeholder={FormStepper[FormStepperState].placeholder}
            placeholderTextColor="#D3D3D3"
            inputMode={FormStepper[FormStepperState].inputMode}
            autoCapitalize="none"
            autoCorrect={false}
            value={getStepperInputValue(FormStepper[FormStepperState].id)}
            onChangeText={(value) => onStepperInputHandler(FormStepper[FormStepperState].id, value)}
            onFocus={(value) => onStepperInputFocusHandler(FormStepper[FormStepperState].id, value)}
            color="#000"
            maxLength={FormStepper[FormStepperState].maxlength}
            secureTextEntry={FormStepper[FormStepperState].id === 'password' && !ShowPassword}
          />
          {FormStepper[FormStepperState].id === 'password' && (
            <TouchableOpacity style={{position:'absolute',right:10,top:10}} onPress={() => setShowPassword(!ShowPassword)}>
              <Text>{ShowPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          )}
          
          {OpenDatePicker ?
            <DatePicker
              modal
              open={OpenDatePicker}
              date={DOB}
              onConfirm={onDOBDateChange}
              onCancel={onDatePickerClose}
              mode='date'
              maximumDate={new Date()}
            />
            : ''}
        </View>
        }
        {InputErrorId == FormStepper[FormStepperState].id ?
          <Text style={registerationStyles.stepperInputErrorMessage}>{InputErrorMssage}</Text>
          : ""}
      </View>
      <TouchableOpacity
        style={{ padding: 10, alignItems: 'flex-end' }}
        onPress={() => onStepperNextHandler(FormStepper[FormStepperState].id)}
      >
        <View style={[InputErrorId == FormStepper[FormStepperState].id ? registerationStyles.requestBtnDisabe : {}, registerationStyles.requestBtn]}>
          <Text style={{ color: 'white' }}>{
            FormStepperState == FormStepper.length - 1 ? 'Continue' : 'Next'
          } </Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default RegisterationScreen;