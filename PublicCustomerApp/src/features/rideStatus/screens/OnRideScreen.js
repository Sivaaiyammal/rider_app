import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getVehicleImage } from '../types/vehicleImd';
import {Fonts} from '../../../constants/constants';
import AddressContainer from '../../../components/Trips/AddressContainer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useAssignedDriverInfoStore from '../store/useAssignedDriverInfoStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
const OnRideScreen = ({onPaymentMethodChange}) => {
  const {driverName,rating,phone,vehicleNumber,model,brand,color,driverPhoto,setDummyDriverInfo} = useAssignedDriverInfoStore();
    const {stops,otp,distance,minFare,maxFare,duration,estDropTime,totalDistance,vehicleType,paymentMethod} = useCurrentRideInfoStore();

    useEffect(()=>{
      setDummyDriverInfo();
    },[driverName])
  return (
    <>
      {/* Top info bar */}
      <View style={[styles.containerTop,{backgroundColor:'#0f223c'}]}>
       
        <Text style={styles.topBarText}>Your driver will arrive in</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>05:30 Mins</Text>
            </View>
        
    </View>

    <View style={[styles.root,{backgroundColor:'white'}]}>

      {/* Card */}
     
        {/* Vehicle and driver images */}
        <View style={styles.imagesRow}>
        {getVehicleImage(vehicleType,styles.vehicleImg)}
          <View style={styles.driverImgWrap}>
            <Image source={{ uri: driverPhoto }} style={styles.driverImg} />
          </View>
          <View style={styles.onRideBadge}><Text style={styles.onRideBadgeText}>On Ride</Text></View>
        </View>
        {/* Driver and vehicle info */}
        <Text style={styles.driverName}>{driverName}</Text>
        <Text style={styles.vehicleDesc}>{brand} {model} · {vehicleNumber}</Text>
        {/* Estimated amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountIcon}>🧾</Text>
          <Text style={styles.amountLabel}>Estimated Amount to be Paid</Text>
          <Text style={styles.amountValue}>₹{minFare || "--"} - ₹{maxFare || "--"}</Text>
        </View>
        {/* Ride info */}
        <View style={styles.rideInfoRow}>
          <View style={styles.rideInfoItem}>
            <Text style={styles.rideInfoLabel}>Arrival</Text>
            <Text style={styles.rideInfoValue}>{estDropTime}</Text>
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
        {/* Stops */}
        <View style={{width:"100%",paddingHorizontal:20}}>
       <AddressContainer directions={stops} edit={false} />
       </View>
        {/* Payment method */}
        <TouchableOpacity style={styles.paymentRow} onPress={onPaymentMethodChange}>
          <Text style={styles.paymentLabel}>Change Payment Method</Text>
          <View style={styles.paymentValueWrap}>
            <Text style={styles.paymentValue}>{paymentMethod}</Text>
            <Icon name="chevron-right" size={20} color="#888" />
          </View>
        </TouchableOpacity>
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
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 8,
    marginHorizontal:20,
    borderStyle:'dashed'
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
  },
  amountValue: {
    color: '#04713B',
    fontFamily:Fonts.medium,
    fontSize: 20,
    marginLeft: 8,
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
  },
  rideInfoValue: {
    fontFamily:Fonts.regular,
    fontSize: 15,
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
    width:"100%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
    paddingHorizontal:20
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

export default OnRideScreen;
