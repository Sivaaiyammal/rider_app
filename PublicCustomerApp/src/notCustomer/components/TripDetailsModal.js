import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { Fonts, colors } from '../constants/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddressContainer from './Trips/AddressContainer';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AdaptiveText from './Common/AdaptiveText';
import useUserInfoStore from '../../common/store/useUserInfoStore';
import WarningModal from './WarningModal';
import useConfigStore from '../store/useConfigStore';
import { CUSTOMER_CANCEL_PENALTY_LIMIT } from '../Config/AppConfig';

const TripDetailsModal = ({ 
  visible, 
  onClose, 
  stops, 
  waitingForDriverApproval,
  children,
  height,
  onCancel,
  onPaymentMethodChange,
  paymentMethod,
 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {t}=useTranslation();
  const {cancelTripOccurance} = useUserInfoStore();
  const [showWarningModal, setShowWarningModal] = React.useState(false);
  const { appConfig } = useConfigStore();

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible && fadeAnim._value === 0) {
    return null;
  }

  const handleCancel=()=>{
    console.log("Cancel Trip pressed, occurance:", cancelTripOccurance);
    console.log("Penalty limit:", appConfig.CUSTOMER_CANCEL_PENALTY_LIMIT);
    console.log("Penalty enabled:", appConfig.CUSTOMER_CANCEL_PENALTY);
    if(cancelTripOccurance >= appConfig.CUSTOMER_CANCEL_PENALTY_LIMIT && appConfig.CUSTOMER_CANCEL_PENALTY){
     
      setShowWarningModal(true);
      return;
    }
    onCancel();
  }

  return (
    <Animated.View style={[
      styles.bottomModal, 
      { 
        height: height * 0.8,
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [height * 0.7, 0],
          })
        }]
      }
    ]}>
      <View style={styles.modalHeader}>
        <View style={styles.modalHandle} />
        <AdaptiveText style={styles.modalTitle}>{t('trip_details')}</AdaptiveText>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.modalContent} 
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {children}
        
        {/* Driver Approval Status */}
        {waitingForDriverApproval === "PENDING" && (
          <View style={styles.DriverApprovalContainer}>
            <AdaptiveText style={styles.DriverApprovalText}>
              Your Stops edit request is pending. Please wait for driver to approve your request
            </AdaptiveText>
          </View>
        )}
        
        {/* Address Container */}
        <AddressContainer directions={stops} edit={waitingForDriverApproval === "PENDING" ? false : true} live={true} fromDriverArrival={true}/>
        {/* <TouchableOpacity style={styles.paymentRow} onPress={onPaymentMethodChange}>
          <Text style={styles.paymentLabel}>{t('change_payment_method_label')}</Text>
          <View style={styles.paymentValueWrap}>
            <Text style={styles.paymentValue}>{paymentMethod}</Text>
            <Icon name="chevron-right" size={20} color="#888" />
          </View>
        </TouchableOpacity> */}
        <View style={styles.paymentRow}>
          <AdaptiveText style={styles.paymentLabel}>{t('payment_method_label')}</AdaptiveText>
          <AdaptiveText style={styles.paymentValue}>{paymentMethod}</AdaptiveText>
        </View>
     
       
      </ScrollView>
      <View style={styles.cancelBtnContainer}>  
          <TouchableOpacity style={styles.cancelBtn} onPress={()=>{
            handleCancel();
          }}>
          {/* <Icon name="close" size={25} color={colors.white} /> */}
          <AdaptiveText style={styles.cancelBtnText}>{t('cancel_trip')}</AdaptiveText>
        </TouchableOpacity>
        </View>
        <WarningModal
          visible={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          onConfirm={() => {
            setShowWarningModal(false);
            onCancel();
          }}
          title={t('cancel_trip_warning_title')}
          message={t('cancel_trip_warning_message')}
          confirmText={t('cancel_anyway')}
          closeText={t('back')}
        />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10000000,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    marginBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    textAlign: 'center',
    
  },
  closeButton: {
    padding: 10,
    position: 'absolute',
    right: 10,
    top: -60,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: 30,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  DriverApprovalContainer: {
    backgroundColor: colors.yellow_xxlight,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.grey_xxdark,
    borderStyle: 'dashed',
  },
  DriverApprovalText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
  },
  cancelBtnContainer: {
    width:'100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems:'flex-end',
    paddingHorizontal:20,
  
 
    
  },
  cancelBtn: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:10,
    width:'100%',
    borderWidth:1,
    borderColor: colors.red,
    borderRadius: 10,
    padding: 15,
    backgroundColor: colors.red,
  },
  cancelBtnText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.regular,
    color: colors.white,
  },
  paymentRow: {
    
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
    backgroundColor:"#eee",
    paddingHorizontal:10,
    marginBottom:10,
   
    borderRadius:10

  },
  paymentLabel: {
    color: '#222',
    fontSize: 16,
    fontFamily:Fonts.regular,
  },
  paymentValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentValue: {
    color: '#04713B',
    fontFamily:Fonts.regular,
    fontSize: 16,
    marginRight: 4,
  },
  paymentArrow: {
    color: '#888',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -2,
  },
});

TripDetailsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  stops: PropTypes.array.isRequired,
  waitingForDriverApproval: PropTypes.string,
  children: PropTypes.node,
  height: PropTypes.number.isRequired,
  onCancel: PropTypes.func.isRequired,
  onPaymentMethodChange: PropTypes.func.isRequired,
  paymentMethod: PropTypes.string.isRequired,
  
};

export default TripDetailsModal; 