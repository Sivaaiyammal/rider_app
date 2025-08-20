import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Text, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import NavBar from '../../../components/NavBar';
import { Fonts, colors } from '../../../constants/constants';
import PDFCreator from '../../../utils/PDFCreator';
import { utils } from '../../../utils/Utils';

const InvoiceScreen = ({ rideId,tripFare,tripDistance,tripDuration,driverDetails,vehicleDetails,tripStops,bookingTime,fareDetails,paymentMethod,paymentStatus,visible, onClose }) => {
  const { t } = useTranslation();
  const { goBack } = useStackScreenStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customFolder, setCustomFolder] = useState('');
  const [showCustomFolderModal, setShowCustomFolderModal] = useState(false);
  const [lastGeneratedPath, setLastGeneratedPath] = useState('');
  
  const defaultCompanyInfo = {
    name: 'Namma Ooru Taxi',
    address: '789 Company Street, City, State - 654321',
    phone: '+91 1800 123 4567',
    email: 'support@nammaoorutaxi.com',
    gstin: '29ABCDE1234F1Z5'
  };
  
  const defaultCustomerInfo = {
    name: 'John Doe',
    phone: '+91 98765 43210',
    address: tripStops?.[0]?.address || 'N/A'
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
    if (onClose) {
      onClose();
    } else {
      goBack();
    }
  };

  const handleMultiSheetPDF = async () => {
    try {
      setIsGenerating(true);

      const sheets = [
        {
          type: 'tripBill',
          data: {
            tripId:rideId,
            date: utils.formatDateAndTime(bookingTime),
            startTime: utils.formatDateAndTime(bookingTime),
            endTime: utils.formatDateAndTime(bookingTime),
            distance: tripDistance,
            duration: tripDuration,
            totalFare: fareDetails?.fare|| 0,
            driverName: driverDetails?.driverName || 'N/A',
            driverRating: driverDetails?.driverRating || 'N/A',
            vehicleBrand: vehicleDetails?.vehicleBrand || 'N/A',
            vehicleModel: vehicleDetails?.vehicleModel || 'N/A',
            vehicleNumber: vehicleDetails?.vehicleNumber || 'N/A',
            vehicleType: vehicleDetails?.vehicleType || 'N/A',
            vehicleColor: vehicleDetails?.vehicleColor || 'N/A',
          }
        },
        {
          type: 'tripInvoice',
          data: {
            invoiceNo: rideId         ,
            invoicedate: utils.formatDateAndTime(bookingTime),
            state:"Karnataka",
            customerName: defaultCustomerInfo.name,
            customerPickupAddress: tripStops?.[0]?.address || 'N/A',
            customerDropAddress: tripStops?.[tripStops.length - 1]?.address || 'N/A',
            taxCategory:"local transport",
            gstNumber:defaultCompanyInfo.gstin,
            driverName: driverDetails?.driverName || 'N/A',
            vehicleNumber: vehicleDetails?.vehicleNumber || 'N/A',
            ridecost:fareDetails?.breakdown?.distancefare+fareDetails?.breakdown?.zoneAdjustment+fareDetails?.breakdown?.rideMatchAdjustment+fareDetails?.breakdown?.surgeAdjustment+fareDetails?.breakdown?.incentives+fareDetails?.breakdown?.lowPerformancePenalty,
            waitingCost:fareDetails?.waitingCost || 0,
            discountCost:fareDetails?.discountCost || 0,
            tax:Object.entries(fareDetails?.breakdown?.taxes?.breakdown || {}).map(([taxKey, taxValue]) => ({
              name: taxKey,
              value: taxValue.value,
              amount: taxValue.tax
            })),
            rideId:rideId,
            totalCost:fareDetails?.breakdown?.subtotal + fareDetails?.breakdown?.taxes?.total || 0

          }
        },
        {
          type: 'taxInvoice',
          data: {
            companyName:"Namma Ooru Taxi",
            companyAddress:"23, Main Street, Anytown, USA",
            companyPhone:"+1234567890",
            companyGstNumber:"29ABCDE1234F1Z5",
            companyPanNumber:"ABCDE1234F",
            companyState:"Karnataka",
            invoiceNo: 'INV-' + Date.now(),
            invoicedate: new Date().toLocaleDateString(),
            customerName: defaultCustomerInfo.name,
            customerPickupAddress: tripStops?.[0]?.address || 'N/A',
            customerDropAddress: tripStops?.[tripStops.length - 1]?.address || 'N/A',
            taxCategory:"local transport",
            rideId:rideId,

            feewithTaxes:Object.entries(fareDetails?.breakdown?.feesWithTax?.breakdown || {}).map(([feeKey, feeValue]) => ({
              name: feeKey,
              value: feeValue?.feeAmount,
              tax:Object.entries(feeValue.taxAmount || {}).map(([taxKey, taxValue]) => ({
                name: taxKey,
                value: taxValue.value,
                amount: taxValue.tax
              }))
            })),
            finalAmount:fareDetails?.breakdown?.feesWithTax?.total || 0
          }
        }
      ];

      const fileName = 'Ride_Documents_' + new Date().getTime();
      const pdfPath = await PDFCreator.createMultiSheetPDF(sheets, fileName, customFolder || null);

      
      setLastGeneratedPath(pdfPath);

      Alert.alert(
        'Invoice Downloaded!',
        `stored at:\n${pdfPath}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Multi-sheet PDF error:', error);
      Alert.alert('Error', 'Failed to create multi-sheet PDF: ' + error.message, [{ text: 'OK' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailInvoice = async () => {
    try {
      Alert.alert(
        'Email Invoice',
        'Preparing invoice for email...',
        [{ text: 'OK' }]
      );
      
      // Generate PDF using the utility
      const pdfPath = await PDFGenerator.generateReceiptPDF(mergedRideData);
      
      // Share the generated PDF
      const success = await PDFGenerator.sharePDF(pdfPath);
      
      if (success) {
        Alert.alert(
          'Success',
          'Invoice prepared for email sharing!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to prepare invoice for email. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[date.getDay()];
    const dateNum = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${day}, ${dateNum} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    return `${minutes} Mins`;
  };

  const formatDistance = (km) => {
    return `${km} Km`;
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleBackPress}
    >
      <View style={styles.container}>
        <NavBar withBg onBackPress={handleBackPress} title={t('invoice_detail')} />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.invoiceTitle}>{t('invoice')}</Text>
              <Text style={styles.invoiceNumber}>#{rideId}</Text>
              <Text style={styles.invoiceDate}>{utils.formatDateAndTime(bookingTime)}</Text>
            </View>
            <View style={styles.carImageContainer}>
              <MaterialCommunityIcons name="car" size={32} color={colors.blue} />
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
                <View style={styles.companyContactContainer}>
                {/* <MaterialIcons name="email" size={20} color={'black'} /> */}
              {/* <Text style={styles.companyEmail}> {(mergedRideData.companyInfo && mergedRideData.companyInfo.email) || defaultCompanyInfo.email}</Text> */}
              </View>
          
              <Text style={styles.companyGstin}>GSTIN: {(mergedRideData.companyInfo && mergedRideData.companyInfo.gstin) || defaultCompanyInfo.gstin}</Text>
            </View>
            
            <View style={styles.customerInfo}>
              <Text style={styles.sectionTitle}>{t('recipient_info')}</Text>
              <Text style={styles.customerName}>{(mergedRideData.customerInfo && mergedRideData.customerInfo.name) || defaultCustomerInfo.name}</Text>
              <Text style={styles.customerAddress}>{(mergedRideData.customerInfo && mergedRideData.customerInfo.address) || defaultCustomerInfo.address}</Text>
              <View style={styles.customerContactContainer}>
              {/* <Ionicons name="call" size={20} color={'black'} /> */}
              <Text style={styles.customerContact}> {(mergedRideData.customerInfo && mergedRideData.customerInfo.phone) || defaultCustomerInfo.phone}</Text>
              </View>
              <View style={styles.customerContactContainer}>
              {/* <MaterialIcons name="email" size={20} color={'black'} /> */}
              {/* <Text style={styles.customerEmail}> {(mergedRideData.customerInfo && mergedRideData.customerInfo.email) || defaultCustomerInfo.email}</Text> */}
              </View>
            </View>
          </View>

          {/* Trip Details */}
          <View style={styles.tripDetails}>
            <Text style={styles.sectionTitle}>{t('trip_details')}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('ride_type')}</Text>
              <Text style={styles.detailValue}>{vehicleDetails?.vehicleType}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('start_location')}</Text>
              <Text style={styles.detailValue}>{tripStops?.[0]?.address || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('end_location')}</Text>
              <Text style={styles.detailValue}>{tripStops?.[tripStops.length - 1]?.address || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('distance')}</Text>
              <Text style={styles.detailValue}>{formatDistance(tripDistance)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('duration')}</Text>
              <Text style={styles.detailValue}>{formatDuration(tripDuration)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('driver_name')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.driverInfo?.driverName || defaultDriverInfo.driverName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('vehicle_number')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.driverInfo?.vehicleNumber || defaultDriverInfo.vehicleNumber}</Text>
            </View>
          </View>

          {/* Invoice Breakdown */}
          <View style={styles.invoiceBreakdown}>
            <Text style={styles.sectionTitle}>{t('invoice_breakdown')}</Text>

            {/* Ride Cost */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Ride Cost</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(rideCost)}</Text>
            </View>

            {/* Waiting Cost */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Waiting Cost</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(waitingCost)}</Text>
            </View>

            {/* Coupon Discount */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Coupon Discount</Text>
              <Text style={styles.breakdownValue}>-{formatCurrency(couponDiscount).replace('₹', '')}</Text>
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
                    {/* Fee Total, if available and different */}
                    {/* {typeof feeObj?.total === 'number' && feeObj.total !== feeObj?.feeAmount && (
                      <View style={styles.taxRow}>
                        <Text style={styles.taxLabel}>{humanizeKey(feeKey)} Total</Text>
                        <Text style={styles.taxValue}>{formatCurrency(feeObj.total)}</Text>
                      </View>
                    )} */}
                  </View>
                ))}
              </View>
            )}

            {/* Grand Total */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('total') || 'Total'}</Text>
              <Text style={styles.totalValue}>{formatCurrency(mergedRideData.finalFare || 0)}</Text>
            </View>
          </View>

          {/* Payment Info
          <View style={styles.paymentInfo}>
            <Text style={styles.sectionTitle}>{t('payment_info')}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('payment_method')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.paymentMethod}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('payment_status')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.passengerPaymentStatus?.toUpperCase() || 'PENDING'}</Text>
            </View>
          </View> */}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.downloadButton} onPress={handleMultiSheetPDF}>
            <MaterialIcons name="file-download" size={24} color={colors.white} />
              <Text style={styles.downloadButtonText}> {t('download_invoice')}</Text>
            </TouchableOpacity>
            
            {/* <TouchableOpacity style={styles.emailButton} onPress={handleEmailInvoice}>
              <Text style={styles.emailButtonText}><MaterialIcons name="email" size={16} color="#2196F3" /> {t('email_invoice')}</Text>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    shadowColor: colors.black,
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
    color: colors.blue,
    marginBottom: 4,
  },
  invoiceDate: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
  },
  carImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.blue_light,
    borderRadius: 30,
  },
  infoSection: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  companyInfo: {
    flex: 1,
    backgroundColor: colors.white,
    gap:5,
    borderRadius: 10,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  customerInfo: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap:5
  },
  sectionTitle: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.grey_xxdark,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  companyName: {
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
    color: colors.black,
    marginBottom: 4,
  },
  companyAddress: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
    marginBottom: 4,
  },
  companyContact: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: colors.grey_xxdark,
 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  companyEmail: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: colors.grey_xxdark,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companyGstin: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.grey_xxdark,
    marginBottom: 2,
  },
  customerName: {
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
    color: colors.black,
    marginBottom: 4,
  },
  customerAddress: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
    marginBottom: 4,
  },
  customerContact: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerEmail: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripDetails: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
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
    borderBottomColor: colors.grey_light,
  },
  detailLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  detailValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
    textAlign: 'right',
    flex: 1,
  },
  invoiceBreakdown: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
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
    borderBottomColor: colors.grey_light,
  },
  breakdownLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  breakdownValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
    textAlign: 'right',
    flex: 1,
  },
  totalValue: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: colors.green,
    textAlign: 'right',
    flex: 1,
  },
  paymentInfo: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
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
    backgroundColor: colors.black,
   
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
    color: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emailButton: {
    flex: 1,
    backgroundColor: colors.white,
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
    borderBottomColor: colors.grey_light,
  },
  taxLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.grey_xxdark,
    flex: 1,
  },
  taxValue: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: colors.grey_xxdark,
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