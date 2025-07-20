import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, Fonts } from '../../../constants/constants';

const PayButton = ({ amount = '₹117.50', onPress,paymentMethod }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>PAY  {paymentMethod == 'CASH' ? 'THROUGH  UPI' : 'NOW'}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal:15
  },
  text: {
    color: colors.white,
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
  },
});

export default PayButton; 