import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Fonts } from '../../../../constants/constants';
import { utils } from '../../../../utils/Utils';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RideLocationPlanSetBox = ({
  location,
  onLocationClick,
}) => {
  const { t } = useTranslation();
  const address = location ? (typeof location === 'string' ? location : utils.formatAddressName(location)) : '';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={onLocationClick}
        activeOpacity={0.7}
      >
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Icon name="place" size={16} color="#000000ff" />
          </View>
        </View>

        {/* Location Text / Selector */}
        <View style={styles.locationContainer}>
          <Text style={styles.label}>{t('daily_destination', 'Destination Location')}</Text>
          {location ? (
            <Text style={styles.address} numberOfLines={1}>{address}</Text>
          ) : (
            <Text style={styles.placeHolder}>{t('select_location', 'Select Location')}</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

RideLocationPlanSetBox.propTypes = {
  location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onLocationClick: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    marginVertical: 8,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    color: '#212121',
    fontFamily: Fonts.medium,
    maxWidth: '95%',
  },
  placeHolder: {
    fontSize: 14,
    color: '#A0A0A0',
    fontFamily: Fonts.medium,
  },
});

export default RideLocationPlanSetBox;
