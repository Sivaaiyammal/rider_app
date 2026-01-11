import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DocumentCenter from './DriverDocumentCenter/DocumentCenter'
import NavBar from '../../common/components/NavBar'
import { useStackScreenStore } from '../../common/store/useStackScreenStore'
import UseBackButton from '../../common/hooks/UseBackButton'

const EditDocCenter = () => {
    const { goBack} = useStackScreenStore();
  return (
    <View style={{flex:1, backgroundColor:'white'}}>
        <NavBar title="Document Center" onBackPress={() => goBack()} />
            <UseBackButton onBackPress={() => goBack()} />
      <DocumentCenter />
    </View>
  )
}

export default EditDocCenter