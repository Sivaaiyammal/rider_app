import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors, Fonts} from '../../constants/constants';
import HomeHeader from '../../components/HomeHeader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Area from '../../assets/image/svgIcons/area.svg';
import ArrowRight from '../../assets/image/svgIcons/arrowRight.svg';
import GoHome from '../../assets/image/svgIcons/goHome.svg';
import {serviceStyles} from '../../styles/serviceStyles';
import {useStackScreenStore} from '../../store/useStackScreenStore';

const ServiceScreen = () => {
  const {setStackScreen} = useStackScreenStore();

  return (
    <View style={serviceStyles.screen}>
      <HomeHeader screen={'Services'} />
      <View style={serviceStyles.container}>
        <TouchableOpacity
          style={serviceStyles.serviceTypeBtn}
          onPress={() => setStackScreen('AreaPreference')}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <Area />
            <Text style={serviceStyles.serviceTypeBtnTxt}>Area Preference</Text>
          </View>
          <ArrowRight />
        </TouchableOpacity>
        <TouchableOpacity style={serviceStyles.serviceTypeBtn}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <GoHome />
            <Text style={serviceStyles.serviceTypeBtnTxt}>
              Last Destination Preference {'\n'} (Go Home)
            </Text>
          </View>
          <ArrowRight />
        </TouchableOpacity>
        <TouchableOpacity style={serviceStyles.serviceTypeBtn} onPress={() => setStackScreen('DutyPreference')}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <MaterialCommunityIcons
              name="bag-personal"
              color={colors.black}
              size={16}
            />
            <Text style={serviceStyles.serviceTypeBtnTxt}>Duty Preference</Text>
          </View>
          <ArrowRight />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ServiceScreen;
