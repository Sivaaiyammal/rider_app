import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Fonts } from '../../../constants/constants';
import DroppedTickIcon from '../../../assets/icons/DroppedTickIcon.svg';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
const RideCompletedScreen = () => {
  const { setStackScreen } = useStackScreenStore();
  const { finalFare, finalDuration, finalDistance ,breakdownFare} = useCurrentRideInfoStore();
  // Dummy data
  const fare = finalFare;
  const duration = finalDuration;
  const distance = finalDistance;


  console.log("breakdownFare",breakdownFare)
  console.log("finalFare",finalFare)

  const handleMoreDetails = () => {
    setStackScreen('PaymentScreen',{});
    // Dummy handler
  };
  const handlePayNow = () => {
    
  };

  return (
   <>
      {/* Top Bar */}
      <View style={[styles.containerTop,{backgroundColor:'#13B15A'}]}>
       
        <Text style={styles.topBarText}>Your ride is completed</Text>
            </View>
        
        
      {/* Card */}
      <View style={styles.root}>
        <View style={styles.iconWrap}>
          <DroppedTickIcon width={50} height={50} />
        </View>
        <Text style={styles.completedText}>Your ride is completed.</Text>
        <Text style={styles.subText}>Please proceed with the payment</Text>
        <Text style={styles.fare}>{fare}</Text>
        <Text style={styles.info}>{duration}  .  {distance}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={handleMoreDetails}>
            <Text style={styles.outlineBtnText}>MORE DETAILS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filledBtn} onPress={handlePayNow}>
            <Text style={styles.filledBtnText}>PAY NOW</Text>
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
  iconWrap: {
    backgroundColor: '#E8F5E9',
    borderRadius: 32,
    padding: 8,
    marginBottom: 10,
  },
  completedText: {
    fontSize: 17,
    color: '#222',
    fontFamily: Fonts.medium,
    marginBottom: 2,
    textAlign: 'center',
  },
  subText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: Fonts.regular,
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
});

export default RideCompletedScreen;
