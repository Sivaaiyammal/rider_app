import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { getVehicleImage } from '../types/vehicleImd';
import {Fonts} from '../../../constants/constants';
import AddressContainer from '../../../components/Trips/AddressContainer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useAssignedDriverInfoStore from '../store/useAssignedDriverInfoStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import useTrackHook from '../hooks/useTrackHook';
import {utils} from '../../../utils/Utils';
import useMapStyleStore from '../../../store/useMapStyleStore'; 
import { colors } from '../../../constants/constants';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import useWayPointReorderStore from '../../../features/booking/store/useWayPointReorderStore';
const OnRideScreen = ({onPaymentMethodChange,onCancel}) => {
  const {driverName,vehicleNumber,model,brand,driverPhoto} = useAssignedDriverInfoStore();
  const {stops,duration,totalDistance,vehicleType,paymentMethod,estimatedPickuoMins,estimatedFare} = useCurrentRideInfoStore();
  const {waitingForDriverApproval} = useWayPointReorderStore();
  useEffect(()=>{
    console.log("waitingForDriverApproval",waitingForDriverApproval)
  },[waitingForDriverApproval])
  const {setMapStyle} = useMapStyleStore();
 
  const { cleanupMarkers } = useTrackHook('on-ride');

  
  
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      cleanupMarkers();
    };
  }, [cleanupMarkers]);

  const toggleExpand = () => {
    setExpanded(prev => {
      Animated.timing(animation, {
        toValue: prev ? 0 : 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
      return !prev;
    });
  };

  useEffect(() => {
    setMapStyle({
      width: "100%",
      height: "60%",
    });

    return () => {
      setMapStyle({
        width: "100%",
        height: "100%",
      });
    }
  }, [])

  const AnimatedDots = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      const animateDots = () => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animateDots());
      };
  
      animateDots();
    }, [dot1, dot2, dot3]);
  }

 
  const chevronRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const ArrivalTime =utils.getTimeAfterMinutes(estimatedPickuoMins)

  // Check if driver photo URL is valid
  const driverPhotoUri = driverPhoto && driverPhoto.trim() !== '' ? driverPhoto : null;
  
  return (
    <>
      {/* Top info bar */}
      <View style={[styles.containerTop,{backgroundColor:'#0f223c'}]}>
       
        <Text style={styles.topBarText}>Reach your destination in</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{estimatedPickuoMins} Mins</Text>
            </View>
        
    </View>

    <View style={[styles.root,{backgroundColor:'white'}]}>

      {/* Card */}
     
        {/* Vehicle and driver images */}
        <View style={styles.imagesRow}>
        {getVehicleImage(vehicleType,styles.vehicleImg)}
          <View style={styles.driverImgWrap}>
            <Image source={{ uri: driverPhotoUri }} style={styles.driverImg} />
          </View>
          <View style={styles.onRideBadge}><Text style={styles.onRideBadgeText}>On Ride</Text></View>
        </View>
        {/* Driver and vehicle info */}
        <Text style={styles.driverName}>{driverName}</Text>
        <Text style={styles.vehicleDesc}>{brand} {model} · {vehicleNumber}</Text>
        {/* Estimated amount */}
        <View style={styles.amountBox}>
          <FontAwesome name="receipt" size={20} color="#00770d" />
          <Text style={styles.amountLabel}>Estimated Amount to be Paid</Text>
          <Text style={styles.amountValue}>₹{estimatedFare || "--"}</Text>
        </View>

        <>
             
              <View style={styles.rideInfoRow}>
                <View style={styles.rideInfoItem}>
                  <Text style={styles.rideInfoLabel}>Arrival</Text>
                  <Text style={styles.rideInfoValue}>{ArrivalTime}</Text>
                </View>
                <View style={styles.rideInfoItem}>
                  <Text style={styles.rideInfoLabel}>Duration</Text>
                  <Text style={styles.rideInfoValue}>{duration} Min</Text>
                </View>
                <View style={styles.rideInfoItem}>
                  <Text style={styles.rideInfoLabel}>Distance</Text>
                  <Text style={styles.rideInfoValue}>{totalDistance} Km</Text>
                </View>
              </View>
            </>

        

       

        {/* Trip Details row with chevron */}
        <TouchableOpacity style={styles.tripDetailsRow} onPress={toggleExpand} activeOpacity={0.7}>
          <Text style={styles.tripDetailsLabel}>Trip Details</Text>
          <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
          {
            waitingForDriverApproval === "PENDING" &&
            <View style={styles.driverWaitingApprovalContainer}>
                <Text style={styles.driverWaitingApprovalText}>Waiting for driver approval</Text>
                <AnimatedDots />
            </View>
          }
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <Icon name="keyboard-arrow-right" size={25} color="#000" />
          </Animated.View>
          </View>
        </TouchableOpacity>

        {
          expanded  && (
            <View style={{width: "100%", paddingHorizontal: 20}}>
            <AddressContainer directions={stops} edit={true} live={true} />
          </View>
          )
        }

       

        {/* Payment method */}
        <View style={{width:"90%",alignSelf:"center",flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <TouchableOpacity style={styles.paymentRow} onPress={onPaymentMethodChange}>
          <Text style={styles.paymentLabel}>Change Payment Method</Text>
          <View style={styles.paymentValueWrap}>
            <Text style={styles.paymentValue}>{paymentMethod}</Text>
            <Icon name="chevron-right" size={20} color="#888" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={()=>{
            onCancel();
          }}>
          <Icon name="close" size={25} color={colors.white} />
        </TouchableOpacity>

        </View>
      </View>
    
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 0,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  vehicleImg: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    transform: [{ scaleX: -1 }],
  },
  topBarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily:Fonts.regular,
  },
  timeBox: {
    backgroundColor: '#04713B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timeText: {
    color: '#fff',
    fontFamily:Fonts.regular,
    fontSize: 15,
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
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 8,
    width:"100%"
  },
  
  driverImgWrap: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 32,
    overflow: 'hidden',
    marginLeft: -10,
    marginRight: 8,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  driverImg: {
    width: 60,
    height: 60,
    borderRadius: 24,
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
  driverName: {
    fontFamily:Fonts.regular,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 4,
  },
  vehicleDesc: {
    color: '#555',
    fontFamily:Fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
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
  },
  tripDetailsRow: {
    width:'90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 14,
  
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 10,
  },
  tripDetailsLabel: {
    color: '#757575',
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
    padding:10,
    backgroundColor: colors.yellow_xxlight,
borderRadius: 12,
flexDirection:"row",

gap:10


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
});

export default OnRideScreen;
