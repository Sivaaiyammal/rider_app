import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import InputField from '../../components/InputField';

import UserName from '../../assets/image/inputs/name.svg';
import Phone from '../../assets/image/inputs/phone.svg';
import Pan from '../../assets/image/inputs/pan.svg';
import License from '../../assets/image/inputs/license.svg';
import {vehicleList} from '../../constants/JsonData';
import {colors, Fonts} from '../../constants/constants';
import TickYellow from '../../assets/image/svgIcons/tickYellow.svg'
import { driverDetailStyles } from '../../styles/DriverDetailsUpload';

const DriverEntry = () => {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState(vehicleList[0]);

  const [regNum, setRegNum] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModal, setVehicleModal]= useState('');
  const [manufactureYear, setManufactureYear] = useState('')

  const [regNumErr, setRegNumErr] = useState('');
  const [vehicleMakeErr, setVehicleMakeErr] = useState('');
  const [vehicleModalErr, setVehicleModalErr]= useState('');

  const onNextPress = () => {
    if (regNum.length === 0) {
      setRegNumErr('Please Enter Registration Number')
    } else if (vehicleMake.length === 0) {
      setVehicleMakeErr('Please Enter Vehicle Make')
    } else if (vehicleModal.length === 0) {
      setVehicleModalErr('please Enter Vehicle Modal')
    } else {
      const payload = {
        registrationNumber : regNum,
        vehicleMake: vehicleMake,
        vehicleModal: vehicleModal,
        manufactureYear: manufactureYear,
      }
      console.log('hari-->>playload-->>', payload)
    }
  };

  return (
    <View>
      <>
      <Text style={[styles.vehicleName,{marginBottom:10}]}>Vehicle Type</Text>
      <View style={styles.vehileList}>
        {vehicleList.map((item)=> {
          return (
            <TouchableOpacity onPress={()=>setSelected(item)} key={item.id} style={[styles.vehileListCard,{
             borderColor : selected.id === item.id ? colors.yellow : colors.grey
            }]}>
              <View style={{gap:5}}>
              {item.image}
              <Text style={styles.vehicleName}>{item.name}</Text>
              </View>
              {selected.id === item.id && <TickYellow />}
            </TouchableOpacity>
          )
        })}
      </View>
      </>
      <InputField
        style={styles.textField}
        value={regNum}
        label="Vehicle Registration Number"
        errorText={regNum.length === 0 ? regNumErr : null}
        onChangeText={text => setRegNum(text)}
        icon={<UserName />}
      />
      <InputField
        style={styles.textField}
        value={vehicleMake}
        label="Vehicle Make"
        errorText={vehicleMake.length === 0 ? vehicleMakeErr : null}
        onChangeText={text => setVehicleMake(text)}
        icon={<Phone />}
      />
      <InputField
        style={styles.textField}
        value={vehicleModal}
        label="Vehicle Model"
        errorText={vehicleModal.length ===0 ? vehicleModalErr : null}
        onChangeText={text => setVehicleModal(text)}
        icon={<Pan />}
      />
      <InputField
        style={styles.textField}
        value={value}
        label="Manufacturing Year"
        // errorText={error}
        onChangeText={text => setValue(text)}
        icon={<Pan />}
      />
      <InputField
        style={styles.textField}
        value={value}
        label="Vehicle Color"
        // errorText={error}
        onChangeText={text => setValue(text)}
        icon={<License />}
      />
        <TouchableOpacity
        style={driverDetailStyles.nextBtn}
        onPress={() => onNextPress()}>
        <Text style={driverDetailStyles.nextTxt}>Next</Text>
        <AntDesign name="arrowright" color={colors.white} size={16} />
      </TouchableOpacity>
    </View>
  );
};

export default DriverEntry;

const styles = StyleSheet.create({
  GenderContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  GenderBtn: {
    width: '48%',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  GenderTxt:{
    fontFamily:Fonts.regular,
    color:colors.black,
    fontSize:16
  },
  vehileList:{
    flexDirection:'row',
    flexWrap:'wrap',
    gap:15,
    alignItems:'center',
    justifyContent:'space-between'
  },
  vehileListCard:{
    backgroundColor:colors.white_dirt,
    width:'45%',
    height:90,
    paddingLeft:10,
    borderWidth:1,
    borderRadius:8,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingRight:10
  },
  vehicleName:{
    fontFamily:Fonts.regular,
    fontSize:16,
    color:colors.black
  }
});
