import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Fonts } from '../../../constants/constants';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import { utils} from '../../../utils/Utils';
import RideStatusHeader from '../components/RideStatusHeader';

const RideCompletedScreen = () => {
  const { setStackScreen } = useStackScreenStore();
  const { finalFare, finalDuration, finalDistance ,paymentMethod} = useCurrentRideInfoStore();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Dummy data
  const fare = finalFare;
  const duration = finalDuration;
  const distance = finalDistance;

  useEffect(() => {
    // Start animation when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleMoreDetails = () => {
     setStackScreen('PaymentScreen',{
      handlePayNow:handlePayNow
     })
    // Dummy handler
  };
  const handlePayNow = () => {

    setStackScreen('TripFeedbackScreen',{})
   
  };

  return (
   <>
      
      <View style={[styles.containerTop,{backgroundColor:'#13B15A'}]}>
       
        <Text style={styles.topBarText}>Your ride is completed</Text>
            </View>
        
        
    
      <View style={styles.root}>
        <RideStatusHeader 
          title="Your ride is completed."
          subtitle="Please proceed with the payment"
        />
        <Text style={styles.fare}>₹ {fare}</Text>
        <Text style={styles.info}>{utils.formatMinutesToReadable(duration)}  .  {distance} Km</Text>
        {paymentMethod == 'CASH' && (
          <Animated.View 
            style={[
              styles.cashPayment,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
          
            <Text style={styles.cashPaymentText}>Please PAY Trip Fare ₹ {finalFare} to Driver</Text>
          
          </Animated.View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={handleMoreDetails}>
            <Text style={styles.outlineBtnText}>MORE DETAILS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filledBtn} onPress={handlePayNow}>
            <Text style={styles.filledBtnText}>{paymentMethod == 'CASH' ? 'PAY  THROUGH  UPI' : 'PAY NOW'}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical:20,
    paddingHorizontal:20,
  },
  containerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
   
   
    paddingHorizontal: 15,
    paddingVertical: 10,
   
    zIndex: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems:'center'
   
  },
  topBarText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Fonts.medium,
    textAlign:'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: 320,
    alignSelf: 'center',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 0,
  },
  fare: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    fontFamily: Fonts.semi_bold,
  },
  info: {
    fontSize: 15,
    color: '#888',
    marginBottom: 22,
    fontFamily: Fonts.regular,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#13B15A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  outlineBtnText: {
    color: '#13B15A',
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  filledBtn: {
    flex: 1,
    backgroundColor: '#13B15A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filledBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  cashPayment: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD54F',
    borderStyle:'dashed'
  },
 
  cashPaymentText: {
    fontSize: 16,
    fontFamily: Fonts.semi_bold,
    color: 'black',
    textAlign: 'center',
   
  },
  cashPaymentSubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#F57C00',
    textAlign: 'center',
  },
});

export default RideCompletedScreen;
