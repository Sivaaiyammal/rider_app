import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import EarningsTab from './EarningsTab';
import ReportTab from './ReportTab';
import TransactionTab from './TransactionTab';
import { Colors, Fonts } from '../../../common/constants/constants';
import TopTabs from '../../../common/components/TopTabs';
import { useTranslation } from 'react-i18next';

const DriverEarnings = () => {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState('earnings');
  const tabs = [
    { key: 'earnings', label: 'Earnings', title: 'earnings' },
    { key: 'reports', label: 'History', title: 'history' },
    { key: 'transactions', label: 'Transactions', title: 'transactions' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'earnings':
        return <EarningsTab />;
      case 'reports':
        return <ReportTab />;
      case 'transactions':
        return <TransactionTab />;
      default:
        return <EarningsTab />;
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
       <Text style={styles.headerTitle}>{t('earnings')}</Text>
      </View>
      <TopTabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {renderTabContent()}
    </View>
  )
}

export default DriverEarnings

const styles = StyleSheet.create({
    screen :{
        flex:1,
        backgroundColor:Colors.white
    },
      headerContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingHorizontal:10,
        borderBottomWidth:1,
        borderBottomColor:Colors.grey,
        width:'90%',
        alignSelf:'center',
        paddingVertical:20
      },
      headerTitle:{
        fontSize:20,
        color:Colors.black,
        fontFamily:Fonts.medium,
        textAlign:'center',
      }
})