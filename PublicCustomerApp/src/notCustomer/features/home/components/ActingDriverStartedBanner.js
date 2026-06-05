import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import useCurrentRideInfoStore from '../../rideStatus/store/useCurrentRideInfoStore';
import useAssignedDriverInfoStore from '../../rideStatus/store/useAssignedDriverInfoStore';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import { Fonts } from '../../../constants/constants';

const ActingDriverStartedBanner = () => {
  const { tripStatus, isActingDriverTrip, tripId } = useCurrentRideInfoStore();
  const { allocatedDriverInfo } = useAssignedDriverInfoStore();
  const { setStackScreen } = useStackScreenStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const isVisible =
    isActingDriverTrip &&
    tripId &&
    (tripStatus === 'ACCEPTED' || tripStatus === 'ASSIGNED' || tripStatus === 'PICKEDUP' || tripStatus === 'STARTED');

  if (!isVisible) return null;

  const driverName = allocatedDriverInfo?.driverName || 'Your Driver';
  const isPickedUp = tripStatus === 'PICKEDUP' || tripStatus === 'STARTED';

  const gradientColors = isPickedUp
    ? ['#1a5c2a', '#0f3c18']   // green — trip in progress
    : ['#1a3a5c', '#0f223c'];  // dark blue — driver on the way

  const statusLine = isPickedUp
    ? 'Trip is in progress'
    : `${driverName} is on the way to you`;

  const iconName = isPickedUp ? 'steering' : 'car-arrow-right';
  const accentColor = isPickedUp ? '#4CAF50' : '#FFD700';

  const handleTrack = () => {
    setStackScreen('CustomerliveTracking', {});
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity activeOpacity={0.88} onPress={handleTrack}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}>
          {/* Left: icon + text */}
          <View style={styles.left}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <MaterialCommunityIcons name={iconName} size={22} color="#fff" />
            </View>
            <View style={styles.textCol}>
              <Text style={[styles.title, { color: accentColor }]}>
                {isPickedUp ? 'Trip in Progress' : 'Acting Driver'}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>{statusLine}</Text>
            </View>
          </View>

          {/* Right: live dot + track button */}
          <View style={styles.right}>
            <View style={[styles.liveDot, { backgroundColor: accentColor }]} />
            <View style={styles.trackBtn}>
              <MaterialCommunityIcons name="map-marker-radius" size={14} color="#fff" />
              <Text style={styles.trackTxt}>Track</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 14,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  card: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.semi_bold,
    fontSize: 13,
    color: '#FFD700',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  right: {
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  trackTxt: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#fff',
  },
});

export default ActingDriverStartedBanner;
