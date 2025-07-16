import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, Fonts } from '../../../constants/constants';

const PaymentDetails = ({
  tripBill = '₹96.35',
  gst = '₹21.15',
  total = '₹117.50',
}) => (
  <View style={styles.container}>
    <Text style={styles.header}>Payment Details</Text>
    <View style={styles.row}>
      <Text style={styles.label}>Trip Bill</Text>
      <Text style={styles.value}>{tripBill}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>GST 18%</Text>
      <Text style={styles.value}>{gst}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.totalLabel}>Total Bill</Text>
      <Text style={styles.totalValue}>{total}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.grey_xxdark,
  },
  value: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.black,
  },
  totalLabel: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: colors.black,
    marginTop: 6,
  },
  totalValue: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: colors.black,
    marginTop: 6,
  },
});

export default PaymentDetails; 