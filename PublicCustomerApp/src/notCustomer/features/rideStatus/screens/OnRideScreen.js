import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal } from 'react-native';
import {Fonts} from '../../../constants/constants';

import Icon from 'react-native-vector-icons/MaterialIcons';
import useAssignedDriverInfoStore from '../store/useAssignedDriverInfoStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import {utils} from '../../../utils/Utils';
import { colors } from '../../../constants/constants';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import useWayPointReorderStore from '../../../features/booking/store/useWayPointReorderStore';
import { useTranslation } from 'react-i18next';
import {height} from "../../../utils/Utils";
import TripDetailsModal from '../../../components/TripDetailsModal';
import StatusConatainerWrapper from '../component/StatusConatainerWrapper';
import useRouteDraw from '../hooks/useRouteDraw';
import useDrawStopsPolyline from '../hooks/useDrawStopsPolyline';
import PropTypes from 'prop-types';
import useStopsMarkerHook from '../hooks/useStopsMarkerHook';
import AdaptiveText from '../../../components/Common/AdaptiveText';
import SOSModal from '../component/SOSModal';
import BackgroundLocationPreInfoModal from '../component/BackgroundLocationPreInfoModal';
import { DataStore } from '../../../controllers/DataStore';
import PREF from '../../../storage/PREF';
import { RequestBackgroundLocationPermission } from '../../../controllers/PermissionHandler';
import TripPersonVehicle from '../../rideHistory/components/TripPersonVehicle';
import useUserInfoStore from '../../../../common/store/useUserInfoStore';
import { getPresignedImageUrl } from '../../../../common/utils/getPresignedImageUrl';
import { useStackScreenStore } from '../../../store/useStackScreenStore';

const OnRideScreen = ({onPaymentMethodChange,onCancel,handleOverlay}) => {
  const {driverName,vehicleNumber,model,brand,color,driverPhoto,driverLatitude,driverLongitude,driverAngle} = useAssignedDriverInfoStore();
  const {stops,duration,totalDistance,vehicleType,paymentMethod,estimatedFare,tripId,passengerNotificationPreferences} = useCurrentRideInfoStore();
  const {waitingForDriverApproval} = useWayPointReorderStore();
  const { setStackScreen } = useStackScreenStore();
  const currentStop = useMemo(() => stops?.find(item => item.isReached === false) || null, [stops]);
  const {t} = useTranslation();
  const { userdetails } = useUserInfoStore();
  const userToken = userdetails?.token || null;
  
  const {stopspolyline} = useDrawStopsPolyline();
  useStopsMarkerHook(stops,driverLatitude,driverLongitude,vehicleType,"drop",driverAngle);
  const {estimatedDuration,SetViewBoundingBox} = useRouteDraw({destinationlat:currentStop?.location[1],destinationlon:currentStop?.location[0],driverLat:driverLatitude,driverLon:driverLongitude,remainingStops: stopspolyline})  
  const animation = useRef(new Animated.Value(0)).current;
  
  const isElectricVehicle = vehicleType == "ELECTRIC_AUTO" || vehicleType == "ELECTRIC_BIKE" || vehicleType == "ELECTRIC_HATCHBACK" || vehicleType == "ELECTRIC_SEDAN" || vehicleType == "ELECTRIC_SUV" || vehicleType == "ELECTRIC_EXSEDAN";

  const [expanded, setExpanded] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showPreInfo, setShowPreInfo] = useState(false);
  const [sosPreset, setSosPreset] = useState(false);
  const [driverPhotoUri, setDriverPhotoUri] = useState(null);
  const [isDriverPhotoLoading, setIsDriverPhotoLoading] = useState(false);
  // Removed driverPhotoCacheRef: always fetch driver photo via API call
  const toggleExpand = () => {
    console.log("toggleExpand",expanded);
    expanded ? handleOverlay('close') : handleOverlay('open');
    setExpanded(prev => !prev);
  };

  useEffect(() => {
    setTimeout(() => {
      SetViewBoundingBox()
    }, 1000)
  }, [stops])

  useEffect(() => {
    const setinterval = setInterval(() => {
      SetViewBoundingBox()
    }, 15000); 
    return () => clearInterval(setinterval);
  }, []);

  useEffect(() => {
    (async () => {
      try{
        const val = await DataStore.loadData(PREF.SOS_EVENTID);
        if (val && val.data) {
          setSosPreset(true);
          setShowSOS(true);
        }
      }catch(e){
        // ignore
      }
    })();
  }, []);

  
  const chevronRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const ArrivalTime =utils.getTimeAfterMinutes(estimatedDuration)
  
  const iswaypoint = stops.length > 2;

  useEffect(() => {
    let isActive = true;

    const resolveDriverPhoto = async () => {
      const trimmed = driverPhoto?.trim();
      if (!trimmed) {
        setDriverPhotoUri(null);
        setIsDriverPhotoLoading(false);
        return;
      }

      const normalizedKey = trimmed.replace(/^https?:\/\/[^/]+\/?/, '').replace(/^\//, '');

      if (!normalizedKey || !userToken) {
        setDriverPhotoUri(null);
        setIsDriverPhotoLoading(false);
        return;
      }

      try {
        setIsDriverPhotoLoading(true);
        const signedUrl = await getPresignedImageUrl(normalizedKey, userToken);
        if (!isActive) {
          return;
        }
        setDriverPhotoUri(signedUrl || null);
      } catch (error) {
        if (isActive) {
          setDriverPhotoUri(null);
        }
      } finally {
        if (isActive) {
          setIsDriverPhotoLoading(false);
        }
      }
    };

    resolveDriverPhoto();

    return () => {
      isActive = false;
    };
  }, [driverPhoto, userToken]);


  const onSOSClick = async () => {
    setShowPreInfo(true);
  }

  const handlePreInfoProceed = async () => {
    setShowPreInfo(false);
    const granted = await RequestBackgroundLocationPermission();
    if (granted) {
      setShowSOS(true);
    }
  }
  
  return (
    <>
     
      <StatusConatainerWrapper backgroundColor='black' onMapIconPress={()=>{SetViewBoundingBox()}} onSOSClick={onSOSClick}>

      
      <View style={[styles.containerTop,{backgroundColor:'black'}]}>
       
        <AdaptiveText style={styles.topBarText}>{t(!iswaypoint ? 'reach_your_destination_in' : 'reach_your_waypoints_in',{stop:currentStop?.name})}</AdaptiveText>
        <View style={styles.timeBox}>
          <AdaptiveText style={styles.timeText}>{estimatedDuration} {estimatedDuration == 1 ? 'Min' : 'Mins'}</AdaptiveText>
            </View>
        
    </View>

   
      <View style={[styles.root,{backgroundColor:'white'}]}>

      {/* Card */}
     
        <View style={styles.vehicleDetailsContainer}>
          <TripPersonVehicle
            driverName={driverName}
            driverPhoto={driverPhotoUri || undefined}
            driverPhotoLoading={isDriverPhotoLoading}
            showDriverPhotoPlaceholder
            vehicleType={vehicleType}
            vehicleBrand={brand}
            vehicleModel={model}
            vehicleNumber={vehicleNumber}
            vehicleColor={color}
            isElectricVehicle={isElectricVehicle}
            descriptonSize={14}
          />
        </View>
        {/* Estimated amount */}
        <View style={styles.amountBox}>
          <FontAwesome name="receipt" size={20} color="#00770d" />
          <AdaptiveText style={styles.amountLabel}>{t('estimated_amount_to_be_paid')}</AdaptiveText>
          <AdaptiveText style={styles.amountValue}>₹{estimatedFare || "--"}</AdaptiveText>
        </View>

        <>
             
              <View style={styles.rideInfoRow}>
                <View style={styles.rideInfoItem}>
                  <AdaptiveText style={styles.rideInfoLabel}>{t('arrival')}</AdaptiveText>
                  <Text style={styles.rideInfoValue}>{ArrivalTime}</Text>
                </View>
                <View style={styles.divider}></View>
                <View style={styles.rideInfoItem}>
                  <AdaptiveText style={styles.rideInfoLabel}>{t('duration')}</AdaptiveText>
                  <Text style={styles.rideInfoValue}>{duration} {duration === 1 ? 'Min' : 'Mins'}</Text>
                </View>
                <View style={styles.divider}></View>
                <View style={styles.rideInfoItem}>
                  <AdaptiveText style={styles.rideInfoLabel}>{t('distance')}</AdaptiveText>
                  <Text style={styles.rideInfoValue}>{totalDistance} Km</Text>
                </View>
              </View>
            </>

        

       

               {/* Trip Details row with chevron */}
        <TouchableOpacity style={styles.tripDetailsRow} onPress={toggleExpand} activeOpacity={0.7}>
          <AdaptiveText style={styles.tripDetailsLabel}>{t('trip_details')}</AdaptiveText>
          <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
          {
            waitingForDriverApproval === "PENDING" &&
            <View style={styles.driverWaitingApprovalContainer}>
                <View style={styles.updateIconContainer}>
                  </View>
                  <Icon name="update" size={25} color={colors.grey_xxdark} />
              </View>
            }
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <Icon name="keyboard-arrow-right" size={25} color="#000" />
          </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Bills & Photos row */}
        <TouchableOpacity
          style={styles.tripDetailsRow}
          onPress={() => setStackScreen('BillsAndPhotosScreen', { tripId })}
          activeOpacity={0.7}>
          <AdaptiveText style={styles.tripDetailsLabel}>Bills & Photos</AdaptiveText>
          <Icon name="keyboard-arrow-right" size={25} color="#000" />
        </TouchableOpacity>

       

        {/* Payment method */}
     
      </View>
   

    {/* Bottom Modal for Trip Details */}
    {expanded && <TripDetailsModal
      visible={expanded}
      onClose={toggleExpand}
      stops={stops}
      waitingForDriverApproval={waitingForDriverApproval}
      height={height}
      onCancel={onCancel}
      onPaymentMethodChange={onPaymentMethodChange}
      paymentMethod={paymentMethod}
      notificationPreferences={passengerNotificationPreferences}
      t={t}
    />
    }
    </StatusConatainerWrapper>
    {showPreInfo && (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPreInfo}
        onRequestClose={() => setShowPreInfo(false)}
        presentationStyle="overFullScreen"
      >
        <BackgroundLocationPreInfoModal
          onClose={() => setShowPreInfo(false)}
          onProceed={handlePreInfoProceed}
        />
      </Modal>
    )}
    {showSOS && (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showSOS}
        onRequestClose={() => {}}
        presentationStyle="fullScreen"
      >
        <View style={{flex:1, backgroundColor:'white'}}>
          <SOSModal onClose={()=>setShowSOS(false)} presetTriggered={sosPreset} />
        </View>
      </Modal>
    )}
    
    </>
  );
};

OnRideScreen.propTypes = {
  onPaymentMethodChange: PropTypes.func,
  onCancel: PropTypes.func,
  handleOverlay: PropTypes.func,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 0,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap:5

  },
  containerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   
    paddingHorizontal: 15,
    paddingVertical: 10,
   
    zIndex: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  topBarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily:Fonts.regular,
  },
  timeBox: {
    backgroundColor: colors.grey+50,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timeText: {
    color: '#fff',
    fontFamily:Fonts.regular,
    fontSize: 15,
  },
  divider:{
    width:2,
    backgroundColor:"#eee",
    marginHorizontal:10
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: -20,
    width: '92%',
    alignSelf: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  onRideBadge: {
    position: 'absolute',
    right: 10,
    top: 0,
    backgroundColor: '#2563EB',
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  onRideBadgeText: {
    color: '#fff',
    fontFamily:Fonts.regular,
    fontSize: 14,
  },
  vehicleDetailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  amountBox: {
    backgroundColor: '#e3ffe6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00770d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginVertical: 8,
    marginHorizontal:20,
    borderStyle:'dashed',
    paddingLeft:20
  },
  amountIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  amountLabel: {
    color: '#333',
    fontSize: 14,
    flex: 1,
    fontFamily:Fonts.regular,
    paddingLeft:10
  },
  amountValue: {
    color: '#04713B',
    fontFamily:Fonts.medium,
    fontSize: 20,
    paddingRight:10
    
   
  },
  rideInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  rideInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  rideInfoLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
    fontFamily:Fonts.regular
  },
  rideInfoValue: {
    fontFamily:Fonts.regular,
    fontSize: 15,
    color:colors.grey_xxdark
  },
  tripDetailsRow: {
    width:'90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 14,
    backgroundColor:colors.grey,
    borderRadius:10,
   
    margin: 10,
    marginBottom:20,
  },
  tripDetailsLabel: {
    color: colors.black,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  stopsBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stopIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 2,
  },
  stopLabel: {
    fontFamily:Fonts.regular,
    fontSize: 15,
    color: '#222',
  },
  stopAddress: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
    maxWidth: 220,
  },
  paymentRow: {
    flex:1,
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
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  driverWaitingApprovalContainer:{
   
    alignItems:'center',
    justifyContent:'center',
   
    padding:5,
borderRadius: 12,
flexDirection:"row",




},
driverWaitingApprovalText:{
    fontSize:12,
    fontFamily:Fonts.medium,
    color:colors.grey_xxdark
},
dotsContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  
},
dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.orange,
  marginHorizontal: 4,
},
updateIconContainer:{
  position:'absolute',
  top:0,
  right:3,
  backgroundColor:'red',
  padding:3,

 
  borderRadius:10
  },



  });

export default OnRideScreen;
