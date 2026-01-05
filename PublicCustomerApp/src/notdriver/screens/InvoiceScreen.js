import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import UseBackButton from '../../common/hooks/UseBackButton';
import NavBar from '../../common/components/NavBar';
import { DateTimeFormatter } from '../../common/utils/DateTimeFormatter';
import { Colors, Fonts } from '../../common/constants/constants';
import { useTranslation } from 'react-i18next';

const InvoiceScreen = ({ rideId,distance,duration,driverDetails,vehicleDetails,tripStops,bookingTime,fareDetails, onClose, tripDetials, supplierInfo, recipient }) => {
  const {t} = useTranslation()
  const defaultCompanyInfo = {  
    name: supplierInfo?.name || 'N/A', 
    address: supplierInfo?.address || 'N/A',
    phone: supplierInfo?.phone || 'N/A',
    email: supplierInfo?.email || 'N/A',
    gstin: supplierInfo?.gstNumber || 'N/A',
    panNumber: supplierInfo?.panNumber || 'N/A'
  };
  
  const defaultCustomerInfo = {
    name:recipient?.name || 'N/A',
    phone:  'N/A',
    address: recipient?.address || 'N/A'
  };
  
  const defaultDriverInfo = {
    driverName: driverDetails?.driverName || 'N/A',
    driverRating: driverDetails?.driverRating || 'N/A',
    vehicleBrand: vehicleDetails?.vehicleBrand || 'N/A',
    vehicleModel: vehicleDetails?.vehicleModel || 'N/A',
    vehicleNumber: vehicleDetails?.vehicleNumber || 'N/A'
  };
  
 
  
  // Merge actual data with defaults
  const mergedRideData = fareDetails?.breakdown || {};

  const handleBackPress = () => {
      onClose()
  };

  const formatCurrency = (amount, isCoupon) => {
    if (amount === null || amount === undefined || amount <= 0) return '₹0.00';
    return isCoupon ? `-₹${parseFloat(amount).toFixed(2)}` : `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined || minutes < 0) return '0 Mins';
    return `${minutes} Mins`;
  };

  const formatDistance = (km) => {
    if (km === null || km === undefined || km < 0) return '0.00 Km';
    return `${parseFloat(km).toFixed(2)} Km`;
  };

  const humanizeKey = (key) => {
    if (!key) return '';
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Derived amounts
  const rideCost =
    Number(mergedRideData.distancefare || 0) +
    Number(mergedRideData.zoneAdjustment || 0) +
    Number(mergedRideData.rideMatchAdjustment || 0) +
    Number(mergedRideData.surgeAdjustment || 0) +
    Number(mergedRideData.incentives || 0) +
    Number(mergedRideData.lowPerformancePenalty || 0);

  const waitingCost = Number(mergedRideData.waitTimeCost || 0);
  const couponDiscount = Number(mergedRideData.couponDiscount || 0);
  const subtotal = Number(mergedRideData.subtotal || 0);
  const taxes = mergedRideData?.taxes?.breakdown || {};
  const feesWithTax = mergedRideData?.feesWithTax?.breakdown || {};

  return (
      <View style={styles.container}>
        <UseBackButton onBackPress={handleBackPress}/>
        <NavBar withBg onBackPress={handleBackPress} title={t('invoice')} />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.invoiceTitle}>{t('invoice')}</Text>
              <Text style={styles.invoiceNumber}>#{rideId}</Text>
            <Text style={styles.invoiceDate}>{DateTimeFormatter.formatDateAndTime(bookingTime)}</Text>
            </View>
            <View style={styles.carImageContainer}>
              <MaterialCommunityIcons name="car" size={32} color={Colors.blue} />
            </View>
          </View>

          {/* Company and Customer Info */}
          <View style={styles.infoSection}>
            <View style={styles.companyInfo}>
              <Text style={styles.sectionTitle}>{t('supplier_info')}</Text>
              <Text style={styles.companyName}>{(mergedRideData.companyInfo && mergedRideData.companyInfo.name) || defaultCompanyInfo.name}</Text>
              <Text style={styles.companyAddress}>{(mergedRideData.companyInfo && mergedRideData.companyInfo.address) || defaultCompanyInfo.address}</Text>
                <View style={styles.companyContactContainer}>
                {/* <Ionicons name="call" size={20}color={'black'} /> */}
                <Text style={styles.companyContact}> {(mergedRideData.companyInfo && mergedRideData.companyInfo.phone) || defaultCompanyInfo.phone}</Text>
                </View>
            
          
              <Text style={styles.companyGstin}>GSTIN: {(mergedRideData.companyInfo && mergedRideData.companyInfo.gstin) || defaultCompanyInfo.gstin}</Text>
            </View>
            {recipient && (
            <View style={styles.customerInfo}>
              <Text style={styles.sectionTitle}>{'Recipient Info'}</Text>
              <Text style={styles.customerName}>{(mergedRideData.customerInfo && mergedRideData.customerInfo.name) || defaultCustomerInfo.name}</Text>
              <Text style={styles.customerAddress}>{(mergedRideData.customerInfo && mergedRideData.customerInfo.address) || defaultCustomerInfo.address}</Text>
              <View style={styles.customerContactContainer}>
              <Text style={styles.customerContact}> {(mergedRideData.customerInfo && mergedRideData.customerInfo.phone) || defaultCustomerInfo.phone}</Text>
              </View>
              <View style={styles.customerContactContainer}>
              </View>
            </View>)}
          </View>

          {/* Trip Details */}
          <View style={styles.tripDetails}>
            <Text style={styles.sectionTitle}>{t('trip_details')}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('ride_type')}</Text>
              <Text style={styles.detailValue}>{(tripDetials?.vehicleType.split('_').join(' '))}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('start_location')}</Text>
              <Text style={styles.detailValue}>{tripDetials?.stops[0]?.address || 'N/A'}</Text>
            </View> 
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('end_location')}</Text>
              <Text style={styles.detailValue}>{tripDetials?.stops[tripDetials?.stops.length - 1]?.address || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('distance')}</Text>
              <Text style={styles.detailValue}>{formatDistance(tripDetials?.finalDistance || distance)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('duration')}</Text>
              <Text style={styles.detailValue}>{formatDuration(tripDetials?.finalDuration || duration)}</Text>
            </View>
            
            {/* <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{'Driver Name'}</Text>
              <Text style={styles.detailValue}>{mergedRideData.driverInfo?.driverName || defaultDriverInfo.driverName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{'Vehicle Number'}</Text>
              <Text style={styles.detailValue}>{mergedRideData.driverInfo?.vehicleNumber || defaultDriverInfo.vehicleNumber}</Text>
            </View> */}
          </View>

          {/* Invoice Breakdown */}
          <View style={styles.invoiceBreakdown}>
            <Text style={styles.sectionTitle}>{t('invoice_breakdown')}</Text>

            {/* Ride Cost */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('ride_cost')}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(rideCost)}</Text>
            </View>

            {/* Waiting Cost */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('waiting_cost')}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(waitingCost)}</Text>
            </View>

            {/* Coupon Discount */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('coupon_discount')}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(couponDiscount, true)}</Text>
            </View>

            {/* Subtotal */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('subtotal')}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(subtotal)}</Text>
            </View>

            {/* Taxes */}
            {Object.keys(taxes).length > 0 && (
              <View>
                {Object.entries(taxes).map(([taxKey, taxValue], idx) => (
                  <View key={`tax-${taxKey}-${idx}`} style={styles.taxRow}>
                    <Text style={styles.taxLabel}>
                      {humanizeKey(taxKey)} {taxValue?.type === 'percentage' && `(${taxValue?.value}%)`}
                    </Text>
                    <Text style={styles.taxValue}>{formatCurrency(taxValue?.tax || 0)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Fees With Tax */}
            {Object.keys(feesWithTax).length > 0 && (
              <View>
                {Object.entries(feesWithTax).map(([feeKey, feeObj], idx) => (
                  <View key={`fee-${feeKey}-${idx}`}>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>{humanizeKey(feeKey)}</Text>
                      <Text style={styles.breakdownValue}>{formatCurrency(feeObj?.feeAmount || feeObj?.total || 0)}</Text>
                    </View>
                    {/* Fee Tax Breakdown */}
                    {feeObj?.taxAmount && (
                      Object.entries(feeObj.taxAmount).map(([tKey, tVal], tIdx) => (
                        <View key={`fee-tax-${feeKey}-${tKey}-${tIdx}`} style={styles.taxRow}>
                          <Text style={styles.taxLabel}>
                            {humanizeKey(tKey)} {tVal?.type === 'percentage' && `- ${tVal?.value}%`}
                          </Text>
                          <Text style={styles.taxValue}>{formatCurrency(tVal?.tax || 0)}</Text>
                        </View>
                      ))
                    )}
               
                  </View>
                ))}
              </View>
            )}

            {/* Grand Total */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('total')}</Text>
              <Text style={styles.totalValue}>{formatCurrency(mergedRideData.finalFare || 0)}</Text>
            </View>
          </View>

     
        </ScrollView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  invoiceHeader: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  invoiceTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: "white",
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  invoiceNumber: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.blue,
    marginBottom: 4,
  },
  invoiceDate: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.grey_xxdark,
  },
  carImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.blue,
    borderRadius: 30,
  },
  infoSection: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  companyInfo: {
    flex: 1,
    backgroundColor: Colors.white,
    gap:5,
    borderRadius: 10,
    padding: 16,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  customerInfo: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap:5
  },
  sectionTitle: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.grey_xxdark,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  companyName: {
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
    color: Colors.black,
    marginBottom: 4,
  },
  companyAddress: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.grey_xxdark,
    marginBottom: 4,
  },
  companyContact: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.grey_xxdark,
 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  companyEmail: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.grey_xxdark,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companyGstin: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.grey_xxdark,
    marginBottom: 2,
  },
  customerName: {
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
    color: Colors.black,
    marginBottom: 4,
  },
  customerAddress: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.grey_xxdark,
    marginBottom: 4,
  },
  customerContact: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.grey_xxdark,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerEmail: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.grey_xxdark,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripDetails: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey_light,
  },
  detailLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.black,
    flex: 1,
  },
  detailValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.black,
    textAlign: 'right',
    flex: 1,
  },
  invoiceBreakdown: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey_light,
  },
  breakdownLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.black,
    flex: 1,
  },
  breakdownValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.black,
    textAlign: 'right',
    flex: 1,
  },
  totalValue: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.green,
    textAlign: 'right',
    flex: 1,
  },
  paymentInfo: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: Colors.black,
   
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginRight: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  downloadButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emailButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginLeft: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  emailButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companyContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerContactContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey_light,
  },
  taxLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.grey_xxdark,
    flex: 1,
  },
  taxValue: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.grey_xxdark,
    textAlign: 'right',
    flex: 1,
  }
});

InvoiceScreen.propTypes = {
  TripData: PropTypes.object,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default InvoiceScreen; 