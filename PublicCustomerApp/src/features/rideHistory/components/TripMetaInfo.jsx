import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, Fonts } from '../../../constants/constants';

const TripMetaInfo = ({ date = 'Mon, Jan 01 2022 3:00 PM', tripId = 'ABC01234' }) => (
  <View style={styles.container}>
    <Text style={styles.date}>{date}</Text>
    <Text style={styles.tripId}>Trip ID : {tripId}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  date: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
  },
  tripId: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: colors.grey_xxdark,
    marginTop: 2,
  },
});

export default TripMetaInfo; 