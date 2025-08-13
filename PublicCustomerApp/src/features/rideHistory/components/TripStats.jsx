import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import DistanceIcon from '../../../assets/image/svgIcons/distanceBlue.svg';
import WatchIcon from '../../../assets/image/svgIcons/watch.svg';
import FareIcon from '../../../assets/image/svgIcons/fare.svg';
import { Fonts, colors } from '../../../constants/constants';
import { utils } from '../../../utils/Utils';
const TripStats = ({
  totalDistance,totalDuration,totalFare
}) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.statsRow}>
      <View style={[styles.statBox, { backgroundColor: '#E6F3FF' }]}>
        <DistanceIcon width={24} height={24} style={styles.icon} />
        <Text style={styles.label}>{t('distance')}</Text>
        <Text style={styles.value}>{typeof totalDistance === 'string' ? totalDistance?.toFixed(1) : String(totalDistance?.toFixed(1))} Km</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: '#FFF7E6' }]}>
        <WatchIcon width={24} height={24} style={styles.icon} />
        <Text style={styles.label}>{t('duration')}</Text>
        <Text style={styles.value}>{utils.formatMinutesToReadable(totalDuration)}</Text>
      </View>
      <View style={[styles.statBox, { backgroundColor: '#E6F7F1' }]}>
        <FareIcon width={24} height={24} style={styles.icon} />
        <Text style={styles.label}>{t('fare')}</Text>
        <Text style={styles.value}>₹ {typeof totalFare === 'string' ? totalFare : String(totalFare)}</Text>
      </View>
    </View>
  );
};

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
    fontSize: 12,
    color: colors.black,
    marginBottom: 2,
    marginTop:5
  },
  value: {
    fontFamily: Fonts.medium,
    fontSize: 18,
    color: colors.black,
    marginTop: 2,
  },
});

export default TripStats; 