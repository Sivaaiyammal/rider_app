import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useStackScreenStore } from '../../../common/store/useStackScreenStore'
import NavBar from '../../../common/components/NavBar'
import UseBackButton from '../../../common/hooks/UseBackButton'
import DriverEntry from '../DriverVehicleDetails/DriverEntry'
import { Colors } from '../../../common/constants/constants'

const DriverPersonalInfo = () => {
    const t = {}
    const {goBack} = useStackScreenStore()

    const onBackPress = () => {
        goBack()
    }

  return (
    <View style={styles.container}>
        <NavBar title={t.personal_information} onBackPress={onBackPress}/>
        <UseBackButton onBackPress={onBackPress} />
        <View style={styles.personalInfoContainer}> 
            <DriverEntry isEdit={true}/>
        </View>
    </View>
  )
}

export default DriverPersonalInfo

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: Colors.white,
    },
    personalInfoContainer:{
        width:'90%',
        alignSelf:'center'
    }
})