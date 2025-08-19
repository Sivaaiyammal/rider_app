import React from 'react';
import { ScrollView, View, StyleSheet, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import NavBar from '../../../components/NavBar';
import { Fonts, colors } from '../../../constants/constants';
import PDFGenerator from '../../../utils/PDFGenerator';

const ReceiptScreen = ({ TripData, visible, onClose }) => {
  const { t } = useTranslation();
  const { goBack } = useStackScreenStore();
  
  // Use the actual trip data or dummy data if not provided
  const rideData = TripData || {
    _id: 'TXN893221',
    fareDetails: { fare: 120.00 },
    estimatedFare: 120.00,
    bookingTime: new Date('2025-01-01T10:00:00').toISOString(),
    finalDistance: 7.2,
    finalDuration: 18,
    vehicleType: 'Urban Sedan',
    driverInfo: {
      driverName: 'Ezio Auditore',
      driverRating: 4.5,
      vehicleBrand: 'Toyota',
      vehicleModel: 'Camry',
      vehicleNumber: 'KA-01-AB-1234'
    },
    stops: [
      { name: 'Home', address: '123 Main Street, City' },
      { name: 'Virtualmaze', address: '456 Tech Park, City' }
    ],
    paymentMethod: 'Cash',
    passengerPaymentStatus: 'completed'
  };

  const handleBackPress = () => {
    if (onClose) {
      onClose();
    } else {
      goBack();
    }
  };

  const handleDownloadPDF = async () => {
    try {
      Alert.alert(
        'Download PDF',
        'Generating PDF receipt...',
        [{ text: 'OK' }]
      );
      
      // Generate PDF using the utility
      const pdfPath = await PDFGenerator.generateReceiptPDF(rideData);
      
      // Download the generated PDF
      const success = await PDFGenerator.downloadPDF(pdfPath);
      
      if (success) {
        Alert.alert(
          'Success',
          'PDF receipt downloaded successfully!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to download PDF receipt. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEmailReceipt = async () => {
    try {
      Alert.alert(
        'Email Receipt',
        'Preparing receipt for email...',
        [{ text: 'OK' }]
      );
      
      // Generate PDF using the utility
      const pdfPath = await PDFGenerator.generateReceiptPDF(rideData);
      
      // Share the generated PDF
      const success = await PDFGenerator.sharePDF(pdfPath);
      
      if (success) {
        Alert.alert(
          'Success',
          'Receipt prepared for email sharing!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to prepare receipt for email. Please try again.',
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
        <NavBar withBg onBackPress={handleBackPress} title={t('receipt')} />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Receipt Header with Car Image */}
        <View style={styles.receiptHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.receiptTitle}>{t('receipt')}</Text>
            <Text style={styles.receiptDate}>{formatDate(rideData.bookingTime)}</Text>
          </View>
         
        </View>

        {/* Total Amount */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>{t('total')}</Text>
          <Text style={styles.totalAmount}>{formatCurrency(rideData.fareDetails?.fare || rideData.estimatedFare)}</Text>
        </View>

        {/* Receipt Details */}
        <View style={styles.receiptDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('trip_charge')}</Text>
            <Text style={styles.detailValue}>{formatCurrency(rideData.fareDetails?.fare || rideData.estimatedFare)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('subtotal')}</Text>
            <Text style={styles.detailValue}>{formatCurrency((rideData.fareDetails?.fare || rideData.estimatedFare) * 0.93)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('tax')}</Text>
            <Text style={styles.detailValue}>{formatCurrency((rideData.fareDetails?.fare || rideData.estimatedFare) * 0.07)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('payment')}</Text>
            <Text style={styles.detailValue}>{rideData.paymentMethod}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('transaction_id')}</Text>
            <Text style={styles.detailValue}>#{rideData._id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('distance')}</Text>
            <Text style={styles.detailValue}>{formatDistance(rideData.finalDistance)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('duration')}</Text>
            <Text style={styles.detailValue}>{formatDuration(rideData.finalDuration)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('ride_type')}</Text>
            <Text style={styles.detailValue}>{rideData.vehicleType}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('start_location')}</Text>
            <Text style={styles.detailValue}>{rideData.stops?.[0]?.name || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('end_location')}</Text>
            <Text style={styles.detailValue}>{rideData.stops?.[rideData.stops.length - 1]?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('driver_name')}</Text>
          <Text style={styles.detailValue}>{rideData.driverInfo?.driverName}</Text>
             
          </View>
          
         
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
            <Text style={styles.downloadButtonText}>📄 {t('download_pdf')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailReceipt}>
            <Text style={styles.emailButtonText}>📋 {t('email_receipt')}</Text>
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
  receiptHeader: {
    backgroundColor: colors.black,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  receiptTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: colors.white,
    marginBottom: 8,
  },
  receiptDate: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.grey_xxdark,
  },
  carImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carEmoji: {
    fontSize: 40,
  },
  totalContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  totalLabel: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: colors.black,
    marginBottom: 8,
  },
  totalAmount: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: colors.green,
  },
  receiptDetails: {
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
    paddingVertical: 12,
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
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: colors.black,
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
  },
  downloadButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#FF4444',
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
  },
  emailButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#2196F3',
  },
});

ReceiptScreen.propTypes = {
  TripData: PropTypes.object,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default ReceiptScreen; 