import {StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import NavBar from '../../components/TopNavBar/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import {serviceStyles, tripStyles} from '../../styles/serviceStyles';
import Calendar from '../../assets/image/svgIcons/calendar.svg';
import {colors} from '../../constants/constants';
import StartLocation from '../../assets/image/svgIcons/startLocation.svg'
import EndLocation from '../../assets/image/svgIcons/endLocation.svg'

const DutyPreference = () => {
  const {goBack} = useStackScreenStore();

  const filterData = [
    {
      id: 1,
      name: 'Today',
    },
    {
      id: 2,
      name: 'Tomorrow',
    },
    {
      id: 3,
      name: 'This Week',
    },
    {
      id: 4,
      name: 'calendar',
      icon: <Calendar />,
    },
  ];

  const filterSelect = item => {
    console.log('hari-->>item-->>', item);
  };

  return (
    <View style={serviceStyles.screen}>
      <NavBar onBackPress={() => goBack()} title={'Upcoming Trips'} withBg />
      <View style={tripStyles.filterContainer}>
        {filterData.map(item => {
          return (
            <TouchableOpacity
              onPress={() => filterSelect(item)}
              key={item.id}
              style={tripStyles.FilterBtn}>
              {item.id === 4 ? (
                item.icon
              ) : (
                <Text style={tripStyles.FilterBtnTxt}>{item.name}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={tripStyles.listContainer}>
        <View style={tripStyles.tripCard}>
          <View style={tripStyles.detailsCard}>
            <View>
              <Text style={tripStyles.detailsTitle}>Start Date & Time</Text>
              <Text style={[tripStyles.detailsText, {color: colors.skyBlue}]}>
                Today, 03:00 PM
              </Text>
            </View>
            <View>
              <Text style={tripStyles.detailsTitle}>Distance</Text>
              <Text style={tripStyles.detailsText}>12 Km</Text>
            </View>
            <View>
              <Text style={tripStyles.detailsTitle}>Est. Amount</Text>
              <Text style={[tripStyles.detailsText, {color: colors.green}]}>
                ₹100.00
              </Text>
            </View>
          </View>
          <View style={tripStyles.addressCard}>
            <View style={tripStyles.startLocation}>
              <View style={tripStyles.startLocationIcon}>
              <StartLocation />
              </View>
              <View style={tripStyles.startLocationNameContainer}>
              <Text style={tripStyles.startLocationText}>Start Location</Text>
              <Text style={tripStyles.startLocationName}>7675 Hillcrest St. Fairport, NY 14450</Text>
              {/* <View>
              if waypoints add here
              </View> */}
              </View>
              
            </View>
            <View style={tripStyles.endLocation}>
              <View style={tripStyles.EndLocationIcon}>
              <EndLocation />
              </View>
              <View style={tripStyles.startLocationNameContainer}>
              <Text style={tripStyles.startLocationText}>End Location</Text>
              <Text style={tripStyles.startLocationName}>70 La Sierra St. Massapequa, NY 11758</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DutyPreference;
