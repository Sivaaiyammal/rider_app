import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';
import { Fonts } from '../../../common/constants/constants';
import { DateTimeFormatter } from '../../../common/utils/DateTimeFormatter';

const P = '#352166';
const P_LIGHT = '#EDE9F8';
const P_MED = '#D4CAEE';
const NAVY = '#0F223C';
const GREY = '#757575';
const BG = '#F5F7FA';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getWeekDates = (date) => {
  const day = date.getDay();
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
};

const getMonthGrid = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

const DriverCalendarView = ({
  t,
  currentDate,
  loading,
  selectedDate,
  selectedTrips,
  selectedActingTrips,
  getTripsForDate,
  hasActingTrips,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onTripSelect,
  onStartTrip,
  onViewLocation,
  onRefresh,
}) => {
  const [calOpen, setCalOpen] = useState(false);
  const today = new Date();
  const weekDates = getWeekDates(selectedDate);
  const monthGrid = calOpen ? getMonthGrid(currentDate) : null;

  const weekLabel = (() => {
    const s = weekDates[0];
    const e = weekDates[6];
    const sm = s.toLocaleString('en-IN', { month: 'short' });
    const em = e.toLocaleString('en-IN', { month: 'short' });
    if (sm === em) return `${sm} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`;
    return `${sm} ${s.getDate()} – ${em} ${e.getDate()}, ${e.getFullYear()}`;
  })();

  const getTripStatusColor = status => {
    if (status === 'COMPLETED') return '#43A047';
    if (status === 'CANCELLED') return '#E53935';
    return P;
  };

  const getTripStatusBg = status => {
    if (status === 'COMPLETED') return '#E8F5E9';
    if (status === 'CANCELLED') return '#FFEBEE';
    return P_LIGHT;
  };

  const renderTripItem = ({ item }) => (
    <View style={[styles.card, item.isActingDriverTrip && styles.actingCard]}>
      <TouchableOpacity onPress={() => onTripSelect(item)} activeOpacity={0.8}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTime}>
              {DateTimeFormatter.requiredDateFormat(item.bookingTime, 'ddd, DD MMM YYYY')}
              {'  '}
              <Text style={styles.cardTimeHour}>
                {DateTimeFormatter.requiredDateFormat(item.bookingTime, 'hh:mm A')}
              </Text>
            </Text>
            <Text style={styles.cardId} numberOfLines={1}>
              #{item.rideId || item._id?.slice(-8).toUpperCase()}
            </Text>
          </View>
          <View style={styles.badgeCol}>
            {item.isActingDriverTrip && (
              <View style={styles.actingBadge}>
                <MaterialCommunityIcons name="steering" size={10} color="#43A047" />
                <Text style={styles.actingBadgeTxt}>Acting</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: getTripStatusBg(item.status) }]}>
              <Text style={[styles.statusTxt, { color: getTripStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        {!!(item.finalDistance || item.finalDuration) && (
          <View style={styles.statsRow}>
            {!!item.finalDistance && (
              <View style={styles.statChip}>
                <MaterialCommunityIcons name="map-marker-distance" size={12} color={P} />
                <Text style={styles.statTxt}>{parseFloat(item.finalDistance).toFixed(1)} km</Text>
              </View>
            )}
            {!!item.finalDuration && (
              <View style={styles.statChip}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={P} />
                <Text style={styles.statTxt}>{item.finalDuration} min</Text>
              </View>
            )}
            {item.status === 'COMPLETED' && !!item.paymentDetails?.fareDetails?.fare && (
              <View style={[styles.statChip, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="currency-inr" size={12} color="#43A047" />
                <Text style={[styles.statTxt, { color: '#43A047' }]}>
                  {parseFloat(item.paymentDetails.fareDetails.fare).toFixed(0)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Route */}
        {item.stops?.length > 0 && (
          <View style={styles.routeBox}>
            <View style={styles.routeRow}>
              <View style={styles.routeDotBlue} />
              <Text style={styles.routeAddr} numberOfLines={1}>{item.stops[0]?.address || 'N/A'}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={styles.routeDotRed} />
              <Text style={styles.routeAddr} numberOfLines={1}>{item.stops[item.stops.length - 1]?.address || 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* Pickup location for acting driver */}
        {item.isActingDriverTrip && item.pickupLocation && (
          <TouchableOpacity style={styles.pickupRow} onPress={() => onViewLocation(item.pickupLocation)} activeOpacity={0.8}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color={P} />
            <Text style={styles.pickupTxt} numberOfLines={1}>{item.pickupLocation.address}</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={P_MED} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Continue button */}
      {item.isActingDriverTrip && item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
        <TouchableOpacity style={styles.continueBtn} onPress={() => onStartTrip(item)} activeOpacity={0.85}>
          <MaterialCommunityIcons name="play-circle-outline" size={18} color="#FFF" />
          <Text style={styles.continueTxt}>Continue Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && selectedTrips.length === 0) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={P} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>My Schedule</Text>
          <Text style={styles.pageSubtitle}>
            {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerBadge} onPress={onRefresh} activeOpacity={0.7} disabled={loading}>
          {loading
            ? <ActivityIndicator size="small" color={P} />
            : <MaterialCommunityIcons name="refresh" size={18} color={P} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Calendar card */}
        <View style={styles.calCard}>
          {/* Toggle row */}
          <TouchableOpacity style={styles.calHeader} onPress={() => setCalOpen(o => !o)} activeOpacity={0.8}>
            <View style={styles.calHeaderLeft}>
              <View style={styles.calHeaderIcon}>
                <MaterialCommunityIcons name="calendar-week" size={16} color={P} />
              </View>
              <View>
                <Text style={styles.calWeekLabel}>{weekLabel}</Text>
                <Text style={styles.calWeekSub}>
                  {calOpen ? 'Full month  •  ' : 'This week  •  '}
                  {selectedTrips.length} trip{selectedTrips.length !== 1 ? 's' : ''} on{' '}
                  {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </View>
            <View style={styles.calToggleBtn}>
              <MaterialCommunityIcons name={calOpen ? 'calendar-collapse-horizontal' : 'calendar-expand-horizontal'} size={18} color={P} />
            </View>
          </TouchableOpacity>

          {/* Month/week nav — always visible */}
          <View style={styles.weekNav}>
            <TouchableOpacity style={styles.weekNavBtn} onPress={onPreviousMonth} activeOpacity={0.8}>
              <MaterialCommunityIcons name="chevron-left" size={20} color={P} />
            </TouchableOpacity>
            <Text style={styles.weekNavLabel}>
              {currentDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity style={styles.weekNavBtn} onPress={onNextMonth} activeOpacity={0.8}>
              <MaterialCommunityIcons name="chevron-right" size={20} color={P} />
            </TouchableOpacity>
          </View>

          {/* Weekday header row */}
          <View style={styles.weekStrip}>
            {WEEKDAYS.map(d => (
              <View key={d} style={styles.weekDay}>
                <Text style={styles.wdLabel}>{d}</Text>
              </View>
            ))}
          </View>

          {calOpen ? (
            /* Full month grid */
            <>
              {monthGrid.map((week, wi) => (
                <View key={wi} style={styles.weekStrip}>
                  {week.map((date, di) => {
                    if (!date) return <View key={di} style={styles.weekDay} />;
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);
                    const hasActing = hasActingTrips(date);
                    const hasRegular = getTripsForDate(date).some(tr => !tr.isActingDriverTrip);
                    return (
                      <TouchableOpacity key={di} style={styles.weekDay} onPress={() => onDateSelect(date)} activeOpacity={0.7}>
                        <View style={[styles.wdCircle, isToday && styles.wdCircleToday, isSelected && styles.wdCircleSelected]}>
                          <Text style={[styles.wdNum, isToday && !isSelected && styles.wdNumToday, isSelected && styles.wdNumSelected]}>
                            {date.getDate()}
                          </Text>
                        </View>
                        <View style={styles.wdDots}>
                          {hasActing && <View style={[styles.wdDot, { backgroundColor: '#43A047' }]} />}
                          {hasRegular && <View style={[styles.wdDot, { backgroundColor: isSelected ? '#FFF' : P }]} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </>
          ) : (
            /* This week strip only */
            <View style={styles.weekStrip}>
              {weekDates.map((date, i) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                const hasActing = hasActingTrips(date);
                const hasRegular = getTripsForDate(date).some(tr => !tr.isActingDriverTrip);
                return (
                  <TouchableOpacity key={i} style={styles.weekDay} onPress={() => onDateSelect(date)} activeOpacity={0.7}>
                    <View style={[styles.wdCircle, isToday && styles.wdCircleToday, isSelected && styles.wdCircleSelected]}>
                      <Text style={[styles.wdNum, isToday && !isSelected && styles.wdNumToday, isSelected && styles.wdNumSelected]}>
                        {date.getDate()}
                      </Text>
                    </View>
                    <View style={styles.wdDots}>
                      {hasActing && <View style={[styles.wdDot, { backgroundColor: '#43A047' }]} />}
                      {hasRegular && <View style={[styles.wdDot, { backgroundColor: isSelected ? '#FFF' : P }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#43A047' }]} />
              <Text style={styles.legendTxt}>Acting Driver</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: P }]} />
              <Text style={styles.legendTxt}>Regular Trip</Text>
            </View>
          </View>
        </View>

        {/* Trips for selected date */}
        <View style={styles.tripsSection}>
          <View style={styles.tripsSectionHeader}>
            <Text style={styles.tripsSectionDate}>
              {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={styles.tripsSectionCount}>
              {selectedTrips.length} trip{selectedTrips.length !== 1 ? 's' : ''}
              {selectedActingTrips > 0 ? ` • ${selectedActingTrips} acting` : ''}
            </Text>
          </View>

          {loading ? (
            <View style={[styles.empty, { paddingVertical: 30 }]}>
              <ActivityIndicator size="small" color={P} />
            </View>
          ) : selectedTrips.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={P_MED} />
              </View>
              <Text style={styles.emptyTitle}>No trips on this day</Text>
              <Text style={styles.emptySubtitle}>Select another date to view trips</Text>
            </View>
          ) : (
            <FlatList
              data={selectedTrips}
              renderItem={renderTripItem}
              keyExtractor={(item, index) => `${item._id}-${index}`}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

DriverCalendarView.propTypes = {
  t: PropTypes.func.isRequired,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  selectedTrips: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedActingTrips: PropTypes.number.isRequired,
  getTripsForDate: PropTypes.func.isRequired,
  hasActingTrips: PropTypes.func.isRequired,
  onDateSelect: PropTypes.func.isRequired,
  onPreviousMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired,
  onTripSelect: PropTypes.func.isRequired,
  onStartTrip: PropTypes.func.isRequired,
  onViewLocation: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },

  pageHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderColor: '#ECEEF2',
  },
  pageTitle: { fontSize: 20, fontFamily: Fonts.bold, color: NAVY },
  pageSubtitle: { fontSize: 12, fontFamily: Fonts.regular, color: GREY, marginTop: 2 },
  headerBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: P_LIGHT, alignItems: 'center', justifyContent: 'center',
  },

  calCard: {
    backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, marginBottom: 8,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    elevation: 2, shadowColor: NAVY, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  calHeaderIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: P_LIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  calWeekLabel: { fontSize: 14, fontFamily: Fonts.bold, color: NAVY },
  calWeekSub: { fontSize: 11, fontFamily: Fonts.regular, color: GREY, marginTop: 1 },
  calToggleBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: P_LIGHT,
    alignItems: 'center', justifyContent: 'center',
  },

  weekNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 14, marginBottom: 12,
  },
  weekNavBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: P_LIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  weekNavLabel: { fontSize: 13, fontFamily: Fonts.semi_bold, color: NAVY },

  weekStrip: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  wdLabel: { fontSize: 10, fontFamily: Fonts.medium, color: GREY, textTransform: 'uppercase', marginBottom: 4 },
  wdLabelSelected: { color: P, fontFamily: Fonts.bold },
  wdLabelToday: { color: P },
  wdCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  wdCircleToday: { backgroundColor: P_LIGHT },
  wdCircleSelected: {
    backgroundColor: P,
    elevation: 3, shadowColor: P, shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  wdNum: { fontSize: 14, fontFamily: Fonts.medium, color: NAVY },
  wdNumToday: { color: P, fontFamily: Fonts.bold },
  wdNumSelected: { color: '#FFF', fontFamily: Fonts.bold },
  wdDots: { flexDirection: 'row', gap: 3, height: 7, marginTop: 2, alignItems: 'center' },
  wdDot: { width: 5, height: 5, borderRadius: 2.5 },

  legend: {
    flexDirection: 'row', gap: 20, marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, borderColor: '#F0F0F0',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendTxt: { fontSize: 11, fontFamily: Fonts.medium, color: GREY },

  tripsSection: { paddingHorizontal: 16, paddingTop: 8 },
  tripsSectionHeader: { marginBottom: 12 },
  tripsSectionDate: { fontSize: 16, fontFamily: Fonts.bold, color: NAVY },
  tripsSectionCount: { fontSize: 12, fontFamily: Fonts.regular, color: GREY, marginTop: 2 },

  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: NAVY, shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    borderWidth: 1, borderColor: '#F0F4F8',
  },
  actingCard: { borderLeftWidth: 4, borderLeftColor: '#43A047' },

  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  cardTime: { fontSize: 14, fontFamily: Fonts.semi_bold, color: NAVY },
  cardTimeHour: { fontSize: 13, fontFamily: Fonts.medium, color: P },
  cardId: { fontSize: 11, fontFamily: Fonts.regular, color: GREY, marginTop: 2 },
  badgeCol: { alignItems: 'flex-end', gap: 5 },
  actingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    borderWidth: 1, borderColor: '#43A047',
  },
  actingBadgeTxt: { fontSize: 10, fontFamily: Fonts.bold, color: '#2E7D32' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusTxt: { fontSize: 10, fontFamily: Fonts.bold, textTransform: 'uppercase', letterSpacing: 0.3 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: P_LIGHT, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  statTxt: { fontSize: 11, fontFamily: Fonts.medium, color: P },

  routeBox: { backgroundColor: '#F8F9FC', borderRadius: 12, padding: 12, marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeLine: { width: 2, height: 14, backgroundColor: '#DDE1EA', marginLeft: 6, marginVertical: 3 },
  routeDotBlue: { width: 14, height: 14, borderRadius: 7, backgroundColor: P_LIGHT, borderWidth: 2, borderColor: P },
  routeDotRed: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFEBEE', borderWidth: 2, borderColor: '#E53935' },
  routeAddr: { flex: 1, fontSize: 12, fontFamily: Fonts.medium, color: NAVY },

  pickupRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: P_LIGHT, padding: 10, borderRadius: 10, marginTop: 4,
  },
  pickupTxt: { flex: 1, fontSize: 12, fontFamily: Fonts.medium, color: P },

  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: P, paddingVertical: 12, borderRadius: 12, marginTop: 14,
    elevation: 2, shadowColor: P, shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  continueTxt: { fontSize: 14, fontFamily: Fonts.bold, color: '#FFF' },

  empty: {
    alignItems: 'center', paddingVertical: 40,
    backgroundColor: '#FFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#F0F4F8', marginBottom: 12,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: P_LIGHT,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  emptyTitle: { fontSize: 15, fontFamily: Fonts.semi_bold, color: NAVY },
  emptySubtitle: { fontSize: 12, fontFamily: Fonts.regular, color: GREY, marginTop: 4 },
});

export default DriverCalendarView;
