/* eslint-disable react/no-children-prop */
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';

import {colors, Fonts} from '../constants/constants';

import {commonStyles} from '../styles/commonStyles';
import StatusModal from './DriverStatusModal/StatusModal';

import Bell from '../assets/image/svgIcons/bell.svg';
import Gps from '../assets/image/svgIcons/gps.svg';
import Navigation from '../assets/image/svgIcons/navigation.svg';
import TotalHours from '../assets/image/svgIcons/totalHours.svg';
import TotalEarnings from '../assets/image/svgIcons/totalEarnings.svg';
import TotalDistance from '../assets/image/svgIcons/totalDistance.svg';
import TotalTrips from '../assets/image/svgIcons/totalTrips.svg';
import SideDrawer from './Drawer/SideDrawer';

const HomeHeader = () => {
  const [summaryModal, setSummaryModal] = useState(false);

  const summaryData = [
    {
      id: 1,
      name: 'Total Trips',
      value: '5',
      icon: <TotalTrips />,
    },
    {
      id: 2,
      name: 'Total Distance',
      value: '40',
      icon: <TotalDistance />,
    },
    {
      id: 3,
      name: 'Total Earnings',
      value: '100',
      icon: <TotalEarnings />,
    },
    {
      id: 4,
      name: 'Total Hours',
      value: '06:30',
      icon: <TotalHours />,
    },
  ];

  const renderSummaryModal = () => {
    return (
      <StatusModal
        isVisible={summaryModal}
        animationType="fade"
        onClose={() => {
          setSummaryModal(false);
        }}
        additionalContainerStyles={{alignItems: ''}}
        onBackDropPress={()=>setSummaryModal(false)}
        children={
          <View>
            <TouchableOpacity
              style={[headerStyles.amntBtn, {position: 'relative'}]}
              onPress={() => setSummaryModal(true)}>
              <Text style={headerStyles.amntBtnTxt}>
                <Text style={{color: colors.yellow}}>₹</Text>10.
                <Text style={{fontSize: 10}}>00</Text>
              </Text>
            </TouchableOpacity>
            <Text style={headerStyles.summaryTxt}>Today Summary</Text>
            <View style={headerStyles.summaryContainer}>
              {summaryData.map(item => {
                return (
                  <View key={item.id} style={headerStyles.summaryCard}>
                    {item.icon}
                    <Text style={headerStyles.valueTxt}>{item.value}</Text>
                    <Text style={headerStyles.nameTxt}>{item.name}</Text>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity onPress={()=>setSummaryModal(false)}>
              <Text style={headerStyles.viewDetail}>View Detailed</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <>
      <View style={headerStyles.container}>
         <SideDrawer/>
        <TouchableOpacity
          style={headerStyles.amntBtn}
          onPress={() => setSummaryModal(true)}>
          <Text style={headerStyles.amntBtnTxt}>
            <Text style={{color: colors.yellow}}>₹</Text>10.
            <Text style={{fontSize: 10}}>00</Text>
          </Text>
        </TouchableOpacity>
        <View style={headerStyles.mapIconContainer}>
          <TouchableOpacity style={headerStyles.NotificationBtn}>
            <Bell />
          </TouchableOpacity>
          <TouchableOpacity style={headerStyles.NotificationBtn}>
            <Gps />
          </TouchableOpacity>
          <TouchableOpacity style={headerStyles.NotificationBtn}>
            <Navigation />
          </TouchableOpacity>
        </View>
      </View>
      {renderSummaryModal()}
    </>
  );
};

export default HomeHeader;

const headerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    alignSelf: 'center',
  },
  amntBtn: {
    alignSelf: 'center',
    position: 'absolute',
    paddingVertical: 2,
    paddingHorizontal: 20,
    backgroundColor: colors.black,
    borderRadius: 30,
    marginTop: 15,
  },
  amntBtnTxt: {
    fontFamily: Fonts.light,
    color: colors.white,
    fontSize: 20,
  },
  mapIconContainer: {
    position: 'absolute',
    alignSelf: 'flex-end',
    gap: 10,
    top:10,
    right:10
  },
  NotificationBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 50,
    ...commonStyles.shadow,
  },
  summaryTxt: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black,
    marginTop: 10,
    textAlign: 'center',
  },
  summaryContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.white_dirt,
    alignSelf: 'center',
    flexWrap: 'wrap',
    marginTop: 15,
    rowGap: 1,
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: colors.white,
    width: '49.7%',
    paddingVertical: 10,
    gap: 5,
    paddingLeft: 10,
  },
  valueTxt: {
    fontFamily: Fonts.semi_bold,
    fontSize: 24,
    color: colors.black,
  },
  nameTxt: {
    fontFamily: Fonts.light,
    fontSize: 16,
    color: colors.black,
  },
  viewDetail: {
    textAlign: 'center',
    top: 10,
    color: colors.skyBlue,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
});
