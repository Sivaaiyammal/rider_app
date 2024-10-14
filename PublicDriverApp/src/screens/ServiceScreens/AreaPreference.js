import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import NavBar from '../../components/TopNavBar/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import GeofenceDrawer from '../../core/GeofenceDrawer';
import BottomSheet from '../../components/BottomSheet';
import {serviceStyles} from '../../styles/serviceStyles';
import AntDesign from 'react-native-vector-icons/AntDesign';

import Area from '../../assets/image/svgIcons/area.svg';
import Delete from '../../assets/image/svgIcons/delet.svg';
import { colors } from '../../constants/constants';

const AreaPreference = () => {
  const {goBack} = useStackScreenStore();
  return (
    <View style={{flex: 1}}>
      <NavBar onBackPress={() => goBack()} title={'Area Preference'} withBg />
      <GeofenceDrawer />
      <View
        style={serviceStyles.bottomBtnContainer}>
        <TouchableOpacity style={serviceStyles.plusBtn}>
            <AntDesign name={'plus'} color={colors.black} />
        </TouchableOpacity>
      </View>
      <BottomSheet minHeight={200}>
        <>
          <View style={serviceStyles.areaListcontainer}>
            <TouchableOpacity style={serviceStyles.serviceTypeBtn}>
              <View
                style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                <Area />
                <Text style={serviceStyles.serviceTypeBtnTxt}>
                Madison, New York
                </Text>
              </View>
              <TouchableOpacity>
                <Delete />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </>
      </BottomSheet>
    </View>
  );
};

export default AreaPreference;
