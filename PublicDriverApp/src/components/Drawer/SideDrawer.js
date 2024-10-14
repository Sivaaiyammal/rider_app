import React, {useState, useRef, useCallback} from 'react';
import {
  Text,
  View,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {drawerStyles} from '../../styles/DrawerStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DrawerOpen from '../../assets/image/svgIcons/drawerOpen.svg';
import {width} from '../../utils/Utils';
import {colors} from '../../constants/constants';
import {commonStyles} from '../../styles/commonStyles';

import Account from '../../assets/image/drawerIcons/accountblue.svg';
import BasicDetails from '../../assets/image/drawerIcons/basicDetails.svg';
import BackAccount from '../../assets/image/drawerIcons/accntDetails.svg';
import Trip from '../../assets/image/drawerIcons/trip.svg';
import UpComingTrips from '../../assets/image/drawerIcons/upcomingTrips.svg';
import TripHistory from '../../assets/image/drawerIcons/tripHistory.svg';
import Finance from '../../assets/image/drawerIcons/finance.svg';
import Earnings from '../../assets/image/drawerIcons/earnings.svg';
import Balance from '../../assets/image/drawerIcons/balance.svg';
import Language from '../../assets/image/drawerIcons/language.svg';
import ContactUs from '../../assets/image/drawerIcons/contact.svg';
import Other from '../../assets/image/drawerIcons/other.svg';

const SideDrawer = () => {
  const bounceValue = useRef(new Animated.Value(-width)).current;
  const [isHidden, setIsHidden] = useState(true);

  const _toggleSubview = useCallback(() => {
    let toValue = -width;
    if (isHidden) {
      toValue = 0;
    }
    Animated.spring(bounceValue, {
      toValue: toValue,
      velocity: 3,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsHidden(!isHidden);
  }, [isHidden]);

  return (
    <View style={drawerStyles.container}>
      <TouchableOpacity
        style={drawerStyles.drawerOpenBtn}
        onPress={_toggleSubview}>
        <DrawerOpen />
      </TouchableOpacity>
      <Animated.View
        style={[
          drawerStyles.subView,
          {transform: [{translateX: bounceValue}]},
        ]}>
        <View style={drawerStyles.subContainer}>
          <View style={drawerStyles.profileContainer}>
            <View style={drawerStyles.profileImageContainer}></View>
            <View style={drawerStyles.profileNameContainer}>
              <Text style={drawerStyles.nameText}>Ezio Auditore</Text>
              <Text style={drawerStyles.numberText}>NOTDR12341</Text>
            </View>
          </View>
          <View>
            <ScrollView contentContainerStyle={{paddingBottom: 200}}>
              {/* Account  */}
              <View style={drawerStyles.contentConatiner}>
                <View style={commonStyles.rowSpaceBetween}>
                  <Text style={drawerStyles.drawerTitle}>Account</Text>
                  <Account />
                </View>
                <TouchableOpacity style={commonStyles.rowSpaceBetween}>
                  <View style={drawerStyles.titleRow}>
                    <BasicDetails />
                    <Text style={drawerStyles.titleTxt}>Basic Details</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity>
                  <View style={drawerStyles.titleRow}>
                    <BackAccount />
                    <Text style={drawerStyles.titleTxt}>Bank Account</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Trips  */}
              <View style={drawerStyles.contentConatiner}>
                <View style={commonStyles.rowSpaceBetween}>
                  <Text style={drawerStyles.drawerTitle}>Trips</Text>
                  <Trip />
                </View>
                <TouchableOpacity style={commonStyles.rowSpaceBetween}>
                  <View style={drawerStyles.titleRow}>
                    <UpComingTrips />
                    <Text style={drawerStyles.titleTxt}>Upcoming Trips</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity>
                  <View style={drawerStyles.titleRow}>
                    <TripHistory />
                    <Text style={drawerStyles.titleTxt}>Trip History</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Finance  */}
              <View style={drawerStyles.contentConatiner}>
                <View style={commonStyles.rowSpaceBetween}>
                  <Text style={drawerStyles.drawerTitle}>Finance</Text>
                  <Finance />
                </View>
                <TouchableOpacity style={commonStyles.rowSpaceBetween}>
                  <View style={drawerStyles.titleRow}>
                    <Earnings />
                    <Text style={drawerStyles.titleTxt}>Earnings</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity>
                  <View style={drawerStyles.titleRow}>
                    <Balance />
                    <Text style={drawerStyles.titleTxt}>Balance Due</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Langugage  */}
              <View style={drawerStyles.contentConatiner}>
                <TouchableOpacity>
                  <View style={[drawerStyles.titleRow, {marginTop: 0}]}>
                    <Language />
                    <Text style={drawerStyles.titleTxt}>Language</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* contact us  */}
              <View style={drawerStyles.contentConatiner}>
                <TouchableOpacity>
                  <View style={[drawerStyles.titleRow, {marginTop: 0}]}>
                    <ContactUs />
                    <Text style={drawerStyles.titleTxt}>Contact Us</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* other  */}
              <View style={drawerStyles.contentConatiner}>
                <TouchableOpacity>
                  <View style={[drawerStyles.titleRow, {marginTop: 0}]}>
                    <Other />
                    <Text style={drawerStyles.titleTxt}>other</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
        <TouchableOpacity
          style={drawerStyles.iconClose}
          onPress={_toggleSubview}>
          <Ionicons name="close-sharp" color={colors.black} size={25} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
export default SideDrawer;
