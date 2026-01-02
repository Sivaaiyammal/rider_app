import { ImageBackground, NativeModules, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import useUserStore from '../../../common/store/useUserStore'
import usePublicDriverStore from '../../store/usePublicDriverStore'
import { DateTimeFormatter } from '../../../common/utils/DateTimeFormatter'
import APIRequest from '../../../common/APIRequest'
import { showNotification } from '../../../common/components/Alerts/showNotification'
import publicrideDriverApi from '../../api/publicrideDriverApi'
import FullScreenLoader from '../../../common/loaders/FullScreenLoader'
import PayDue from './PayDue'
import { Colors, Fonts } from '../../../common/constants/constants'


const EarningsTab = () => {
  const t = {}
    const {userInfo} = useUserStore
   const {driverDue, driverEarnings, driverDueDate, setdriverDueDate, driverInfo, setDriverDue, dueDuration} = usePublicDriverStore()
   const merchantId = 'M2202LBE4KQJX'
   const [payments, setPayments] = useState([])
   const [loading, setLoading] = useState(false)
   const [totalEarnings, setTotalEarnings] = useState(0)
   const [startDate, endDate] = DateTimeFormatter.getThisMonthStartEndTime()
   const [totalOnlineHours, setTotalOnlineHours] = useState(0)
   const [totalTrips, setTotalTrips] = useState(0)
   const [clearedAmount, setClearedAmount] = useState(0)
   const [pendingAmount, setPendingAmount] = useState(0)
   
   // Separate loading states for each section
   const [paymentsLoading, setPaymentsLoading] = useState(false)
   const [workingHoursLoading, setWorkingHoursLoading] = useState(false)

   const checkandUpdatePaymentStatus = async () => {
     const api = new APIRequest();
     const response = await api.request(`/publicrides/payments/PhonepayStatusCheck`, 'POST', {}, userInfo.user.token)
     console.log('hari-->>response-->>checkandUpdatePaymentStatus', response)
     if(response.success) {
      console.log('hari-->>response-->>checkandUpdatePaymentStatus', response)
     }
   }

  //  const handlePayDue = async () => {
  //   const response = await payDue(merchantId, userInfo?.user?.token, driverDue.toFixed(2), "M2ZmOThkZDQtZDllZS00ZTIyLWI47474fgfxgxchvVkNDkx", true)
  //   if(response.status === 'COMPLETED') {
  //       showNotification('Payment Successful', 'Payment successful', 'success')
  //       await checkandUpdatePaymentStatus()
  //   }
  //   if(response.status === 'FAILED') {
  //       showNotification('Payment Failed', 'Payment failed', 'error')
  //   }
  //   if(response.status === 'PENDING') {
  //     showNotification('Payment Pending', 'Payment pending', 'warning')
  //   }
  //  }

   const fetchDueDate = async () => {
    setLoading(true);
    try {
      const response = await publicrideDriverApi.getDriverDetails(userInfo?.user?.token)
      if (response.success) {
        setdriverDueDate(response?.driver?.nextDueDate)
        setDriverDue(0);
      }
    } catch (error) {
      console.log('hari-->>error-->>', error)
    } finally {
      setLoading(false);
    }
 }

   const fetchPayments = async (pageNum = 1) => {
    if (!dueDuration) return
    try {
      setPaymentsLoading(true);
      const api = new APIRequest();  
      const response = await api.request(
        `/publicrides/payments/driver/get-Payments?page=${pageNum}&limit=${0}&tripStatus=${'all'}&startTime=${dueDuration.startTime}&endTime=${dueDuration.endTime}`, 
        'GET', 
        {},
        userInfo.user.token
      );
      if (response.success) {
        const newPayments = response?.payments || [];
        setPayments(newPayments)
        setTotalEarnings(response?.totalEarnings)
        setClearedAmount(response?.clearedDue)
        setPendingAmount(response?.pendingDue)
        setTotalTrips(response?.count)
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setPaymentsLoading(false);
    }
  }

  const getTotalOnlineHours = async () => { 
    try {
      setWorkingHoursLoading(true);
      const api = new APIRequest();
      const response = await api.request(`/publicrides/driver/getDriverWrkHistory`, 'GET', {}, userInfo.user.token)
      if(response.success) {
        const wrkHistory = response?.wrkHistory[0]?.workingHours || []
        const filteredHours = wrkHistory.find((item)=>item.month === DateTimeFormatter.requiredDateFormat(startDate, 'YYYY-MM'))
        setTotalOnlineHours(filteredHours)
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
    } finally {
      setWorkingHoursLoading(false);
    }
  }

  useEffect(()=>{
    fetchPayments()
    getTotalOnlineHours()
  },[])

  return (
    <View style={styles.screen}>
      {loading && <FullScreenLoader />}
       <PayDue driverDue={driverDue} userInfo={userInfo} driverDueDate={driverDueDate} fetchDueDate={fetchDueDate} driverInfo={driverInfo}/>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.dateRange}>{dueDuration ? DateTimeFormatter.requiredDateFormat(dueDuration?.startTime, 'D MMM,YYYY') + ' - ' + DateTimeFormatter.requiredDateFormat(dueDuration?.endTime, 'D MMM,YYYY') : ''}</Text>
      <Text style={styles.totalEarningsLabel}>{t.total_earnings}</Text>
      <Text style={styles.totalEarnings}>₹{totalEarnings > 0 ? totalEarnings?.toFixed(2) : 0}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          {paymentsLoading ? (
            <ActivityIndicator size="small" color="#f79559" />
          ) : (
            <Text style={styles.statValueOrange}>{totalTrips}</Text>
          )}
          <Text style={styles.statLabel}>{t.total_trips}</Text>
        </View>
        <View style={styles.statItem}>
          {workingHoursLoading ? (
            <ActivityIndicator size="small" color="#888" />
          ) : (
            <Text style={styles.statValueGray}>{totalOnlineHours?.totalHours ? Math.round(totalOnlineHours?.totalHours) : 0}</Text>
          )}
          <Text style={styles.statLabel}>{t.total_online_hours}{' '}{DateTimeFormatter.requiredDateFormat(startDate, 'MMM,YYYY')}</Text>
        </View>
        {/* <View style={styles.statItem}>
          <Text style={styles.statValueBlue}>100</Text>
          <Text style={styles.statLabel}>Total Distance</Text>
        </View> */}
      </View>

      <View style={styles.amountRow}>
        <View style={styles.amountItem}>
          <Text style={styles.paidLabel}>{t.paid_amount}</Text>
          {paymentsLoading ? (
            <ActivityIndicator size="small" color="#18c1c1" />
          ) : (
            <Text style={styles.paidAmount}>₹{clearedAmount > 0 ? clearedAmount?.toFixed(2) : 0}</Text>
          )}
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.dueLabel}>{t.due_amount}</Text>
          {paymentsLoading ? (
            <ActivityIndicator size="small" color="#f44336" />
          ) : (
            <Text style={styles.dueAmount}>₹{ pendingAmount > 0 ? pendingAmount?.toFixed(2) : 0}</Text>
          )}
        </View>
      </View>

      {/* <View style={styles.slipContainer}>
        <Text style={styles.slipTitle}>Detailed Slip</Text>
        <View style={styles.slipRow}>
          <Text style={styles.slipLabel}>Total Earnings</Text>
          <Text style={styles.slipValue}>₹10200.70</Text>
        </View>
        <View style={styles.slipRow}>
          <Text style={styles.slipLabel}>Commission</Text>
          <Text style={styles.slipValueRed}>₹2800.20</Text>
        </View>
        <View style={styles.slipRow}>
          <Text style={styles.slipLabel}>Revenue</Text>
          <Text style={styles.slipValueGreen}>₹7400.50</Text>
        </View>
      </View> */}
    </ScrollView>
    </View>
  )
}

export default EarningsTab

const styles = StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: Colors.white,
          },      
          headerContinaer:{
            marginTop:20,
            width:'90%',
            alignSelf:'center',
            height:180,
            alignItems:'center',
            justifyContent:'center',
          },
          payDueText:{
            fontFamily:Fonts.regular,
            color:"#004B49",
            fontSize:16,
            marginLeft:20,
            marginTop:10
          },
          priceTxt:{
            fontFamily:Fonts.medium,
            color:"#004B49",
            fontSize:30,
            marginLeft:20,
            marginTop:10
          },
          dueTxt:{
            fontFamily:Fonts.light,
            color:"#004B49",
            fontSize:12,
            marginLeft:20,
            marginTop:10
          },
          payNowBtn:{
            backgroundColor:'#004B49',
            paddingVertical:10,
            paddingHorizontal:10,
            borderRadius:10,
            width:'30%',
            alignSelf:'flex-end',
            marginRight:25,
            alignItems:'center',
          },
          payNowBtnTxt:{
            fontFamily:Fonts.regular,
            color:Colors.white,
            fontSize:14
          },
          container: {
            padding: 20,
            alignItems: 'center',
            backgroundColor: '#fff',
            paddingBottom:100
          },
          dateRange: {
            fontSize: 16,
            color: '#555',
            marginBottom: 10,
            fontFamily:Fonts.regular
          },
          totalEarningsLabel: {
            fontSize: 16,
            color: '#333',
            fontFamily:Fonts.regular
          },
          totalEarnings: {
            fontSize: 32,
            color: '#2f7d32',
            marginVertical: 10,
            fontFamily:Fonts.semi_bold
          },
          statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginVertical: 20,
          },
          statItem: {
            alignItems: 'center',
            flex: 1,
          },
          statValueOrange: {
            color: '#f79559',
            fontSize: 20,
            fontFamily:Fonts.semi_bold
          },
          statValueGray: {
            color: '#888',
            fontSize: 20,
   
            fontFamily:Fonts.semi_bold

          },
          statValueBlue: {
            color: '#34c3eb',
            fontSize: 20,
            fontFamily:Fonts.semi_bold
          },
          statLabel: {
            fontSize: 14,
            color: '#555',
            fontFamily:Fonts.regular,
            textAlign:'center'
          },
          amountRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginVertical: 20,
          },
          amountItem: {
            flex: 1,
            alignItems: 'center',
          },
          paidLabel: {
            color: '#666',
            fontSize: 14,
            fontFamily:Fonts.regular
          },
          paidAmount: {
            color: '#18c1c1',
            fontSize: 18,
            fontFamily:Fonts.semi_bold
          },
          dueLabel: {
            color: '#666',
            fontSize: 14,
            fontFamily:Fonts.regular
          },
          dueAmount: {
            color: '#f44336',
            fontSize: 18,
            fontFamily:Fonts.semi_bold
          },
          slipContainer: {
            backgroundColor: '#f9f9f9',
            width: '100%',
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
            borderTopWidth: 2,
            borderColor: '#eee',
          },
          slipTitle: {
            textAlign: 'center',
            fontFamily:Fonts.semi_bold,
            fontSize: 16,
            marginBottom: 10,
            color: '#444',
          },
          slipRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 4,
          },
          slipLabel: {
            color: '#444',
            fontSize: 14,
            fontFamily:Fonts.regular
          },
          slipValue: {
            color: '#222',
            fontSize: 14,
            fontFamily:Fonts.semi_bold,
          },
          slipValueRed: {
            color: '#e53935',
            fontSize: 14,
            fontFamily:Fonts.semi_bold,

          },
          slipValueGreen: {
            color: '#00a676',
            fontSize: 14,
            fontFamily:Fonts.semi_bold,
          },
       
})