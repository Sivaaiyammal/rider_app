import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, Fonts } from '../../common/constants/constants';

const Section = ({ icon, title, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon} size={16} color={Colors.periwinkle} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Row = ({ label, value, icon }) => {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <View style={styles.row}>
      {icon ? <MaterialCommunityIcons name={icon} size={13} color="#888" style={styles.rowIcon} /> : null}
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  );
};

const Badge = ({ label, active, icon }) => {
  if (!active) return null;
  return (
    <View style={styles.badge}>
      {icon ? <MaterialCommunityIcons name={icon} size={12} color={Colors.periwinkle} /> : null}
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

const ActingDriverTripInfo = ({ trip }) => {
  const [expanded, setExpanded] = useState(false);

  if (!trip) return null;

  const {
    vehicleBrand,
    vehicleModel,
    vehicleNumber,
    passangerVehicleType,
    actingDriverHours,
    tripType,
    actingDriverMaxSpeed,
    actingDriverItinerary,
    femaleOnly,
    kidsOnBoard,
    elderlyOnBoard,
    actingDriverAccommodation,
    actingDriverFood,
    actingDriverNotifyEvents,
    actingDriverOtherRequests,
    nightRide,
    scheduleDateTime,
  } = trip;

  const vehicleName = [vehicleBrand, vehicleModel].filter(Boolean).join(' ');
  const hasVehicle = vehicleName || vehicleNumber || passangerVehicleType;

  const itineraryDates = actingDriverItinerary
    ? Object.keys(actingDriverItinerary).sort()
    : [];
  const hasItinerary = itineraryDates.length > 0;

  const hasPreferences =
    femaleOnly || kidsOnBoard || elderlyOnBoard ||
    actingDriverAccommodation || actingDriverFood ||
    actingDriverNotifyEvents || nightRide;

  const hasSpecialReq = actingDriverOtherRequests || actingDriverMaxSpeed;

  const formatTripType = (type) => {
    if (!type) return null;
    return type === 'ROUND_TRIP' ? 'Round Trip' : 'One Way';
  };

  const formatSchedule = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleRow} activeOpacity={0.8} onPress={() => setExpanded(v => !v)}>
        <View style={styles.toggleLeft}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={18} color={Colors.periwinkle} />
          <Text style={styles.toggleTitle}>Trip Details</Text>
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>

          {/* ── Vehicle Details ── */}
          {hasVehicle && (
            <Section icon="car-outline" title="Passenger Vehicle">
              {vehicleName ? <Row label="Vehicle" value={vehicleName} icon="car" /> : null}
              {vehicleNumber ? <Row label="Plate No." value={vehicleNumber} icon="card-text-outline" /> : null}
              {passangerVehicleType ? (
                <Row label="Type" value={passangerVehicleType.replace(/_/g, ' ')} icon="shape-outline" />
              ) : null}
            </Section>
          )}

          {/* ── Trip Info ── */}
          <Section icon="road-variant" title="Trip Info">
            {formatTripType(tripType) ? <Row label="Trip Type" value={formatTripType(tripType)} icon="map-marker-path" /> : null}
            {actingDriverHours ? <Row label="Duration" value={`${actingDriverHours} ${actingDriverHours === 1 ? 'Hour' : 'Hours'}`} icon="clock-outline" /> : null}
            {scheduleDateTime ? <Row label="Scheduled" value={formatSchedule(scheduleDateTime)} icon="calendar-clock" /> : null}
          </Section>

          {/* ── Itinerary ── */}
          {hasItinerary && (
            <Section icon="map-legend" title="Itinerary Plan">
              {itineraryDates.map((dateStr) => {
                const dayData = actingDriverItinerary[dateStr];
                const locations = Array.isArray(dayData?.locations)
                  ? dayData.locations
                  : Array.isArray(dayData)
                  ? dayData
                  : [];
                const d = new Date(dateStr);
                const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
                return (
                  <View key={dateStr} style={styles.itineraryDay}>
                    <View style={styles.itineraryDateRow}>
                      <MaterialCommunityIcons name="calendar" size={13} color={Colors.periwinkle} />
                      <Text style={styles.itineraryDate}>{label}</Text>
                    </View>
                    {locations.map((loc, idx) => (
                      <View key={idx} style={styles.itineraryStop}>
                        <View style={styles.itineraryDot} />
                        <View style={styles.itineraryStopText}>
                          <Text style={styles.itineraryStopName}>{loc.name || loc.placeName || `Stop ${idx + 1}`}</Text>
                          {loc.address ? <Text style={styles.itineraryStopAddr} numberOfLines={1}>{loc.address}</Text> : null}
                          {loc.time ? (
                            <View style={styles.itineraryTimeRow}>
                              <MaterialCommunityIcons name="clock-outline" size={11} color="#999" />
                              <Text style={styles.itineraryTime}>{loc.time}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </Section>
          )}

          {/* ── Rider Preferences ── */}
          {hasPreferences && (
            <Section icon="tune" title="Rider Preferences">
              <View style={styles.badgeRow}>
                <Badge label="Female Driver" active={femaleOnly} icon="gender-female" />
                <Badge label="Kids on Board" active={kidsOnBoard} icon="baby-face-outline" />
                <Badge label="Elderly on Board" active={elderlyOnBoard} icon="human-cane" />
                <Badge label="Accommodation" active={actingDriverAccommodation} icon="bed-outline" />
                <Badge label="Meals Needed" active={actingDriverFood} icon="food-outline" />
                <Badge label="Notify Events" active={actingDriverNotifyEvents} icon="bell-ring-outline" />
                <Badge label="Night Ride" active={nightRide} icon="weather-night" />
              </View>
            </Section>
          )}

          {/* ── Special Requirements ── */}
          {hasSpecialReq && (
            <Section icon="alert-circle-outline" title="Special Requirements">
              {actingDriverMaxSpeed ? (
                <Row label="Max Speed" value={`${actingDriverMaxSpeed} km/h`} icon="speedometer" />
              ) : null}
              {actingDriverOtherRequests ? (
                <View style={styles.otherReqBox}>
                  <MaterialCommunityIcons name="comment-text-outline" size={13} color="#888" style={styles.rowIcon} />
                  <Text style={styles.otherReqText}>{actingDriverOtherRequests}</Text>
                </View>
              ) : null}
            </Section>
          )}

        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 14,
    color: Colors.black,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 12,
    color: Colors.periwinkle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    gap: 6,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowIcon: {
    width: 16,
  },
  rowLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#666',
    width: 80,
  },
  rowValue: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.black,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.periwinkle,
  },
  itineraryDay: {
    marginBottom: 10,
  },
  itineraryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  itineraryDate: {
    fontFamily: Fonts.semi_bold,
    fontSize: 12,
    color: Colors.periwinkle,
  },
  itineraryStop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginLeft: 4,
    marginBottom: 6,
  },
  itineraryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.periwinkle,
    marginTop: 5,
  },
  itineraryStopText: {
    flex: 1,
  },
  itineraryStopName: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.black,
  },
  itineraryStopAddr: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#777',
    marginTop: 1,
  },
  itineraryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  itineraryTime: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#999',
  },
  otherReqBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBF0',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  otherReqText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.black,
    flex: 1,
    lineHeight: 19,
  },
});

export default ActingDriverTripInfo;
