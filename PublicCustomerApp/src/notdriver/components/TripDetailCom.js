import React, { use, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import usePublicDriverStore from '../store/usePublicDriverStore';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import { Colors, Fonts } from '../../common/constants/constants';
import { DateTimeFormatter } from '../../common/utils/DateTimeFormatter';
import TotalDistance from '../../notdriver/assets/icons/totalDistance.svg';
import TotalHours from '../../notdriver/assets/icons/totalHours.svg';
import TotalEarnings from '../../notdriver/assets/icons/totalEarnings.svg';
import Userpassenger from '../../notdriver/assets/icons/user_passenger.svg';
import SosIcon from '../../common/assets/icons/sos_icon.svg';

const TripDetails = ({ activeTripData, setModalVisible, isPaymentScreen, fareBreakDown, distance, duration, fare }) => {
  const { driverInfo } = usePublicDriverStore();
  const [loading, setLoading] = useState(false)
  const { setStackScreen } = useStackScreenStore();

  const callEmergency = async() => {
    await Linking.openURL(`tel:112`);
  }

  const handleCallPassenger = async(phoneNumber) => {
    await Linking.openURL(`tel:${phoneNumber}`);
    // setLoading(true)
    // const api = new APIRequest();
    //   try {
    //     const payload = {
    //       from : driverInfo.phone,
    //       to : phoneNumber
    //     };
    //     const url = `/publicrides/driver/inititateMaskedCall`;
    //     const res = await api.request(url, 'POST', payload, userInfo.token);
    //     if(res.success){
    //       showNotification('Call initiated','', 'success')
    //     } else {
    //       showNotification('Call Not initiated','Something went wrong', 'error')
    //     }
    //   } catch (err) {
    //     showNotification('Call initiated','Something went wrong', 'error')
    //       console.log('err',err)
    //   } finally {
    //     setLoading(false)
    //   }
  };

  return (
    <View style={{ width: '100%',  borderBottomWidth:1,
      borderStyle:"dashed",
      borderColor:Colors.grey,  paddingBottom:10}}>
        {isPaymentScreen && <Text style={styles.userDetails}>User Details</Text>}
        {/* <View style={styles.dotSeperator}/> */}
      <View style={styles.tripDetailsContainer}>
        <View style={styles.NameContianer}>
          <View style={styles.passangerPic}>
            <Userpassenger width={40} height={40}/>
          </View>
          <View>
          <Text style={styles.passangerName}>{activeTripData[0]?.bookingForName || 'User Name'}</Text>
          <Text style={[styles.passangerName,{color:'#FF9900', fontSize:12, fontFamily:Fonts.light}]}>Status: {activeTripData[0]?.status?.toLowerCase()}</Text>
          </View>
        </View>
        <TouchableOpacity style={{alignItems:'center', gap:10}} onPress={()=>handleCallPassenger(activeTripData[0]?.bookingForPhone)} disabled={loading}>
        <View style={styles.actionBtn} >
          <Feather name="phone-call" color={Colors.white} size={14}/>
         </View>
        </TouchableOpacity>
      </View>
      <View style={styles.tripFareContainer}>
  <View style={styles.tripDetailsViewContainer}>
       <View style={[styles.tripDetailsItem]}>
       <TotalDistance/>
          <Text style={styles.tripDetailsItemText}>{(isPaymentScreen ? distance?.toFixed(2) : activeTripData?.[0]?.estimatedDistance)} Km</Text>
        </View>
        <View style={styles.tripDetailsItem}>
        <TotalHours/>
          <Text style={styles.tripDetailsItemText}>{DateTimeFormatter.formatMinutesToDuration(isPaymentScreen ? duration : activeTripData?.[0]?.estimatedDuration)}</Text>
        </View>
        <View style={[styles.tripDetailsItem]}>
        <TotalEarnings/>
          <Text style={[styles.tripDetailsItemText,{color:Colors.green}]}>₹ {isPaymentScreen ? fareBreakDown?.fare?.toFixed(2) :activeTripData?.[0]?.estimatedFare}</Text>
        </View>
        </View>
        <TouchableOpacity style={styles.HelpBtn} onPress={()=>setStackScreen('DriverHelpSupport')}>
          <MaterialIcons name="support-agent" size={24} color={Colors.black} />
        </TouchableOpacity>
          <TouchableOpacity style={styles.sosBtn} onPress={()=>callEmergency()}>
          <SosIcon  width={54} height={54} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tripDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
    borderRadius: 10,
    marginVertical: 15,
    // marginHorizontal: 20,
  },
  actionBtn:{
    backgroundColor:'#62CC9E',
    width:40,
    height:40,
    borderRadius:100,
    alignItems:'center',
    justifyContent:'center',
    elevation:4
  },
  passangerName:{
    fontFamily:Fonts.regular,
    fontSize:16,
    color:Colors.black,
  },
  tripDetailsViewContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    gap:20,
    alignSelf:'center',
    borderStyle:'dashed',
    borderColor:Colors.grey_xxdark, 
    paddingVertical:10,
    backgroundColor:'#FAFAFA',
    paddingHorizontal:10,
    borderRadius:10,
    elevation:1,
    // flex:1,
    flexWrap:'nowrap'
  },
  tripDetailsItem:{
    alignItems:'center',
    gap:5,
    flexDirection:'row'
  },
  tripDetailsItemText:{
    fontFamily:Fonts.regular,
    fontSize:12,
    color:Colors.black
  },
  tripDetailsItemTextTitle:{
    fontFamily:Fonts.regular,
    fontSize:12
  },
  passangerPic:{
    width:60,
    height:60,
    backgroundColor:Colors.grey_light,
    borderRadius:100,
    alignItems:'center',
    justifyContent:'center',
    overflow:'hidden'
  },
  NameContianer:{
    flexDirection:'row',
    gap:5,
    alignItems:'center'
  },
  userDetails:{
    fontFamily:Fonts.medium,
    color:Colors.black,
    fontSize:16,
    textAlign:'center'
  },
  dotSeperator:{
    width:'30%',
    borderBottomWidth:2,
    borderStyle:'dotted',
    alignSelf:'center',
    marginVertical:10
  },
  tripFareContainer:{
    flexDirection:'row',
    width:'90%',
    alignSelf:'center',
    alignItems:'center',
    justifyContent:'center',
    gap:10
  },
  HelpBtn:{
    padding:5,
    borderRadius:100,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:Colors.white,
    elevation:4
  },
  sosBtn:{
    borderRadius:50,
    alignItems:'center',
    justifyContent:'center',
    // backgroundColor:Colors.white,
    // elevation:4,
    top:4
  }
});

export default TripDetails;