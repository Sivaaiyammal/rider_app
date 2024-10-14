import {StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import NavBar from '../../components/TopNavBar/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import {serviceStyles} from '../../styles/serviceStyles';
import { colors } from '../../constants/constants';

const DutyPreference = () => {
  const {goBack} = useStackScreenStore();

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const _renderSwitch = () => {
    return (
        <Switch
        trackColor={{false: '#767577', true: colors.black}}
        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    )
  }

  return (
    <View style={serviceStyles.screen}>
      <NavBar onBackPress={() => goBack()} title={'Duty Preference'} withBg />
      <View style={serviceStyles.areaListcontainer}>
        <View style={serviceStyles.serviceTypeBtn}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <Text style={serviceStyles.dutyPrefernceTxt}>SUV</Text>
          </View>
          {_renderSwitch()}
        </View>
        <View style={serviceStyles.serviceTypeBtn}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <Text style={serviceStyles.dutyPrefernceTxt}>Sedan</Text>
          </View>
         {_renderSwitch()}
        </View>
      </View>
    </View>
  );
};

export default DutyPreference;
