import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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

const DriverEntry = () => {
  const navigation = useNavigation();
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState(genderData[0]);

  const onNextPress = () => {
    navigation.navigate('DocumentsListScreen');
  };

  return (
    <View>
      <InputField
        style={styles.textField}
        value={value}
        label="Full Name"
        // errorText={error}
        onChangeText={text => setValue(text)}
        icon={<UserName />}
      />
      <View style={styles.GenderContainer}>
        {genderData.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.GenderBtn,
              {
                backgroundColor:
                  item.id === selected.id ? colors.white : colors.grey,
                borderColor:
                  item.id === selected.id ? colors.yellow : colors.grey,
              },
            ]}
            onPress={() => setSelected(item)}>
            {item.icon}
            <Text style={styles.GenderTxt}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <InputField
        style={styles.textField}
        value={value}
        label="Phone Number"
        // errorText={error}
        onChangeText={text => setValue(text)}
        icon={<Phone />}
      />
      <InputField
        style={styles.textField}
        value={value}
        label="Aadhar ID Number"
        // errorText={error}
        onChangeText={text => setValue(text)}
        icon={<Pan />}
      />
      <InputField
        style={styles.textField}
        value={value}
        label="PAN Number (Optional)"
        // errorText={error}
        onChangeText={text => setValue(text)}
        icon={<Pan />}
      />
      <InputField
        style={styles.textField}
        value={value}
        label="License Number"
        // errorText={error}
        onChangeText={text => setValue(text)}
        icon={<License />}
      />
      <TouchableOpacity style={styles.nextBtn} onPress={() => onNextPress()}>
        <Text style={styles.nextTxt}>Next</Text>
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
  GenderTxt: {
    fontFamily: Fonts.regular,
    color: colors.black,
    fontSize: 16,
  },
  nextBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.black,
    paddingVertical: 5,
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  nextTxt: {
    color: colors.white,
    fontFamily: Fonts.regular,
  },
});
