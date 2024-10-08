import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import InputField from '../../components/InputField';
import AntDesign from 'react-native-vector-icons/AntDesign';

import UserName from '../../assets/image/inputs/name.svg';
import Phone from '../../assets/image/inputs/phone.svg';
import Pan from '../../assets/image/inputs/pan.svg';
import License from '../../assets/image/inputs/license.svg';
import {genderData} from '../../constants/JsonData';
import {colors, Fonts} from '../../constants/constants';
import {useNavigation} from '@react-navigation/native';
import {driverDetailStyles} from '../../styles/DriverDetailsUpload';

const DriverEntry = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadharID, setAadharId] = useState('');
  const [panNum, setPanNum] = useState('');
  const [licenseNum, setLicenseNum] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [aadharIDErr, setAadharIdErr] = useState('');
  const [licenseNumErr, setLicenseNumErr] = useState('');
  const [selected, setSelected] = useState(genderData[0]);

  const onNextPress = () => {
    if (name.length === 0) {
      setNameErr('Please Enter Name')
    } else if (phone.length === 0) {
       setPhoneErr('Please Enter Phone')
    } else if (aadharID.length === 0) {
      setAadharIdErr('please Enter Aadhar ID Number')
    } else if (licenseNum.length === 0) {
      setLicenseNumErr('Please Enter License Number')
    } else {
      const payload = {
        name : name,
        phoneNumber: phone,
        aadharId: aadharID,
        panNum: panNum,
        licenseNum: licenseNum,
      }
      console.log('hari-->>playload-->>', payload)
    }
  };

  return (
    <>
      <InputField
        style={driverDetailStyles.textField}
        value={name}
        label="Full Name"
        errorText={name.length === 0 ?  nameErr : null}
        onChangeText={text => setName(text)}
        icon={<UserName />}
      />
      <View style={driverDetailStyles.GenderContainer}>
        {genderData.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              driverDetailStyles.GenderBtn,
              {
                backgroundColor:
                  item.id === selected.id ? colors.white : colors.grey,
                borderColor:
                  item.id === selected.id ? colors.yellow : colors.grey,
              },
            ]}
            onPress={() => setSelected(item)}>
            {item.icon}
            <Text style={driverDetailStyles.GenderTxt}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <InputField
        style={driverDetailStyles.textField}
        value={phone}
        label="Phone Number"
        errorText={phone.length === 0 ? phoneErr : null}
        onChangeText={text => setPhone(text)}
        icon={<Phone />}
        keyboardType="number-pad"
      />
      <InputField
        style={driverDetailStyles.textField}
        value={aadharID}
        label="Aadhar ID Number"
        errorText={aadharID.length ===0 ?  aadharIDErr : null }
        onChangeText={text => setAadharId(text)}
        icon={<Pan />}
        keyboardType="number-pad"
      />
      <InputField
        style={driverDetailStyles.textField}
        value={panNum}
        label="PAN Number (Optional)"
        onChangeText={text => setPanNum(text)}
        icon={<Pan />}
      />
      <InputField
        style={driverDetailStyles.textField}
        value={licenseNum}
        label="License Number"
        errorText={licenseNum.length === 0 ? licenseNumErr : null}
        onChangeText={text => setLicenseNum(text)}
        icon={<License />}
      />
      <TouchableOpacity
        style={driverDetailStyles.nextBtn}
        onPress={() => onNextPress()}>
        <Text style={driverDetailStyles.nextTxt}>Next</Text>
        <AntDesign name="arrowright" color={colors.white} size={16} />
      </TouchableOpacity>
    </>
  );
};

export default DriverEntry;
