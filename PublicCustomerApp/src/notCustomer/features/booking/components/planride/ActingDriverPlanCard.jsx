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
  onItineraryClick,
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
    bookingTab,
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
      <View style={styles.newLocationsContainer}>
        
        {/* Pickup Section */}
        <TouchableOpacity style={styles.newPickupSection} onPress={() => onLocationClick(LocationTypes.START_LOCATION)}>
          <View style={styles.newRowHeader}>
            <Ionicons name="navigate" size={18} color="#16a34a" style={{marginRight: 6, transform: [{rotate: '45deg'}]}} />
            <Text style={styles.newLabelBold}>{t('pickup_location_req', 'Pickup Location (Required)')}</Text>
          </View>
          {rideStartLocation ? (
            <View style={styles.newAddressBox}>
              <Text style={styles.newAddressText} numberOfLines={2}>{pickup}</Text>
            </View>
          ) : (
            <View style={styles.newDashedBox}>
              <View style={styles.newBigAddBtn}>
                <Ionicons name="add" size={32} color="#FFF" />
              </View>
              <View style={styles.newShieldRow}>
                <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
                <Text style={styles.newShieldText}>{t('find_best_drivers', "We'll find the best drivers near you")}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.newDivider} />

        {/* Drop Location Row */}
        <TouchableOpacity style={styles.newRowItem} onPress={() => onLocationClick(LocationTypes.DESTINATION_LOCATION)}>
          <Ionicons name="location-outline" size={22} color="#1e293b" />
          <View style={styles.newRowTextContainer}>
            <Text style={styles.newLabelBold}>{t('drop_location_opt', 'Drop Location (Optional)')}</Text>
            {rideEndLocation ? (
               <Text style={styles.newAddressText} numberOfLines={1}>{destination}</Text>
            ) : (
               <Text style={styles.newSubText}>Add now or decide later</Text>
            )}
          </View>
          <Ionicons name="add" size={24} color="#1e293b" />
        </TouchableOpacity>

        <View style={styles.newDivider} />

        {/* Trip Itinerary Row */}
        <TouchableOpacity style={styles.newRowItem} onPress={onItineraryClick}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#1e293b" />
          <View style={styles.newRowTextContainer}>
            <Text style={styles.newLabelBold}>{t('trip_details_opt', 'Trip Itinerary (Optional)')}</Text>
            {itineraryDates.length > 0 ? (
               <Text style={styles.newAddressText} numberOfLines={1}>{tripDetailsText}</Text>
            ) : (
               <Text style={styles.newSubText}>Add places, dates & timings</Text>
            )}
          </View>
          <Ionicons name="add" size={24} color="#1e293b" />
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
  onItineraryClick: PropTypes.func.isRequired,
  themeColor: PropTypes.object,
};

const styles = StyleSheet.create({
  cardWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 24,
  },
  newLocationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  newPickupSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  newRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  newLabelBold: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#1e293b',
  },
  newDashedBox: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    width: '100%',
  },
  newAddressBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    width: '100%',
  },
  newBigAddBtn: {
    backgroundColor: '#16a34a',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  newShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newShieldText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#1e293b',
    marginLeft: 4,
  },
  newDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  newRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  newRowTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  newAddressText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: '#334155',
  },
  newSubText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
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
