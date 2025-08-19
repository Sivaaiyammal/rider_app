import React from 'react';
import { ScrollView, View, StyleSheet, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import NavBar from '../../../components/NavBar';
import { Fonts, colors } from '../../../constants/constants';
import PDFGenerator from '../../../utils/PDFGenerator';

const InvoiceScreen = ({ TripData, visible, onClose }) => {
  const { t } = useTranslation();
  const { goBack } = useStackScreenStore();
  
  // Use the actual trip data or dummy data if not provided
  const rideData = TripData || {};
  
  // Default values for missing properties
  const defaultCompanyInfo = {
    name: 'Namma Ooru Taxi',
    address: '789 Company Street, City, State - 654321',
    phone: '+91 1800 123 4567',
    email: 'support@nammaoorutaxi.com',
    gstin: '29ABCDE1234F1Z5'
  };
  
  const defaultCustomerInfo = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+91 98765 43210',
    address: '123 Customer Street, City, State - 123456'
  };
  
  const defaultDriverInfo = {
    driverName: 'Ezio Auditore',
    driverRating: 4.5,
    vehicleBrand: 'Toyota',
    vehicleModel: 'Camry',
    vehicleNumber: 'KA-01-AB-1234'
  };
  
  const defaultStops = [
    { name: 'Home', address: '123 Main Street, City' },
    { name: 'Virtualmaze', address: '456 Tech Park, City' }
  ];
  
  // Merge actual data with defaults
  const mergedRideData = {
    _id: rideData._id || 'INV893221',
    fareDetails: rideData.fareDetails || { fare: 120.00 },
    estimatedFare: rideData.estimatedFare || 120.00,
    bookingTime: rideData.bookingTime || new Date('2025-01-01T10:00:00').toISOString(),
    finalDistance: rideData.finalDistance || 7.2,
    finalDuration: rideData.finalDuration || 18,
    vehicleType: rideData.vehicleType || 'Urban Sedan',
    driverInfo: { ...defaultDriverInfo, ...rideData.driverInfo },
    stops: rideData.stops || defaultStops,
    paymentMethod: rideData.paymentMethod || 'Cash',
    passengerPaymentStatus: rideData.passengerPaymentStatus || 'completed',
    customerInfo: { ...defaultCustomerInfo, ...rideData.customerInfo },
    companyInfo: { ...defaultCompanyInfo, ...rideData.companyInfo }
  };

  const handleBackPress = () => {
    if (onClose) {
      onClose();
    } else {
      goBack();
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      Alert.alert(
        'Download Invoice',
        'Generating invoice PDF...',
        [{ text: 'OK' }]
      );
      
      // Generate PDF using the utility
      const pdfPath = await PDFGenerator.generateReceiptPDF(mergedRideData);
      
      // Download the generated PDF
      const success = await PDFGenerator.downloadPDF(pdfPath);
      
      if (success) {
        Alert.alert(
          'Success',
          'Invoice PDF downloaded successfully!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to download invoice PDF. Please try again.',
        [{ text: 'OK' }]
      );
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
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    return `${minutes} Mins`;
  };

  const formatDistance = (km) => {
    return `${km} Km`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleBackPress}
    >
      <View style={styles.container}>
        <NavBar withBg onBackPress={handleBackPress} title={t('invoice')} />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.invoiceTitle}>{t('invoice')}</Text>
              <Text style={styles.invoiceNumber}>#{mergedRideData._id}</Text>
              <Text style={styles.invoiceDate}>{formatDate(mergedRideData.bookingTime)}</Text>
            </View>
            <View style={styles.carImageContainer}>
              <MaterialCommunityIcons name="car" size={32} color={colors.blue} />
            </View>
          </View>

          {/* Company and Customer Info */}
          <View style={styles.infoSection}>
            <View style={styles.companyInfo}>
              <Text style={styles.sectionTitle}>{t('company_info')}</Text>
              <Text style={styles.companyName}>{mergedRideData.companyInfo.name}</Text>
              <Text style={styles.companyAddress}>{mergedRideData.companyInfo.address}</Text>
                <View style={styles.companyContactContainer}>
                <Ionicons name="call" size={20}color={'black'} />
                <Text style={styles.companyContact}> {mergedRideData.companyInfo.phone}</Text>
                </View>
                <View style={styles.companyContactContainer}>
                <MaterialIcons name="email" size={20} color={'black'} />
              <Text style={styles.companyEmail}> {mergedRideData.companyInfo.email}</Text>
              </View>
          
              <Text style={styles.companyGstin}>GSTIN: {mergedRideData.companyInfo.gstin}</Text>
            </View>
            
            <View style={styles.customerInfo}>
              <Text style={styles.sectionTitle}>{t('customer_info')}</Text>
              <Text style={styles.customerName}>{mergedRideData.customerInfo.name}</Text>
              <Text style={styles.customerAddress}>{mergedRideData.customerInfo.address}</Text>
              <View style={styles.customerContactContainer}>
              <Ionicons name="call" size={20} color={'black'} />
              <Text style={styles.customerContact}> {mergedRideData.customerInfo.phone}</Text>
              </View>
              <View style={styles.customerContactContainer}>
              <MaterialIcons name="email" size={20} color={'black'} />
              <Text style={styles.customerEmail}> {mergedRideData.customerInfo.email}</Text>
              </View>
            </View>
          </View>

          {/* Trip Details */}
          <View style={styles.tripDetails}>
            <Text style={styles.sectionTitle}>{t('trip_details')}</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('ride_type')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.vehicleType}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('start_location')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.stops?.[0]?.name || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('end_location')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.stops?.[mergedRideData.stops.length - 1]?.name || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('distance')}</Text>
              <Text style={styles.detailValue}>{formatDistance(mergedRideData.finalDistance)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('duration')}</Text>
              <Text style={styles.detailValue}>{formatDuration(mergedRideData.finalDuration)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('driver_name')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.driverInfo?.driverName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('vehicle_number')}</Text>
              <Text style={styles.detailValue}>{mergedRideData.driverInfo?.vehicleNumber}</Text>
            </View>
          </View>

          {/* Invoice Breakdown */}
          <View style={styles.invoiceBreakdown}>
            <Text style={styles.sectionTitle}>{t('invoice_breakdown')}</Text>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('base_fare')}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(100.00)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('distance_fare')}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(15.00)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('time_fare')}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(5.00)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('subtotal')}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(120.00)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('gst')} (5%)</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(6.00)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{t('total')}</Text>
              <Text style={styles.totalValue}>{formatCurrency(126.00)}</Text>
            </View>
          </View>

          {/* Payment Info */}
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
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadInvoice}>
              <Text style={styles.downloadButtonText}><MaterialIcons name="file-download" size={16} color="#FF4444" /> {t('download_invoice')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emailButton} onPress={handleEmailInvoice}>
              <Text style={styles.emailButtonText}><MaterialIcons name="email" size={16} color="#2196F3" /> {t('email_invoice')}</Text>
            </TouchableOpacity>
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
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: colors.black,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  companyName: {
    fontFamily: Fonts.bold,
    fontSize: 16,
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
    fontFamily: Fonts.bold,
    fontSize: 16,
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
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#FF4444',
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
    fontSize: 14,
    color: '#FF4444',
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
  }
});

InvoiceScreen.propTypes = {
  TripData: PropTypes.object,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default InvoiceScreen; 