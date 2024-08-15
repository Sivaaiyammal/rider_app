import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { settingsStyles } from '../../Styles/SettingsScreen'
import NavBar from '../../Components/NavBar'
import SavedAddress from '../../Components/SearchTabs/SavedAddress'
import { useStackScreenStore } from '../../Store/useStackScreen'

const MyLocations = () => {
  const { goBack } = useStackScreenStore();

  const onBackPress = () => {
    goBack();
  };

  return (
    <View style={settingsStyles.screen}>
        <NavBar title={'My Locations'} onBackPress={() => onBackPress()}/>
        <View style={[settingsStyles.container, {width:'100%'}]}>
        <SavedAddress />
        </View>
    </View>
  )
}

export default MyLocations