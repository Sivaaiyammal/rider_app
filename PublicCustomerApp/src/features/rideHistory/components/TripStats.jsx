import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DistanceIcon from '../../../assets/image/svgIcons/distanceBlue.svg';
import WatchIcon from '../../../assets/image/svgIcons/watch.svg';
import FareIcon from '../../../assets/image/svgIcons/fare.svg';
import { Fonts, colors } from '../../../constants/constants';

const TripStats = ({
  distance = '12 Km',
  duration = '30 min',
  fare = '₹117.50',
}) => (
  <View style={styles.statsRow}>
    <View style={[styles.statBox, { backgroundColor: '#E6F3FF' }]}>
      <DistanceIcon width={24} height={24} style={styles.icon} />
      <Text style={styles.label}>Distance</Text>
      <Text style={styles.value}>{typeof distance === 'string' ? distance : String(distance)}</Text>
    </View>
    <View style={[styles.statBox, { backgroundColor: '#FFF7E6' }]}>
      <WatchIcon width={24} height={24} style={styles.icon} />
      <Text style={styles.label}>Duration</Text>
      <Text style={styles.value}>{typeof duration === 'string' ? duration : String(duration)}</Text>
    </View>
    <View style={[styles.statBox, { backgroundColor: '#E6F7F1' }]}>
      <FareIcon width={24} height={24} style={styles.icon} />
      <Text style={styles.label}>Fare</Text>
      <Text style={styles.value}>{typeof fare === 'string' ? fare : String(fare)}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 6,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
    marginBottom: 2,
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: colors.black,
    marginTop: 2,
  },
});

export default TripStats; 