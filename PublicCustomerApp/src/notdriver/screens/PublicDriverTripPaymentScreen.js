import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {  useEffect, useState } from 'react';
import Fontisto from 'react-native-vector-icons/Fontisto'
import * as Progress from 'react-native-progress';
import QRCode from "react-qr-code"
import Clipboard from '@react-native-clipboard/clipboard';
import polyline from '@mapbox/polyline'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather'
import useTripsStore from '../store/useTripsStore';
import useUserStore from '../../common/store/useUserStore';
import usePublicDriverStore from '../store/usePublicDriverStore';
import { useMapMarkerStore } from '../../common/store/useMapMarkerStore';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import BottomSheetPopup from '../../common/components/BottomSheetPopup';
import { showNotification } from '../../common/components/Alerts/showNotification';
import { Colors, Fonts } from '../../common/constants/constants';
import CustomeBottomSheet from '../../common/components/CustomeBottomSheet';
import { DateTimeFormatter } from '../../common/utils/DateTimeFormatter';
import AddressComponent from '../components/AddressComponent';
import Polyline from '../../common/map/Polyline';
import PaymentMethod from '../../notdriver/assets/icons/paymentMethod.svg'
import InvoiceScreen from './InvoiceScreen';

const paymentMethods = [
  {
    id: 1,
    name: 'Collected By Driver',
    value: 0
  },
  {
    id: 2,
    name: 'Sent To Vendor',
    value: 1
  }
]

  const formatDistance = (km) => {
    if (km === null || km === undefined || km < 0 || typeof km === 'object') return '0.00 Km';
    return `${parseFloat(km).toFixed(1)} Km`;
  };

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined || minutes < 0) return '0 Mins';
  return `${minutes} Mins`;
};

const PublicDriverTripPaymentScreen = ({onPaymentReceive, fareDetails, tripDetials, isLoading, isDetailsScreen}) => {
  const {activeTripData, setActiveTripData,  fareBreakDown:rideFare } = useTripsStore();
  const {userInfo} = useUserStore()
  const {bankInfo, driverInfo}= usePublicDriverStore()
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [paymentMethodModalVisible, setPaymentMethodModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const {driverRole} = usePublicDriverStore()
  const {setGeometries, directionPoints, setDirectionPoints, setMapMarkers} = useMapMarkerStore();
  const [copiedText, setCopiedText] = useState(null);
  const {setStackScreen} = useStackScreenStore()
  const {showPaymentInitiatedLoader, setShowPaymentInitiatedLoader} = usePublicDriverStore()
  const [paymentTimer, setPaymentTimer] = useState(0);
  const [progress, setProgress] = useState(0);

  const t = {}

  const fareBreakDown = fareDetails ? fareDetails?.fareDetails : rideFare?.fareDetails;
  const tripId = fareDetails ? fareDetails?.tripId : activeTripData?.[0]?._id;
  const rideId = tripDetials?.rideId ? tripDetials?.rideId : activeTripData?.[0]?.rideId;
  const feesBreakDown = fareBreakDown?.breakdown?.fees;
  const taxBreakDown = fareBreakDown?.breakdown?.taxes;
  const driverEarnings = fareBreakDown?.breakdown?.driverEarnings;
  const driverDue = fareBreakDown?.breakdown?.driverDue;
  const finalFare = fareBreakDown?.breakdown?.finalFare;
  const couponDiscount = fareBreakDown?.breakdown?.couponDiscount;
  const subtotal = fareBreakDown?.breakdown?.subtotal;
  const distance = rideFare ? activeTripData?.[0]?.finalDistance : tripDetials?.finalDistance;
  const duration = rideFare ? activeTripData?.[0]?.finalDuration : tripDetials?.finalDuration;
  const fare = fareBreakDown?.fare;

  const supplierInfo = rideFare?.supplierInfo ? {
    name: rideFare.supplierInfo.VendorName,
    phone: rideFare.supplierInfo.ownerPhone,
    email: rideFare.supplierInfo.ownerEmail,
    state: rideFare.supplierInfo.state,
    address: rideFare.supplierInfo.fullAddress,
    gstNumber: rideFare.supplierInfo.gst,
    panNumber: rideFare.supplierInfo.companyPANNumber,
  }: {
    name: driverInfo.name || 'N/A',
    phone: driverInfo.phone || 'N/A',
    email: driverInfo.email || 'N/A',
    state: driverInfo.homeLocation?.state || 'N/A',
    address: driverInfo.homeLocation?.address || 'N/A',
    gstNumber: driverInfo.gstNumber || 'N/A',
    panNumber: driverInfo.panNumber || 'N/A',
  };

  const recipient = tripDetials?.recipient ? tripDetials?.recipient : null

  const upiLink = `upi://pay?pa=${bankInfo?.UPIID}&pn=${encodeURIComponent(bankInfo?.accountHolderName)}&am=${fareBreakDown?.fare}&cu=INR`;
  const renderInvoiceModal = () => {
    return (
      <BottomSheetPopup
      visible={isInvoiceModalVisible}
      onClose={() => {
        setIsInvoiceModalVisible(false)
      }}
      driverStyles>
      <View style={styles.centeredView}>
       <InvoiceScreen fareDetails={fareBreakDown} onClose={()=>setIsInvoiceModalVisible(false)} distance={distance} duration={duration} tripDetials={tripDetials} supplierInfo={supplierInfo} recipient={recipient}/>
      </View>
      </BottomSheetPopup>
    )
  }

  const onSubmitPaymentMethod = () => {
    if(selectedPaymentMethod === null) {
      showNotification(t.please_select_a_payment_method, '', 'danger')
      return
    }
    onPaymentReceive(fareBreakDown, selectedPaymentMethod, selectedPaymentMethod)
    setPaymentMethodModalVisible(false)
  }

  const renderPaymentMethodModal = () => {
    return (
      <BottomSheetPopup
      visible={paymentMethodModalVisible}
      onClose={() => {
        setPaymentMethodModalVisible(false)
      }}
      driverStyles>
        <View style={styles.paymentMethodContainerModal}>
          {paymentMethods.map((item, index) => (
            <TouchableOpacity key={index} style={styles.paymentMethodContainer} onPress={()=>setSelectedPaymentMethod(item.value)}>
              <Fontisto name={selectedPaymentMethod === item.value ? "radio-btn-active" : "radio-btn-passive"} size={24} color={selectedPaymentMethod === item.value ? Colors.periwinkle : Colors.grey_xdark} />
              <Text style={{fontFamily: Fonts.medium, fontSize: 16, color:selectedPaymentMethod === item.value ? Colors.periwinkle : Colors.black}}>{item.name}</Text>
            </TouchableOpacity>
          ))}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
            <TouchableOpacity 
              style={[styles.button, {backgroundColor: Colors.grey_xdark}]} 
              onPress={() => setPaymentMethodModalVisible(false)}>
              <Text style={styles.textStyle}>{t.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, {backgroundColor: Colors.periwinkle}]} 
              onPress={onSubmitPaymentMethod}>
              <Text style={styles.textStyle}>{t.submit}</Text>
            </TouchableOpacity>
          </View>
        </View>
       
    </BottomSheetPopup>
    )
  }

  useEffect(() => {
    let polylineData = null;
    if (activeTripData?.[0]?.encodedPolyline) {
        const decodedData = polyline.decode(activeTripData?.[0]?.encodedPolyline, 6);
        const reversedCoordinates = decodedData.map(([lat, lon]) => [lon, lat]);
        polylineData = new Polyline(
          1,
          `routes`,
          reversedCoordinates,
          "#174EA6",
          'small',
        );
        polylineData.setPadding([200, 230, 200, 400]);
        polylineData.setFocus(true);
        setGeometries([polylineData]);
        const startLocation = reversedCoordinates?.[0];
        const endLocation = reversedCoordinates?.[reversedCoordinates?.length - 1];
        // console.log('startLocation', startLocation);
        // console.log('endLocation', endLocation);
        // const startMarker = new Marker(
        //   'startMarker',
        //   'startMarker',
        //   startLocation[0],
        //   startLocation[1],
        //   'start_marker',
        //   36,
        //   false,
        // );
        // const endMarker = new Marker(
        //   'endMarker',
        //   'endMarker',
        //   endLocation[0],
        //   endLocation[1],
        //   'end_marker',
        //   36,
        //   false
        // );
        // setMapMarkers([startMarker, endMarker])
    }
    if (directionPoints) {
      setDirectionPoints(null)
    }
    return () => {
      setDirectionPoints(null)
      setGeometries(null)
      setMapMarkers(null)
    }
  }, [activeTripData, directionPoints])

  const copyToClipboard = (upiId) => {
    Clipboard.setString(upiId);
  };

  useEffect(() => {
    const DURATION_MS = 15000;
    let intervalId;
    let start = Date.now();
    if (isDetailsScreen) return;
    if (showPaymentInitiatedLoader) {
      setPaymentTimer(0);
      setProgress(0);
      intervalId = setInterval(() => {
        const elapsed = Date.now() - start;
        const p = Math.min(elapsed / DURATION_MS, 1);
        setProgress(p);
        const secs = Math.min(Math.ceil(elapsed / 1000), 15);
        setPaymentTimer(secs);
        if (elapsed >= DURATION_MS) {
          clearInterval(intervalId);
          // Auto-close modal on completion
          try { setShowPaymentInitiatedLoader(false); } catch (e) {}
        }
      }, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showPaymentInitiatedLoader]);

  const renderPaymentModal = () => {
    return (
      <Modal visible={true} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Payment Initiated</Text>
            <View>
              <Progress.Circle size={120} thickness={8} progress={progress} color={Colors.periwinkle} unfilledColor="#EEEEEE" borderWidth={0} showsText={false} />
              <View style={styles.progressTextOverlay}>
                <Text style={styles.progressText}>{Math.max(0, 15 - paymentTimer)}s</Text>
              </View>
            </View>
            <Text style={styles.progressSubtitle}>Please wait while we process…</Text>
            <Text style={styles.progressSubtitle}>Please do not close the app, or Go back</Text>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <>
    {showPaymentInitiatedLoader &&
    <View style={{position:'absolute', width:'100%', height:'100%', zIndex:99999, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.5)'}}>
      {renderPaymentModal()}
    </View>
    }
    <View style={styles.Container}>
      <CustomeBottomSheet useScrollView={true}>
        {/* <RevenueSlip earnings={100} commission={10} tds={1} /> */}
        <View style={{paddingBottom: 100}}>
        <View style={styles.fareContainer}>
          <ImageBackground
            source={require('../../common/assets/images/rideFareBackground.webp')}
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            resizeMode="cover">
            <View>
              <Text style={styles.fareTxtTitle}>{t.ride_fare}</Text>
              <Text style={styles.fareTxt}>
                {' '}
                {'₹'} {fareBreakDown?.fare}.
                <Text style={{fontSize: 16}}>00</Text>{' '}
              </Text>
            </View>
          </ImageBackground>
        </View>
         
        <Text style={styles.bookingTime}>
          {DateTimeFormatter.formatTime(activeTripData?.[0]?.bookingTime || tripDetials?.bookingTime)}
        </Text>
        <Text style={styles.bookingId}>Ride ID: {rideId}</Text>
         <TouchableOpacity style={styles.powerOffBtn} onPress={() => setStackScreen('DriverHelpSupport')}>
                  <MaterialIcons name="support-agent" size={24} color={Colors.black} />
                  <Text style={styles.helpText}>HELP</Text>
                </TouchableOpacity>
        <Text style={[styles.bookingTime, {marginTop: 10}]}>
          {t.location_details}
        </Text>
        <View style={styles.dotSeperator} />
        <AddressComponent
          percentage={0}
          waypoints={activeTripData?.[0]?.stops || tripDetials?.stops}
          deviceLocation={null}
          isPublicRides={true}
        />
        <View style={styles.cardsContainer}>
          {/* Distance Card */}
          <View style={[styles.infoCard, styles.distanceCard]}>
            <View style={styles.cardIconContainer}>
              <Feather name="map-pin" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.cardValue}>
              {distance ? formatDistance(distance) : '0.00 km'}
            </Text>
            <Text style={styles.cardLabel}>{t.distance || 'Distance'}</Text>
          </View>

          {/* Duration Card */}
          <View style={[styles.infoCard, styles.durationCard]}>
            <View style={styles.cardIconContainer}>
              <Feather name="clock" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.cardValue}>
              {duration ? formatDuration(duration) : '0 Mins'}
            </Text>
            <Text style={styles.cardLabel}>{t.duration || 'Duration'}</Text>
          </View>

          {/* Fare Card */}
          <View style={[styles.infoCard, styles.fareCard]}>
            <View style={styles.cardIconContainer}>
              <FontAwesome name="rupee" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.cardValue}>
              ₹{fare ? parseFloat(fare).toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.cardLabel}>{t.fare || 'Fare'}</Text>
          </View>
        </View>
        <Text style={[styles.bookingTime, {marginTop: 10}]}>
          {t.payment_details}
        </Text>
        <View style={styles.dotSeperator} />
        <View style={styles.feesBreakDownContainer}>
      
        
          {couponDiscount !== null && couponDiscount > 0 && (
           <View style={styles.feesBreakDown}>
            <Text style={[styles.amountKey, {fontFamily: Fonts.medium, }]}>
            {t.coupon}
            </Text>
            <Text style={[styles.amountValue, {fontFamily: Fonts.medium,}]}>
             - ₹{taxBreakDown?.couponDiscount?.toFixed(2)}
            </Text>
          </View>
          )}
          
          <View style={styles.feesBreakDown}>
            <Text style={[styles.amountKey, {fontFamily: Fonts.medium,color:Colors.red}]}>
            {t.due}
            </Text>
            <Text style={[styles.amountValue, {fontFamily: Fonts.medium,color:Colors.red}]}>
              ₹{driverDue?.toFixed(2)}
            </Text>
          </View>
            <View style={styles.feesBreakDown}>
            <Text style={[styles.amountKey, {fontFamily: Fonts.medium, color:Colors.green}]}>
            {t.earnings}
            </Text>
            <Text style={[styles.amountValue, {fontFamily: Fonts.medium, color:Colors.green}]}>
              ₹{driverEarnings?.toFixed(2)}
            </Text>
          </View>
        
          <View style={styles.feesBreakDown}>
            <Text style={[styles.amountKey, {fontFamily: Fonts.medium,color:Colors.black}]}>
            {t.subtotal}
            </Text>
            <Text style={[styles.amountValue, {fontFamily: Fonts.medium,color:Colors.black}]}>
              ₹{subtotal?.toFixed(2)}
            </Text>
          </View>
          <View style={styles.feesBreakDown}>
            <View>
            <Text style={[styles.amountKey, {fontFamily: Fonts.semi_bold, fontSize:16, color:Colors.periwinkle}]}>
            {t.total}
            </Text>
            <Text style={[styles.amountKey, {fontFamily: Fonts.medium,color:Colors.black}]}>(inclusive of tax)</Text>
            </View>
            
            <Text style={[styles.amountValue, {fontFamily: Fonts.semi_bold, fontSize:16, color:Colors.periwinkle}]}>
             ₹{finalFare?.toFixed(2)}
            </Text>
          
          </View>
          <TouchableOpacity style={styles.viewDetailedBtn} onPress={()=>{setIsInvoiceModalVisible(true)}}>
                <Text style={styles.viewDetailedBtnText}>{t.view_detailed}</Text>
              </TouchableOpacity>
           {!fareDetails && (
            <>
           <View style={[styles.feesBreakDown, {borderTopWidth:1, borderColor:Colors.grey_xdark, paddingTop:10}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <PaymentMethod />
              <Text
                style={[
                  styles.amountValue,
                  {fontFamily: Fonts.regular, bottom: 1},
                ]}>
                {t.payment_method}
              </Text>
            </View>
            <Text
              style={[
                styles.amountValue,
                {fontFamily: Fonts.regular, color: '#299865'},
              ]}>
              {activeTripData?.[0]?.paymentMethod || tripDetials?.paymentMethod}
            </Text>
          </View>
          <Text style={styles.FareAmnt}>₹ {fareBreakDown?.fare?.toFixed(2)}</Text>
          <View style={styles.QrCodeView}>
          <QRCode value={upiLink} size={200} />
          </View>
          <TouchableOpacity style={styles.upiCopyBtn} onPress={()=>copyToClipboard(bankInfo?.UPIID)}>
            <Text style={styles.upiCopyBtnText}>{bankInfo?.UPIID}</Text>
            <Feather name="copy" size={16}/>
          </TouchableOpacity>
          <TouchableOpacity disabled={isLoading} style={styles.receiveBtn} onPress={()=>{driverRole === 'dco' ?onPaymentReceive(fareBreakDown, selectedPaymentMethod, selectedPaymentMethod) : setPaymentMethodModalVisible(true)}}>
            {isLoading? <ActivityIndicator color={Colors.white}/>: <Text style={styles.receiveBtnTxt}>{t.payment_received}</Text>}
          </TouchableOpacity>
            </>
           )  }
        </View>
        </View>

      </CustomeBottomSheet>
      {isInvoiceModalVisible && renderInvoiceModal()}
      {paymentMethodModalVisible && renderPaymentMethodModal()}
    </View>
     </>
  );
};

export default PublicDriverTripPaymentScreen;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  fareContainer: {
    width: '90%',
    alignSelf: 'center',
    height: 100,
    marginBottom: 20,
    overflow: 'hidden',
    borderRadius: 10,
  },
  fareTxtTitle: {
    fontFamily: Fonts.light,
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
  },
  fareTxt: {
    fontFamily: Fonts.medium,
    color: Colors.white,
    textAlign: 'center',
    fontSize: 28,
  },
  bookingTime: {
    fontFamily: Fonts.medium,
    color: Colors.black,
    fontSize: 16,
    textAlign: 'center',
  },
  bookingId: {
    fontFamily: Fonts.light,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 5,
  },
  dotSeperator: {
    width: '30%',
    borderBottomWidth: 2,
    borderStyle: 'dotted',
    alignSelf: 'center',
    marginVertical: 10,
  },
  feesBreakDownContainer: {
    width: '80%',
    alignSelf: 'center',
  },
  feesBreakDown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  amountKey: {
    fontFamily: Fonts.medium,
    color: Colors.black,
    fontSize: 14,
  },
  QrCodeView:{
    alignSelf:'center',
    marginTop:20
  },
  upiCopyBtn:{
    width:'80%',
    backgroundColor:'#EEEEEE',
    marginTop:15,
    borderRadius:30,
    paddingVertical:10,
    alignItems:'center',
    justifyContent:'space-between',
    flexDirection:'row',
    paddingHorizontal:10,
    alignSelf:'center',
  },
  receiveBtn:{
    backgroundColor:Colors.black,
    borderRadius:20,
    paddingVertical:10,
    alignItems:'center',
    marginBottom:80,
    marginTop:30
  },
  upiCopyBtnText:{
    fontFamily:Fonts.regular,
    fontSize:14,
  },
  receiveBtnTxt:{
    fontFamily:Fonts.regular,
    fontSize:16,
    color:Colors.white
  },
  amountValue:{
    fontFamily:Fonts.medium
  },
  FareAmnt:{
    fontFamily:Fonts.semi_bold,
    fontSize:22,
    color:Colors.periwinkle,
    textAlign:'center'
  },
  viewDetailedBtn:{
    backgroundColor:Colors.periwinkle,
    borderRadius:20,
    paddingVertical:10,
    alignItems:'center',
    marginBottom:80,
    marginTop:10,
  },
  viewDetailedBtnText:{
    fontFamily:Fonts.regular,
    fontSize:16,
    color:Colors.white
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '80%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  progressTitle: {
    fontFamily: Fonts.semi_bold,
    fontSize: 18,
    color: Colors.black,
    marginBottom: 12,
  },
  progressSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#757575',
    marginTop: 12,
  },
  progressTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.black,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '45%',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 10,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
    justifyContent: 'center',
  },
  distanceCard: {
    backgroundColor: '#4A90E2', // Blue
  },
  durationCard: {
    backgroundColor: '#50C878', // Green
  },
  fareCard: {
    backgroundColor: '#FF6B6B', // Red/Coral
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  paymentMethodContainer:{
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.grey_xdark,
    borderRadius: 10,
    width: '100%',
    gap: 10,
  },
  paymentMethodContainerModal:{
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 10,
    gap: 10,
    backgroundColor: Colors.white,
  },
  powerOffBtn:{
    alignSelf:'center',
    padding:10,
    backgroundColor:Colors.white,
    borderRadius:8,
    marginVertical:10,
    borderWidth:1,
    flexDirection:'row',
    alignItems:'center',
    gap:5
  },
helpText:{
    fontFamily:Fonts.semi_bold,
    fontSize:16,
    color:Colors.black
},
paymentTimer:{
    width:'90%',
    height:100,
    backgroundColor:Colors.white,
    alignSelf:'center',
},
});
