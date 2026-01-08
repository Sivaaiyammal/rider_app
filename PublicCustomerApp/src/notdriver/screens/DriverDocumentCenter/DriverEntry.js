import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import useUserStore from '../../../common/store/useUserStore';
import usePublicDriverStore from '../../store/usePublicDriverStore';
import { useStackScreenStore } from '../../../common/store/useStackScreenStore';
import { Colors, licenseNumberPattern, phoneNumberPattern } from '../../../common/constants/constants';
import { showNotification } from '../../../common/components/Alerts/showNotification';
import locationTask from '../../../common/controllers/GetCurrentLocation';
import { checkFineLocationPermissions, RequestFineLocationPermission } from '../../../common/controllers/PermissionHandler';
import InputField from '../../../common/components/InputField';
import { driverDetailStyles } from '../../styles/DriverDetailsUpload';
import { genderData } from '../../../common/constants/jsonData';

import UserName from '../../../notdriver/assets/icons/name.svg';
import Phone from '../../../notdriver/assets/icons/phone.svg';
import License from '../../../notdriver/assets/icons/license.svg';
import AlertModal from '../../components/AlertModal';
import { useTranslation } from 'react-i18next';
import DocumentImageScanner from '../../components/DocumentImageScanner';
import NavBar from '../../../notCustomer/components/NavBar';
import DateTimePicker from '@react-native-community/datetimepicker';
import APIRequest from '../../../common/controllers/APIRequest';
import UseBackButton from '../../../common/hooks/UseBackButton';

const DriverEntry = ({isEdit = false, setLocationPressed = null}) => {
  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const {userInfo} = useUserStore()
  const {setDriverInfo, driverInfo} = usePublicDriverStore();
  const [name, setName] = useState(driverInfo.name);
  const [phone, setPhone] = useState(driverInfo.phone);
  const [alternatePhone, setAlternatePhone] = useState(driverInfo.alternatePhone);
  const [licenseNum, setLicenseNum] = useState(driverInfo.licenseNo);
  const [gender, setGender] = useState(driverInfo.gender);
  const [dob, setDob] = useState(driverInfo.dob || '');
  const [nameErr, setNameErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [alternatePhoneErr, setAlternatePhoneErr] = useState('');
  const [licenseNumErr, setLicenseNumErr] = useState('');
  const [driverLocation, setDriverLocation] = useState(driverInfo.homeLocation);
  const [genderErr, setGenderErr] = useState('');
  const [dobErr, setDobErr] = useState('');
  const [driverPhotoErr, setDriverPhotoErr] = useState('');
  const [licenseDocErr, setLicenseDocErr] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [licenseScanMessage, setLicenseScanMessage] = useState('');
  const [driverPhoto, setDriverPhoto] = useState(driverInfo.driverPhoto || null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const parseDobToDate = useCallback((value) => {
    const fallback = new Date(1990, 0, 1);
    if (!value || typeof value !== 'string') return fallback;
    // Try DD-MM-YYYY
    let m = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) {
      const d = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const y = Number(m[3]);
      const dt = new Date(y, mo, d);
      return isNaN(dt.getTime()) ? fallback : dt;
    }
    // Try YYYY-MM-DD (legacy)
    m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      const dt = new Date(y, mo, d);
      return isNaN(dt.getTime()) ? fallback : dt;
    }
    return fallback;
  }, []);
  const [dobDate, setDobDate] = useState(parseDobToDate(driverInfo.dob || dob));
  const {setDriverDetailsCompleteStatus} = usePublicDriverStore();
  
  const {goBack} = useStackScreenStore();

  const normalizeLicenseNumber = useCallback(value => {
    if (!value) {
      return '';
    }
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length <= 4) {
      return cleaned;
    }
    if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`.trim();
    }
    if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}${cleaned.slice(8)}`.trim();
    }
    const first = cleaned.slice(0, 4);
    const second = cleaned.slice(4, 8);
    const rest = cleaned.slice(8);
    return `${first} ${second}${rest}`.trim();
  }, []);
      
  const extractLicenseNumber = useCallback(text => {
    if (!text) {
      return '';
    }
    const normalized = text.toUpperCase().replace(/[^A-Z0-9\s]/g, ' ');
    const licenseMatch = normalized.match(/[A-Z]{2}\s*\d{2}\s*\d{4}\s*\d{7,8}/);
    return licenseMatch ? licenseMatch[0] : '';
  }, []);

  const extractDobFromText = useCallback(text => {
    if (!text) {
      return '';
    }

    const normalized = text.replace(/\s+/g, ' ');
    const dobLabelMatch = normalized.match(/(?:DOB|Date of Birth)[:\-\s]*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i);
    let dobCandidate = dobLabelMatch?.[1] || '';

    if (!dobCandidate) {
      const genericMatch = normalized.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/);
      if (genericMatch) {
        dobCandidate = `${genericMatch[1]}-${genericMatch[2]}-${genericMatch[3]}`;
      }
    }

    if (!dobCandidate) {
      return '';
    }

    const cleaned = dobCandidate.trim().replace(/[.\/]/g, '-');
    const parts = cleaned.split('-');
    if (parts.length !== 3) {
      return '';
    }

    let [day, month, year] = parts;
    if (year.length === 2) {
      year = Number(year) > 30 ? `19${year}` : `20${year}`;
    }

    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');

    if (paddedDay > '31' || paddedMonth > '12' || year.length !== 4) {
      return '';
    }

    return `${paddedDay}-${paddedMonth}-${year}`;
  }, []);

  const handleLicenseScanComplete = useCallback(
    result => {
      if (!result) {
        setLicenseScanMessage('');
        return;
      }

      if (result.image) {
        setDriverInfo({ licenseDocument: result.image });
        setLicenseDocErr('');
      }

      if (result.text) {
        const autoMessages = [];

        const extractedLicense = extractLicenseNumber(result.text);
        if (extractedLicense) {
          const normalized = normalizeLicenseNumber(extractedLicense);
          setLicenseNum(normalized);
          setDriverInfo({ licenseNo: normalized });
          autoMessages.push(
            t('license_number_detected')
          );
        }

        const detectedDob = extractDobFromText(result.text);
        if (detectedDob) {
          setDob(detectedDob);
          setDriverInfo({ dob: detectedDob });
          setDobDate(parseDobToDate(detectedDob));
          setDobErr('');
          autoMessages.push(
            t('dob_detected_auto_filled'),
          );
        }

        if (autoMessages.length > 0) {
          setLicenseScanMessage(autoMessages.join(' '));
        } else {
          setLicenseScanMessage(
            t('license_details_not_detected'),
          );
        }
      }
    },
    [
      extractDobFromText,
      extractLicenseNumber,
      normalizeLicenseNumber,
      parseDobToDate,
      setDriverInfo,
      t,
    ],
  );

  const validateName = () => {
    if (name.length === 0) {
      setNameErr(t('please_enter_name'));
      return false;
    }
    setNameErr('');
    return true;
  };

  const validatePhone = () => {
    if (phone.length === 0) {
      setPhoneErr(t('please_enter_phone'));
      return false;
    } else if (!phoneNumberPattern.test(phone)) {
      setPhoneErr(t('valid_phone'));
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
      setAlternatePhoneErr(t('phone_number_must_be_10_digits'));
      return false;
    }
    setAlternatePhoneErr('');
    return true;
  }

  const validateLicense = () => {
    if (licenseNum.length === 0) {
      setLicenseNumErr(t('please_enter_license_number'));
      return false;
    } else if (!licenseNumberPattern.test(licenseNum)) {
      setLicenseNumErr(t('please_enter_a_valid_license_number_tn01_20110012345'));
      return false;
    }
    setLicenseNumErr('');
    return true;
  };

  const validateGender = () => {
    if (!gender) {
      setGenderErr(t('please_select_gender') ? t('please_select_gender') : 'Please select gender');
      return false;
    }
    setGenderErr('');
    return true;
  };

  const validateDob = () => {
    if (!dob || dob.trim().length === 0) {
      setDobErr(t('please_enter_dob'));
      return false;
    }
    setDobErr('');
    return true;
  };
  
  const buildFileParam = file => {
    if (!file || typeof file === 'string' || !file.uri) {
      return null;
    }
    return {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || `document_${Date.now()}.jpg`,
    };
  };

  const hasImageValue = useCallback(image => {
    if (!image) {
      return false;
    }
    if (typeof image === 'string') {
      return image.trim().length > 0;
    }
    if (typeof image === 'object' && image.uri) {
      return String(image.uri).trim().length > 0;
    }
    return false;
  }, []);

  const onNextPress = async () => {
    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isLicenseValid = validateLicense();
    const isGenderValid = validateGender();
    const isAlternatePhoneValid = validateAlternatePhone();
    const isDobValid = validateDob();

    const resolvedDriverPhoto = driverPhoto || driverInfo.driverPhoto || null;
    const hasDriverPhoto = hasImageValue(resolvedDriverPhoto);
    const hasLicenseDoc = hasImageValue(driverInfo.licenseDocument);

    if (!hasDriverPhoto) {
      setDriverPhotoErr(
        t('please_upload_driver_photo', {
          defaultValue: 'Upload the driver photo before proceeding.',
        }),
      );
    } else {
      setDriverPhotoErr('');
    }

    if (!hasLicenseDoc) {
      setLicenseDocErr(
        t('please_upload_license_document', {
          defaultValue: 'Upload the driving license before proceeding.',
        }),
      );
    } else {
      setLicenseDocErr('');
    }

    if (
      !(
        isNameValid &&
        isPhoneValid &&
        isLicenseValid &&
        isGenderValid &&
        isAlternatePhoneValid &&
        isDobValid &&
        hasDriverPhoto &&
        hasLicenseDoc
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('gender', gender);
    formData.append('phone', phone);
    if (alternatePhone) formData.append('alternatePhone', alternatePhone);
    formData.append('dob', dob);
    if (licenseNum) formData.append('licenseNo', licenseNum.trim());

    const driverPhotoFile = buildFileParam(resolvedDriverPhoto);
    if (driverPhotoFile) formData.append('driverPhoto', driverPhotoFile);

    const licenseFile = buildFileParam(driverInfo.licenseDocument || null);
    if (licenseFile) formData.append('drivingLicense', licenseFile);

    setIsLoading(true);
    try {
      const api = new APIRequest();
      const response = await api.request(`/publicrides/driver/updateDriverInfo`, 'POST', formData, userInfo?.token);
      console.log('Update Driver Info Response:', response);
      if (response.success) {
        setDriverInfo({
          ...driverInfo,
          name,
          phone,
          alternatePhone,
          licenseNo: licenseNum,
          gender,
          driverPhoto: resolvedDriverPhoto,
          dob,
        });
        showNotification(response?.message, response?.message, 'success');
        goBack();
        setDriverDetailsCompleteStatus(true)
      } else {
        showNotification(response?.message, 'Please Contact Support', 'danger');
      }
    } catch (error) {
      console.error('Error updating driver details:', error);
    } finally {
      setIsLoading(false);
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
          t('location_permission_denied'),
          t('grant_location_permission'),
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
      rightBtnText={t('allow')}
      leftBtnTxt={t('cancel')}
      successMessage={t('please_allow_location_access_to_continue_we_need_your_location_to_continue')} 
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

  useEffect(() => {
    setDriverLocation(driverInfo.homeLocation);
  }, [driverInfo.homeLocation])

  useEffect(() => {
    setDriverPhoto(driverInfo.driverPhoto || null);
  }, [driverInfo.driverPhoto]);

  useEffect(() => {
    if (hasImageValue(driverPhoto || driverInfo.driverPhoto)) {
      setDriverPhotoErr('');
    }
  }, [driverPhoto, driverInfo.driverPhoto, hasImageValue]);

  useEffect(() => {
    if (hasImageValue(driverInfo.licenseDocument)) {
      setLicenseDocErr('');
    }
  }, [driverInfo.licenseDocument, hasImageValue]);

  useEffect(() => {
    const input = driverInfo.dob || '';
    const d = parseDobToDate(input);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const formatted = input ? `${dd}-${mm}-${yyyy}` : '';
    setDob(formatted);
    setDobDate(d);
  }, [driverInfo.dob, parseDobToDate]);

  return (
    <View style={{flex: 1, backgroundColor: Colors.white}}>
    <NavBar title={t('driver_details',{defaultValue: 'Driver Details'})} onBackPress={() => goBack()} />
      <UseBackButton onBackPress={() => goBack()} />
    <ScrollView contentContainerStyle={{paddingBottom: 32, backgroundColor: Colors.white, alignItems: 'center'}}>
    <View style={{gap: 10, width:'90%'}}>
      <View>
         <View style={{ marginTop: 16 }}>
        <DocumentImageScanner
          documentLabel={t('driver_photo', {
            defaultValue: 'Driver Photo',
          })}
          browseLabel={t('browse', { defaultValue: 'Browse' })}
          cameraLabel={t('camera', { defaultValue: 'Camera' })}
          initialImage={driverPhoto || driverInfo.driverPhoto || null}
          onScanComplete={result => {
            if (result?.image) {
              setDriverPhoto(result.image);
              setDriverInfo({ driverPhoto: result.image });
              setDriverPhotoErr('');
            }
          }}
          onImageSelected={image => {
            if (image) {
              setDriverPhoto(image);
              setDriverInfo({ driverPhoto: image });
              setDriverPhotoErr('');
            }
          }}
          helperText={t('driver_photo_helper', {
            defaultValue: 'Upload or capture a clear recent photo of the driver.',
          })}
          scannerTitle={t('upload_driver_photo', {
            defaultValue: 'Upload or capture driver photo',
          })}
          disabled={isEdit}
          disabledMessage={t('editing_disabled', {
            defaultValue: 'Editing is disabled in this mode.',
          })}
          containerStyle={{ marginTop: 0 }}
        />
        {driverPhotoErr ? (
          <Text style={{ color: Colors.danger_red, fontSize: 12, marginTop: 8 }}>
            {driverPhotoErr}
          </Text>
        ) : null}
      </View>
        <View style={{ marginTop: 16 }}>
        <DocumentImageScanner
          documentLabel={t('driving_license', {
            defaultValue: 'Driving License',
          })}
          browseLabel={t('browse', { defaultValue: 'Browse' })}
          cameraLabel={t('camera', { defaultValue: 'Camera' })}
          initialImage={driverInfo.licenseDocument || null}
          onScanComplete={handleLicenseScanComplete}
          onImageSelected={image => {
            if (image) {
              setDriverInfo({ licenseDocument: image });
              setLicenseDocErr('');
            }
          }}
          helperText={t('license_scan_helper', {
            defaultValue: 'Upload or capture the driving license to scan details automatically.',
          })}
          scannerTitle={t('upload_driving_license', {
            defaultValue: 'Upload or capture driving license',
          })}
          disabled={isEdit}
          disabledMessage={t('editing_disabled', {
            defaultValue: 'Editing is disabled in this mode.',
          })}
          containerStyle={{ marginTop: 0 }}
        />
        {licenseDocErr ? (
          <Text style={{ color: Colors.danger_red, fontSize: 12, marginTop: 8 }}>
            {licenseDocErr}
          </Text>
        ) : null}
        {licenseScanMessage ? (
          <Text style={{ color: Colors.cool_grey, fontSize: 12, marginTop: 8 }}>
            {licenseScanMessage}
          </Text>
        ) : null}
      </View>
      <InputField
        style={driverDetailStyles.textField}
        value={name}
        label={t('full_name')}
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
            {/* {item.icon} */}
            <Text style={driverDetailStyles.GenderTxt}>{t(item.name)}</Text>
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
        label={t('phone_number')}
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
        value={licenseNum}
        label={t('license_number')}
        errorText={licenseNumErr}
        autoCapitalize='characters' 
        onChangeText={text => {
          const formatted = (text || '').toUpperCase();
          setLicenseNum(formatted);
          setDriverInfo({ licenseNo: formatted });
          if (licenseNumErr && formatted.length > 0) setLicenseNumErr('');
          if (licenseScanMessage) setLicenseScanMessage('');
        }}
        icon={<License />}
        isRequired={true}
        editable={isEdit ? false : true}
        noSpaces={true}
        />
      </View>

         <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !isEdit && setShowDobPicker(true)}
        disabled={isEdit}
      >
        <InputField
          style={driverDetailStyles.textField}
          value={dob}
          label={t('dob', { defaultValue: 'Date of Birth (DD-MM-YYYY)' })}
          errorText={dobErr}
          editable={false}
          isRequired={true}
        />
      </TouchableOpacity>
      {showDobPicker && (
        <DateTimePicker
          value={dobDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowDobPicker(false);
            }
            if (selectedDate) {
              const yyyy = selectedDate.getFullYear();
              const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const ddv = String(selectedDate.getDate()).padStart(2, '0');
              const formatted = `${ddv}-${mm}-${yyyy}`;
              setDob(formatted);
              setDriverInfo({ dob: formatted });
              setDobErr('');
              setDobDate(selectedDate);
            }
          }}
          // On iOS keep it visible until user navigates; optional Done/Cancel could be added if needed
        />
      )}

         <InputField
        style={driverDetailStyles.textField}
        value={alternatePhone}
        label={t('alternate_phone_number')}
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
      {isEdit ? <></> :<TouchableOpacity
        style={driverDetailStyles.nextBtn}
        onPress={() => onNextPress()}>
        
        {isLoading ? <ActivityIndicator size="small" color={Colors.white} /> :<Text style={driverDetailStyles.nextTxt}>{t('next')}</Text> }
      </TouchableOpacity>}
      
    
      </View>
      </ScrollView>
      {showLocationModal && <LocationRequestModal />}
      </View>
  );
};

export default DriverEntry;
