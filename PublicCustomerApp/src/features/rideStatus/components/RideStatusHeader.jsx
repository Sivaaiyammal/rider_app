import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DroppedTickIcon from '../../../assets/icons/DroppedTickIcon.svg';
import { Fonts } from '../../../constants/constants';

const RideStatusHeader = ({ 
  icon: IconComponent = DroppedTickIcon, 
  iconWidth = 30, 
  iconHeight = 30, 
  title = "Your ride is completed.", 
  subtitle = null,
  iconBackgroundColor = '#E8F5E9'
}) => {
  return (
    <>
      <View style={[styles.iconWrap, { backgroundColor: iconBackgroundColor }]}>
        <IconComponent width={iconWidth} height={iconHeight} />
      </View>
      <Text style={styles.completedText}>{title}</Text>
      {subtitle && <Text style={styles.subText}>{subtitle}</Text>}
    </>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    borderRadius: 32,
    padding: 8,
    marginBottom: 10,
  },
  completedText: {
    fontSize: 17,
    color: '#222',
    fontFamily: Fonts.medium,
    marginBottom: 2,
    textAlign: 'center',
  },
  subText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
});

export default RideStatusHeader; 