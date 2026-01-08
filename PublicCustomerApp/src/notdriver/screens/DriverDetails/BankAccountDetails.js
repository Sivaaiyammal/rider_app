import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useStackScreenStore } from '../../../common/store/useStackScreenStore'
import NavBar from '../../../common/components/NavBar'
import UseBackButton from '../../../common/hooks/UseBackButton'
import BankDetails from '../DriverVehicleDetails/BankDetails'
import { Colors } from '../../../common/constants/constants'


const BankAccountDetails = () => {
    const {goBack} = useStackScreenStore()

    const onBackPress = () => {
        goBack()
    }
  return (
    <View style={styles.container}>
        {/* <NavBar title={'Bank Account Details'} onBackPress={onBackPress}/>
        <UseBackButton onBackPress={onBackPress} /> */}
        <View style={styles.documentsListContainer}>
         <BankDetails isView={true} isEdit={true}/>
        </View>
    </View>
  )
}

export default BankAccountDetails

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: Colors.white,
    },
    documentsListContainer:{
        alignSelf:'center',
        flex:1
    }
})