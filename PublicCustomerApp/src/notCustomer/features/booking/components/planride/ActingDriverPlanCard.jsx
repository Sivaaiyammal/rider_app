import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Fonts, colors } from '../../../../constants/constants';
import LocationTypes from '../../types/LocationTypes.json';
import useRideBookingLocationStore from '../../store/useRideBookingLocationStore';
import useRideBookingInfo from '../../store/useRideBookingInfo';
import useConfigStore from '../../../../store/useConfigStore';
import { utils } from '../../../../utils/Utils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DashedLine from '../../../../components/Common/DashedLine';

// Maps config key → booking info store field name
const STORE_KEY_MAP = {
  accommodation: 'actingDriverAccommodation',
  food:          'actingDriverFood',
  kids:          'actingDriverKidsOnBoard',
  elderly:       'actingDriverElderlyOnBoard',
  maxSpeed:      'actingDriverMaxSpeed',
  otherRequests: 'actingDriverOtherRequests',
};

const ConfigIcon = ({ iconLib, icon, size, color }) => {
  if (iconLib === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon} size={size} color={color} />;
  if (iconLib === 'Ionicons') return <Ionicons name={icon} size={size} color={color} />;
  return <Icon name={icon} size={size} color={color} />;
};

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
  const { appConfig } = useConfigStore();

  const bookingValues = {
    actingDriverAccommodation,
    actingDriverFood,
    actingDriverKidsOnBoard,
    actingDriverElderlyOnBoard,
    actingDriverMaxSpeed,
    actingDriverOtherRequests,
  };

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
      {(appConfig?.ACTING_DRIVER_ARRANGEMENTS || []).filter(a => a.enabled).length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Driver Arrangements</Text>
          </View>
          <View style={styles.preferencesCard}>
            {(appConfig?.ACTING_DRIVER_ARRANGEMENTS || [])
              .filter(item => item.enabled)
              .map((item, idx, arr) => {
                const storeKey = STORE_KEY_MAP[item.key];
                const value = bookingValues[storeKey];
                return (
                  <React.Fragment key={item.key}>
                    <View style={styles.prefRow}>
                      <View style={styles.prefIconBox}>
                        <ConfigIcon iconLib={item.iconLib} icon={item.icon} size={22} color={themeColor.primary} />
                      </View>
                      <View style={styles.prefTextContainer}>
                        <Text style={styles.prefTitle}>{item.label}</Text>
                        {!!item.desc && <Text style={styles.prefDesc}>{item.desc}</Text>}
                      </View>
                      <Switch
                        trackColor={{ false: '#E2E8F0', true: themeColor.primary }}
                        thumbColor={'#ffffff'}
                        ios_backgroundColor="#E2E8F0"
                        onValueChange={() => togglePref(storeKey, value)}
                        value={!!value}
                      />
                    </View>
                    {idx < arr.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
          </View>
        </>
      )}

      {/* 3. Special Requirements Section */}
      {(appConfig?.ACTING_DRIVER_SPECIAL_REQUIREMENTS || []).filter(r => r.enabled).length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Requirements</Text>
          </View>
          <View style={styles.preferencesCard}>
            {(appConfig?.ACTING_DRIVER_SPECIAL_REQUIREMENTS || [])
              .filter(item => item.enabled)
              .map((item, idx, arr) => {
                const storeKey = STORE_KEY_MAP[item.key];
                const value = bookingValues[storeKey];
                const isLast = idx === arr.length - 1;
                if (item.type === 'number') {
                  return (
                    <React.Fragment key={item.key}>
                      <View style={styles.prefRow}>
                        <View style={styles.prefIconBox}>
                          <ConfigIcon iconLib={item.iconLib} icon={item.icon} size={22} color={themeColor.primary} />
                        </View>
                        <View style={styles.prefTextContainer}>
                          <Text style={styles.prefTitle}>{item.label}</Text>
                          {!!item.desc && <Text style={styles.prefDesc}>{item.desc}</Text>}
                        </View>
                        <View style={[styles.speedControl, { borderColor: themeColor.primary }]}>
                          <TouchableOpacity
                            onPress={() => updateBookingInfo({ [storeKey]: Math.max(0, Number(value || 80) - 10).toString() })}
                            style={styles.speedBtn}>
                            <Text style={[styles.speedBtnText, { color: themeColor.primary }]}>-</Text>
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.speedInput, { color: themeColor.primary }]}
                            value={value ? String(value) : '80'}
                            onChangeText={text => updateBookingInfo({ [storeKey]: text.replace(/[^0-9]/g, '') })}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          <Text style={[styles.speedUnit, { color: themeColor.primary }]}>/h</Text>
                          <TouchableOpacity
                            onPress={() => updateBookingInfo({ [storeKey]: (Number(value || 80) + 10).toString() })}
                            style={styles.speedBtn}>
                            <Text style={[styles.speedBtnText, { color: themeColor.primary }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {!isLast && <View style={styles.divider} />}
                    </React.Fragment>
                  );
                }
                if (item.type === 'text') {
                  return (
                    <React.Fragment key={item.key}>
                      <View style={styles.notesRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                          <ConfigIcon iconLib={item.iconLib} icon={item.icon} size={18} color={themeColor.primary} />
                          <Text style={[styles.prefTitle, { marginLeft: 8 }]}>{item.label}</Text>
                        </View>
                        <View style={styles.textAreaContainer}>
                          <TextInput
                            style={styles.textArea}
                            multiline={true}
                            numberOfLines={3}
                            placeholder="Type your requests or notes here..."
                            placeholderTextColor="#94A3B8"
                            value={value || ''}
                            onChangeText={text => updateBookingInfo({ [storeKey]: text })}
                            maxLength={200}
                          />
                          <Text style={styles.charCount}>{(value || '').length} / 200</Text>
                        </View>
                      </View>
                      {!isLast && <View style={styles.divider} />}
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={item.key}>
                    <View style={styles.prefRow}>
                      <View style={styles.prefIconBox}>
                        <ConfigIcon iconLib={item.iconLib} icon={item.icon} size={22} color={themeColor.primary} />
                      </View>
                      <View style={styles.prefTextContainer}>
                        <Text style={styles.prefTitle}>{item.label}</Text>
                        {!!item.desc && <Text style={styles.prefDesc}>{item.desc}</Text>}
                      </View>
                      <Switch
                        trackColor={{ false: '#E2E8F0', true: themeColor.primary }}
                        thumbColor={'#ffffff'}
                        ios_backgroundColor="#E2E8F0"
                        onValueChange={() => togglePref(storeKey, value)}
                        value={!!value}
                      />
                    </View>
                    {!isLast && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
          </View>
        </>
      )}
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
