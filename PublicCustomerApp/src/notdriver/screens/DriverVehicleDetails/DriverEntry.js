import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useState,useContext, useEffect} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import useUserStore from '../../../common/store/useUserStore';
import usePublicDriverStore from '../../store/usePublicDriverStore';
import { useStackScreenStore } from '../../../common/store/useStackScreenStore';
import { useMapMarkerStore } from '../../../common/store/useMapMarkerStore';
import { aadhaarNumberPattern, Colors, licenseNumberPattern, panNumberPattern, phoneNumberPattern } from '../../../common/constants/constants';
import publicrideDriverApi from '../../api/publicrideDriverApi';
import { showNotification } from '../../../common/components/Alerts/showNotification';
import locationTask from '../../../common/controllers/GetCurrentLocation';
import { checkFineLocationPermissions, RequestFineLocationPermission } from '../../../common/controllers/PermissionHandler';
import InputField from '../../../common/components/InputField';
import { driverDetailStyles } from '../../styles/DriverDetailsUpload';
import { genderData } from '../../../common/constants/jsonData';

import UserName from '../../../notdriver/assets/icons/name.svg';
import Phone from '../../../notdriver/assets/icons/phone.svg';
import Pan from '../../../notdriver/assets/icons/pan.svg';
import License from '../../../notdriver/assets/icons/license.svg';
import AlertModal from '../../components/AlertModal';

const DriverEntry = ({onNext, isEdit = false, setLocationPressed = null}) => {
  const t = {};
  const [isLoading, setIsLoading] = useState(false);
  const {userInfo} = useUserStore()
  const {setDriverInfo, driverInfo} = usePublicDriverStore();
  const { setStackScreen } = useStackScreenStore();
  const [name, setName] = useState(driverInfo.name);
  const [phone, setPhone] = useState(driverInfo.phone);
  const [alternatePhone, setAlternatePhone] = useState(driverInfo.alternatePhone);
  const [aadharID, setAadharId] = useState(driverInfo.aadharNo);
  const [panNum, setPanNum] = useState(driverInfo.panNo);
  const [licenseNum, setLicenseNum] = useState(driverInfo.licenseNo);
  const [gender, setGender] = useState(driverInfo.gender);
  const [nameErr, setNameErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [alternatePhoneErr, setAlternatePhoneErr] = useState('');
  const [aadharIDErr, setAadharIdErr] = useState('');
  const [panNumErr, setPanNumErr] = useState('');
  const [licenseNumErr, setLicenseNumErr] = useState('');
  const [driverLocation, setDriverLocation] = useState(driverInfo.homeLocation);
  const [driverLocationErr, setDriverLocationErr] = useState('');
  const [genderErr, setGenderErr] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const {userLocation} = useMapMarkerStore();

  const validateName = () => {
    if (name.length === 0) {
      setNameErr(t.please_enter_name);
      return false;
    }
    setNameErr('');
    return true;
  };

  const validatePhone = () => {
    if (phone.length === 0) {
      setPhoneErr(t.please_enter_phone);
      return false;
    } else if (!phoneNumberPattern.test(phone)) {
      setPhoneErr(t.valid_phone +' '+ 'starts with +91');
      return false;
    }
    setPhoneErr('');
    return true;
  };

  const validateAlternatePhone = () => {
    if (!alternatePhone || alternatePhone.length === 0) {
      setAlternatePhoneErr('');
      return true;
    }
    if (!phoneNumberPattern.test(alternatePhone)) {
      setAlternatePhoneErr(t.phone_number_must_be_10_digits);
      return false;
    }
    setAlternatePhoneErr('');
    return true;
  }

  const validateAadhar = () => {
    if (!aadharID || aadharID.length === 0) {
      // setAadharIdErr(t.please_enter_aadhar_id_number);
      setAadharIdErr('')
      return true;
    } else if (!aadhaarNumberPattern.test(aadharID)) {
      setAadharIdErr(t.please_enter_a_valid_aadhar_id);
      return false;
    }
    setAadharIdErr('');
    return true;
  };

  const validatePan = () => {
    if (panNum.length === 0) {
      setPanNumErr(t.please_enter_pan_number);
      return false;
    } else if (!panNumberPattern.test(panNum)) {
      setPanNumErr(t.please_enter_a_valid_pan_number);
      return false;
    }
    setPanNumErr('');
    return true;
  };

  const validateLicense = () => {
    if (!licenseNum || licenseNum.length === 0) {
      setLicenseNumErr('');
      // setLicenseNumErr(t.please_enter_license_number);
      return true;
    } else if (!licenseNumberPattern.test(licenseNum)) {
      setLicenseNumErr(t.please_enter_a_valid_license_number_tn01_20110012345);
      return false;
    }
    setLicenseNumErr('');
    return true;
  };

  const validateGender = () => {
    if (!gender) {
      setGenderErr(t.please_select_gender ? t.please_select_gender : 'Please select gender');
      return false;
    }
    setGenderErr('');
    return true;
  };

  const validateDriverLocation = () => {
    if (!driverLocation || driverLocation.addressName === '') {
      setDriverLocationErr(t.please_enter_driver_location);
      return false;
    }
    setDriverLocationErr('');
    return true;
  };
  
  const onNextPress = async () => {
    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isAadharValid = validateAadhar();
    const isPanValid = validatePan();
    const isLicenseValid = validateLicense();
    const isGenderValid = validateGender();
    const isDriverLocationValid = validateDriverLocation();
    const isAlternatePhoneValid = validateAlternatePhone();
  
    if (!userLocation) {
      setShowLocationModal(true);
      return;
    }

    if (isNameValid && isPhoneValid && isAadharValid && isPanValid && isLicenseValid && isGenderValid && isDriverLocationValid && isAlternatePhoneValid) {
      const payload = {
        name: name,
        phone: phone,
        alternatePhone: alternatePhone,
        aadharNo: aadharID,
        panNo: panNum,
        licenseNo: licenseNum,
        gender: gender,
        homeLocation: {coordinates:driverInfo.homeLocation?.coordinates , addressName:driverInfo.homeLocation?.addressName},
        location: userLocation.reverse()
      };
      setIsLoading(true);
      try {
        const response = await publicrideDriverApi.updateDriverDetails(payload,userInfo?.token);
        setIsLoading(false);
        if (response.success) {
          setDriverInfo(payload);
          onNext();
        } else {
          showNotification(response?.message, 'Please Contact Support', 'danger')
        }
      } catch (error) {
        console.error('Error updating driver details:', error);
      } finally {
        setIsLoading(false);
      }
    }
      
    
  };

  const getUserLocation = async () =>{
    await locationTask.getCurrentLocation()  
  }

  const getCurrentLocation = async () => {
    const isLocationPermitted = await checkFineLocationPermissions();
    if (!isLocationPermitted) {
      const hasLocationpermission = await RequestFineLocationPermission();
      if (!hasLocationpermission) {
        showNotification(
          t.location_permission_denied,
          t.grant_location_permission,
          'danger',
          3000,
        );
        return;
      }
    }
    getUserLocation();
  };

  const LocationRequestModal = () => {
    return (
      <AlertModal
      isVisible={showLocationModal}
      onClose={() => {
        setShowLocationModal(false);
      }}
      rightBtnText={t.allow}
      leftBtnTxt={t.cancel}
      successMessage={t.please_allow_location_access_to_continue_we_need_your_location_to_continue} 
      // SubText={'We need your location to continue'}
      onRightPress={() => {
        getCurrentLocation();
        setShowLocationModal(false);
      }}
      animationType={'slide'}
    />
    );
  };

  useEffect(() => {
    if (setLocationPressed) {
      console.log('setLocationPressed', setLocationPressed)
      setLocationPressed(false)
    }
  }, [])



  const handleLocationPress = () => {
      setLocationPressed(true)
      setStackScreen('AddDriverLocation',{fromDriverEntry: true})
  }

  useEffect(() => {
    setDriverLocation(driverInfo.homeLocation);
  }, [driverInfo.homeLocation])

  return (
    <>
    <View style={{height: '100%',display: 'flex',flexDirection: 'column',justifyContent: 'space-between',gap: 10}}>
      <View>
      <TouchableOpacity onPress={handleLocationPress} disabled={isEdit}>    
       <InputField
        style={driverDetailStyles.textField}
        value={driverLocation?.addressName}
        label={t.preferred_work_location}
        errorText={driverLocationErr}
        onChangeText={text => {
          if (driverLocationErr && text.length > 0) setDriverLocation(driverLocation);
        }}
        icon={<Entypo name="location" size={16} color="black" />}
        editable={false}
        onPressOut={() => setStackScreen('AddDriverLocation',{fromDriverEntry: true})}
        selection={{start:0, end:0}}
      />
        </TouchableOpacity>
      <InputField
        style={driverDetailStyles.textField}
        value={name}
        label={t.full_name}
        errorText={nameErr}
        onChangeText={text => {
          setName(text);
          setDriverInfo({ name: text });
          if (nameErr && text.length > 0) setNameErr('');
        }}
        icon={<UserName />}
        isRequired={true}
        editable={isEdit ? false : true}
      />
      <View style={driverDetailStyles.GenderContainer}>
        {genderData.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              driverDetailStyles.GenderBtn,
              {
                backgroundColor: item.value.toLowerCase() === gender.toLowerCase() ? Colors.white : Colors.grey,
                borderColor: item.value.toLowerCase() === gender.toLowerCase() ? Colors.periwinkle : Colors.grey,
              },
            ]}
            disabled={isEdit}
            onPress={isEdit ? null : () => {
              setGender(item.value);
              setDriverInfo({ gender: item.value });
              if (genderErr) setGenderErr('');
            }}
            >
            {item.icon}
            <Text style={driverDetailStyles.GenderTxt}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {Boolean(genderErr) && (
        <Text style={{ color: Colors.danger_red, fontSize: 12, marginTop: -10, marginBottom: 5 }}>
          {genderErr}
        </Text>
      )}
      <InputField
        style={driverDetailStyles.textField}
        value={phone}
        label={t.phone_number}
        errorText={phoneErr}
        onChangeText={text => {
          setPhone(text);
          setDriverInfo({ phone: text });
          if (phoneErr && text.length > 0) setPhoneErr('');
        }}
        icon={<Phone />}
        keyboardType="number-pad"
        maxLength={13}
        isRequired={true}
        editable={ false}
      />

      <InputField
        style={driverDetailStyles.textField}
        value={alternatePhone}
        label={t.alternate_phone_number}
        errorText={alternatePhoneErr}
        onChangeText={text => {
          let formatted = (text || '').toString();
          const digits = formatted.replace(/[^0-9]/g, '');
          if (formatted.startsWith('+91')) {
            // keep +91 and max 10 local digits
            const local = digits.replace(/^91/, '').slice(0, 10);
            formatted = '+91' + local;
          } else {
            const local = digits.endsWith('91') && digits.length > 10
              ? digits.slice(-10)
              : digits.slice(-10);
            formatted = local.length > 0 ? '+91' + local : '';
          }
          setAlternatePhone(formatted);
          setDriverInfo({ alternatePhone: formatted });
          if (alternatePhoneErr && formatted.length > 0) setAlternatePhoneErr('');
        }}
        icon={<Phone />}
        keyboardType="number-pad"
        maxLength={13}
        isRequired={false}
        editable={true}
      />

      <InputField
        style={driverDetailStyles.textField}
        value={aadharID}
        label={t.aadhar_id_number}
        errorText={aadharIDErr}
        onChangeText={text => {
          setAadharId(text);
          setDriverInfo({ aadharNo: text });
          if (aadharIDErr && text.length > 0) setAadharIdErr('');
        }}
        icon={<Pan />}
        keyboardType="number-pad"
        maxLength={12}
        isRequired={false}
        editable={isEdit ? false : true}
      />
      <InputField
        style={driverDetailStyles.textField}
        value={panNum}
        label={t.pan_number}
        errorText={panNumErr}
        onChangeText={text => {
          setPanNum(text);
          setDriverInfo({ panNo: text });
          if (panNumErr && text.length > 0) setPanNumErr('');
        }}
        icon={<Pan />}
        maxLength={10}
        autoCapitalize='characters' 
        isRequired={true}
        editable={isEdit ? false : true}
      />
      <InputField
        style={driverDetailStyles.textField}
        value={licenseNum}
        label={t.license_number}
        errorText={licenseNumErr}
        autoCapitalize='characters' 
        onChangeText={text => {
          setLicenseNum(text);
          setDriverInfo({ licenseNo: text });
          if (licenseNumErr && text.length > 0) setLicenseNumErr('');
        }}
        icon={<License />}
        isRequired={false}
        editable={isEdit ? false : true}
        noSpaces={true}
        />
      </View>
      
      <TouchableOpacity
        style={driverDetailStyles.nextBtn}
        onPress={() => onNextPress()}>
        <Text style={driverDetailStyles.nextTxt}>{t.next}</Text>
        {isLoading ? <ActivityIndicator size="small" color={Colors.white} /> : <AntDesign name="arrowright" color={Colors.white} size={18} />}
      </TouchableOpacity>
    
      </View>
      {showLocationModal && <LocationRequestModal />}
      </>
  );
};

export default DriverEntry;
