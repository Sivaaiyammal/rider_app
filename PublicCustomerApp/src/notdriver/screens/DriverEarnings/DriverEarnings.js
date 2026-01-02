import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import EarningsTab from './EarningsTab';
import ReportTab from './ReportTab';
import TransactionTab from './TransactionTab';
import { Colors } from '../../../common/constants/constants';
import TopTabs from '../../../common/components/TopTabs';

const DriverEarnings = () => {
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
    }
})