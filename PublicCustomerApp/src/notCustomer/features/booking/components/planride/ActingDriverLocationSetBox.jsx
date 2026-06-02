import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Fonts } from '../../../../constants/constants';
import LocationTypes from '../../types/LocationTypes.json';

import useRideBookingLocationStore from '../../store/useRideBookingLocationStore';
import { utils } from '../../../../utils/Utils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DashedLine from '../../../../components/Common/DashedLine';

const ActingDriverLocationSetBox = ({
  onLocationClick,
  onTripDetailsClick,
  themeColor = '#EAB308', // Default to yellow/gold
}) => {
  const { t } = useTranslation();
  const { rideStartLocation, rideEndLocation, rideWayPoints } = useRideBookingLocationStore();

  const destination = rideEndLocation ? utils.formatAddressName(rideEndLocation) : t('search_destination', 'You can add later');
  const pickup = rideStartLocation ? utils.formatAddressName(rideStartLocation) : t('search_pickup_location', 'Enter pickup location');

  return (
    <View style={styles.container}>
      {/* Pickup Row */}
      <TouchableOpacity style={styles.row} onPress={() => onLocationClick(LocationTypes.START_LOCATION)}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconItem, { backgroundColor: '#4caf5030' }]}>
            <View style={[styles.iconSubItem, { backgroundColor: '#4caf50' }]} />
          </View>
          <DashedLine color="#E0E0E0" strokeWidth={1} dashLength={3} dashGap={3} vertical={true} style={styles.dashLine} />
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.label}>{t('pickup_location_req', 'Pickup Location (Required)')}</Text>
          {rideStartLocation ? (
            <Text style={styles.address} numberOfLines={1}>{pickup}</Text>
          ) : (
            <Text style={styles.placeHolder}>{pickup}</Text>
          )}
          {!rideStartLocation && <Text style={styles.subText}>{t('find_best_drivers', "We'll find the best drivers near you")}</Text>}
        </View>
        <View style={styles.actionIconBg}>
          <Icon name="add" size={16} color="white" />
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Drop Location Row */}
      <TouchableOpacity style={styles.row} onPress={() => onLocationClick(LocationTypes.DESTINATION_LOCATION)}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconItem, { backgroundColor: '#F4433630' }]}>
            <View style={[styles.iconSubItem, { backgroundColor: '#F44336' }]} />
          </View>
          <DashedLine color="#E0E0E0" strokeWidth={1} dashLength={3} dashGap={3} vertical={true} style={styles.dashLine} />
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.label}>{t('drop_location_opt', 'Drop Location (Optional)')}</Text>
          {rideEndLocation ? (
            <Text style={styles.address} numberOfLines={1}>{destination}</Text>
          ) : (
            <Text style={styles.placeHolder}>{destination}</Text>
          )}
        </View>
        <View style={[styles.actionIconBg, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E0E0E0' }]}>
          <Icon name="edit" size={14} color="#666" />
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Trip Details Row */}
      <TouchableOpacity style={styles.row} onPress={onTripDetailsClick}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconItem, { backgroundColor: `${themeColor}30` }]}>
             <Ionicons name="calendar-outline" size={14} color={themeColor} />
          </View>
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.label}>{t('trip_details_opt', 'Trip Details (Optional)')}</Text>
          <Text style={styles.placeHolder}>{t('add_places_date_time', 'Add places, date & time')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

ActingDriverLocationSetBox.propTypes = {
  onLocationClick: PropTypes.func.isRequired,
  onTripDetailsClick: PropTypes.func.isRequired,
  themeColor: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconItem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  iconSubItem: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dashLine: {
    position: 'absolute',
    top: 28,
    bottom: -30,
    left: 14,
    zIndex: 1,
  },
  locationContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.semi_bold,
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    color: '#222',
    fontFamily: Fonts.medium,
  },
  placeHolder: {
    fontSize: 14,
    color: '#888',
    fontFamily: Fonts.regular,
  },
  subText: {
    fontSize: 11,
    color: '#4caf50',
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  actionIconBg: {
    backgroundColor: '#222',
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 42,
  },
});

export default ActingDriverLocationSetBox;
