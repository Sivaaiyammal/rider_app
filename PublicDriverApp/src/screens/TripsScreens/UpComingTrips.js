import {StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import NavBar from '../../components/TopNavBar/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import {serviceStyles} from '../../styles/serviceStyles';
import { colors } from '../../constants/constants';

const DutyPreference = () => {
  const {goBack} = useStackScreenStore();

  return (
    <View style={serviceStyles.screen}>
      <NavBar onBackPress={() => goBack()} title={'Upcoming Trips'} withBg />
      
    </View>
  );
};

export default DutyPreference;
