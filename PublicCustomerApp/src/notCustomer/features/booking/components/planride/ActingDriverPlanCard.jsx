import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Fonts, colors } from '../../../../constants/constants';
import LocationTypes from '../../types/LocationTypes.json';
import useRideBookingLocationStore from '../../store/useRideBookingLocationStore';
import useRideBookingInfo from '../../store/useRideBookingInfo';
import { utils } from '../../../../utils/Utils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DashedLine from '../../../../components/Common/DashedLine';

const ActingDriverPlanCard = ({
  onLocationClick,
  onTripDetailsClick,
  themeColor = { primary: '#FF2B2B', secondary: '#D60000', accent: '#FF6B6B' },
}) => {
  const { t } = useTranslation();
  const { rideStartLocation, rideEndLocation } = useRideBookingLocationStore();
  const {
    actingDriverAccommodation,
    actingDriverFood,
    actingDriverKidsOnBoard,
    actingDriverElderlyOnBoard,
    actingDriverMaxSpeed,
    actingDriverOtherRequests,
    updateBookingInfo,
    actingDriverItinerary,
  } = useRideBookingInfo();

  const togglePref = (key, value) => {
    updateBookingInfo({ [key]: !value });
  };

  const destination = rideEndLocation ? utils.formatAddressName(rideEndLocation) : t('search_destination', 'You can add later');
  const pickup = rideStartLocation ? utils.formatAddressName(rideStartLocation) : t('search_pickup_location', 'Enter pickup location');

  const itineraryDates = actingDriverItinerary ? Object.keys(actingDriverItinerary) : [];
  const tripDetailsText = itineraryDates.length > 0 ? `${itineraryDates.length} day(s) configured` : t('add_places_date_time', 'Add places, date & time');

  return (
    <View style={styles.cardWrapper}>
      
      {/* 1. Location Cards Container */}
      <View style={styles.locationsContainer}>
        {/* Pickup Card */}
        <TouchableOpacity style={styles.locationCard} onPress={() => onLocationClick(LocationTypes.START_LOCATION)}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconItem, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="location-sharp" size={18} color="#2E7D32" />
            </View>
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.label}>{t('pickup_location_req', 'Pickup Location (Required)')}</Text>
            {rideStartLocation ? (
              <Text style={styles.address} numberOfLines={1}>{pickup}</Text>
            ) : (
              <Text style={styles.placeHolder}>{pickup}</Text>
            )}
            {!rideStartLocation && <Text style={styles.subText}>{t('find_best_drivers', "We'll find the best drivers near you")}</Text>}
          </View>
          <View style={styles.actionBtnDark}>
            <Icon name="add" size={18} color="white" />
          </View>
        </TouchableOpacity>

        {/* Drop Location Card */}
        <TouchableOpacity style={styles.locationCard} onPress={() => onLocationClick(LocationTypes.DESTINATION_LOCATION)}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconItem, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="location-sharp" size={18} color="#C62828" />
            </View>
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.label}>{t('drop_location_opt', 'Drop Location (Optional)')}</Text>
            {rideEndLocation ? (
              <Text style={styles.address} numberOfLines={1}>{destination}</Text>
            ) : (
              <Text style={styles.placeHolder}>{destination}</Text>
            )}
          </View>
          <View style={styles.actionBtnOutline}>
            <Icon name="pencil" size={16} color="#64748B" />
          </View>
        </TouchableOpacity>

        {/* Trip Details Card */}
        <TouchableOpacity style={styles.locationCard} onPress={onTripDetailsClick}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconItem, { backgroundColor: `${themeColor.primary}15` }]}>
               <Ionicons name="calendar" size={18} color={themeColor.primary} />
            </View>
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.label}>{t('trip_details_opt', 'Trip Details (Optional)')}</Text>
            <Text style={[styles.placeHolder, itineraryDates.length > 0 && { color: themeColor.primary, fontFamily: Fonts.semi_bold }]}>{tripDetailsText}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* 2. Driver Arrangements Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Driver Arrangements</Text>
      </View>
      <View style={styles.preferencesCard}>
        <View style={styles.prefRow}>
          <View style={styles.prefIconBox}>
            <Ionicons name="bed" size={22} color={themeColor.primary} />
          </View>
          <View style={styles.prefTextContainer}>
            <Text style={styles.prefTitle}>Driver Accommodation</Text>
            <Text style={styles.prefDesc}>Driver stay arrangements will be borne by the customer.</Text>
          </View>
          <Switch
            trackColor={{ false: '#E2E8F0', true: themeColor.primary }}
            thumbColor={'#ffffff'}
            ios_backgroundColor="#E2E8F0"
            onValueChange={() => togglePref('actingDriverAccommodation', actingDriverAccommodation)}
            value={actingDriverAccommodation}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.prefRow}>
          <View style={styles.prefIconBox}>
            <Ionicons name="restaurant" size={22} color={themeColor.primary} />
          </View>
          <View style={styles.prefTextContainer}>
            <Text style={styles.prefTitle}>Driver Food Allowance</Text>
            <Text style={styles.prefDesc}>Food allowance for driver</Text>
          </View>
          <Switch
            trackColor={{ false: '#E2E8F0', true: themeColor.primary }}
            thumbColor={'#ffffff'}
            ios_backgroundColor="#E2E8F0"
            onValueChange={() => togglePref('actingDriverFood', actingDriverFood)}
            value={actingDriverFood}
          />
        </View>
      </View>

      {/* 3. Special Requirements Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Special Requirements</Text>
      </View>
      <View style={styles.preferencesCard}>
        <View style={styles.prefRow}>
          <View style={styles.prefIconBox}>
            <MaterialCommunityIcons name="baby-carriage" size={22} color={themeColor.primary} />
          </View>
          <View style={styles.prefTextContainer}>
            <Text style={styles.prefTitle}>Children on Board</Text>
          </View>
          <Switch
            trackColor={{ false: '#E2E8F0', true: themeColor.primary }}
            thumbColor={'#ffffff'}
            ios_backgroundColor="#E2E8F0"
            onValueChange={() => togglePref('actingDriverKidsOnBoard', actingDriverKidsOnBoard)}
            value={actingDriverKidsOnBoard}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.prefRow}>
          <View style={styles.prefIconBox}>
            <MaterialCommunityIcons name="human-cane" size={22} color={themeColor.primary} />
          </View>
          <View style={styles.prefTextContainer}>
            <Text style={styles.prefTitle}>Elderly Passengers</Text>
          </View>
          <Switch
            trackColor={{ false: '#E2E8F0', true: themeColor.primary }}
            thumbColor={'#ffffff'}
            ios_backgroundColor="#E2E8F0"
            onValueChange={() => togglePref('actingDriverElderlyOnBoard', actingDriverElderlyOnBoard)}
            value={actingDriverElderlyOnBoard}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.prefRow}>
          <View style={styles.prefIconBox}>
            <Ionicons name="speedometer" size={22} color={themeColor.primary} />
          </View>
          <View style={styles.prefTextContainer}>
            <Text style={styles.prefTitle}>Comfort Speed</Text>
            <Text style={styles.prefDesc}>Auto speed for driver</Text>
          </View>
          <View style={[styles.speedControl, { borderColor: themeColor.primary }]}>
            <TouchableOpacity
              onPress={() => {
                 const val = Number(actingDriverMaxSpeed || 80);
                 updateBookingInfo({ actingDriverMaxSpeed: Math.max(0, val - 10).toString() });
              }}
              style={styles.speedBtn}
            >
              <Text style={[styles.speedBtnText, { color: themeColor.primary }]}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.speedInput, { color: themeColor.primary }]}
              value={actingDriverMaxSpeed ? String(actingDriverMaxSpeed) : '80'}
              onChangeText={(text) => updateBookingInfo({ actingDriverMaxSpeed: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={[styles.speedUnit, { color: themeColor.primary }]}>/h</Text>
            <TouchableOpacity
              onPress={() => {
                 const val = Number(actingDriverMaxSpeed || 80);
                 updateBookingInfo({ actingDriverMaxSpeed: (val + 10).toString() });
              }}
              style={styles.speedBtn}
            >
              <Text style={[styles.speedBtnText, { color: themeColor.primary }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.notesRow}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
             <Ionicons name="document-text" size={18} color={themeColor.primary} />
             <Text style={[styles.prefTitle, {marginLeft: 8}]}>Custom Request / Notes</Text>
          </View>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              multiline={true}
              numberOfLines={3}
              placeholder="Type your requests or notes here..."
              placeholderTextColor="#94A3B8"
              value={actingDriverOtherRequests || ''}
              onChangeText={(text) => updateBookingInfo({ actingDriverOtherRequests: text })}
              maxLength={200}
            />
            <Text style={styles.charCount}>{(actingDriverOtherRequests || '').length} / 200</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

ActingDriverPlanCard.propTypes = {
  onLocationClick: PropTypes.func.isRequired,
  onTripDetailsClick: PropTypes.func.isRequired,
  themeColor: PropTypes.object,
};

const styles = StyleSheet.create({
  cardWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 24,
  },
  locationsContainer: {
    gap: 12,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    marginRight: 12,
    alignItems: 'center',
  },
  iconItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#334155',
    fontFamily: Fonts.medium,
  },
  placeHolder: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: Fonts.regular,
  },
  subText: {
    fontSize: 12,
    color: '#2E7D32',
    fontFamily: Fonts.semi_bold,
    marginTop: 4,
  },
  actionBtnDark: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#1E293B',
  },
  preferencesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  prefIconBox: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prefTextContainer: {
    flex: 1,
  },
  prefTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#1E293B',
  },
  prefDesc: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  speedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  speedBtn: {
    paddingHorizontal: 8,
  },
  speedBtnText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  speedInput: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    padding: 0,
    minWidth: 26,
    textAlign: 'center',
  },
  speedUnit: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    marginRight: 4,
  },
  notesRow: {
    paddingVertical: 10,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#1E293B',
    padding: 0,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 8,
  },
});

export default ActingDriverPlanCard;
