import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStackScreenStore } from '../store/useStackScreenStore';
import { Fonts } from '../constants/constants';

const BOOKINGS_DATA = [
  {
    id: '1',
    status: 'Upcoming',
    vehicleName: 'Audi Q2 • TN09CR3540',
    dateShort: '13\nJUN',
    time: '09:00 AM',
    locationText: 'Race Course, Coimbatore',
    tripType: 'Trip Type: Full Day',
  },
  {
    id: '2',
    status: 'Upcoming',
    vehicleName: 'Audi Q2 • TN09CR3540',
    dateShort: '20\nJUN',
    time: '08:30 AM',
    locationText: 'Ooty, Tamil Nadu',
    tripType: 'Trip Type: Multi Day (2 Days)',
  },
  {
    id: '3',
    status: 'In Progress',
    vehicleName: 'Audi Q2 • TN09CR3540',
    dateShort: '09\nMAY',
    time: 'Started at 08:10 AM',
    locationText: 'Coimbatore  →  Mettupalayam',
    tripType: 'Trip Type: One Way',
  },
  {
    id: '4',
    status: 'Completed',
    vehicleName: 'Audi Q2 • TN09CR3540',
    dateShort: '02\nMAY',
    time: 'Trip on 02 May 2025',
    locationText: 'Coimbatore  →  Salem',
    tripType: 'Trip Type: One Way',
  },
  {
    id: '5',
    status: 'Completed',
    vehicleName: 'Audi Q2 • TN09CR3540',
    dateShort: '25\nAPR',
    time: 'Trip on 25 Apr 2025',
    locationText: 'Coimbatore  →  Tirupur',
    tripType: 'Trip Type: Hourly (8 Hrs)',
  },
];

const MyActingDriverBookings = () => {
  const { goBack } = useStackScreenStore();
  const [activeTab, setActiveTab] = useState('All');

  const filteredData = BOOKINGS_DATA.filter((item) => {
    if (activeTab === 'All') return true;
    return item.status === activeTab;
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Upcoming':
        return {
          cardBg: '#FAFBFF',
          borderColor: '#E8EAF6',
          badgeBg: '#EDE7F6',
          badgeText: '#5E35B1',
          dateColor: '#5E35B1',
          iconColor: '#5E35B1',
        };
      case 'In Progress':
        return {
          cardBg: '#F3FAF5',
          borderColor: '#E8F5E9',
          badgeBg: '#E8F5E9',
          badgeText: '#2E7D32',
          dateColor: '#2E7D32',
          iconColor: '#2E7D32',
        };
      case 'Completed':
      default:
        return {
          cardBg: '#F9F9F9',
          borderColor: '#F0F0F0',
          badgeBg: '#F5F5F5',
          badgeText: '#616161',
          dateColor: '#424242',
          iconColor: '#616161',
        };
    }
  };

  const renderItem = ({ item, index }) => {
    const sStyles = getStatusStyles(item.status);
    const isFirstInSection = index === 0 || BOOKINGS_DATA[index - 1].status !== item.status;

    return (
      <View>
        {activeTab === 'All' && isFirstInSection && (
          <Text style={styles.sectionHeader}>{item.status}</Text>
        )}
        <View style={[styles.cardContainer, { backgroundColor: sStyles.cardBg, borderColor: sStyles.borderColor }]}>
          {/* Left Date Column */}
          <View style={styles.dateColumn}>
            <Text style={[styles.dateText, { color: sStyles.dateColor }]}>{item.dateShort.split('\n')[0]}</Text>
            <Text style={[styles.monthText, { color: sStyles.dateColor }]}>{item.dateShort.split('\n')[1]}</Text>
          </View>

          {/* Right Content Column */}
          <View style={styles.contentColumn}>
            {/* Top Row: Vehicle Image & Badge */}
            <View style={styles.contentTopRow}>
              <Image 
                source={{uri: 'https://pngimg.com/uploads/audi/audi_PNG1768.png'}} 
                style={styles.vehicleImage}
                resizeMode="contain"
              />
              <View style={styles.topRightInfo}>
                <Text style={styles.vehicleNameText}>{item.vehicleName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: sStyles.badgeBg }]}>
                  <Text style={[styles.statusBadgeText, { color: sStyles.badgeText }]}>{item.status}</Text>
                </View>
              </View>
            </View>

            {/* Details Rows */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Icon name="clock-outline" size={14} color="#616161" style={styles.detailIcon} />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="map-marker-outline" size={14} color="#616161" style={styles.detailIcon} />
                <Text style={styles.detailText}>{item.locationText}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="clipboard-text-outline" size={14} color="#616161" style={styles.detailIcon} />
                <Text style={styles.detailText}>{item.tripType}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-left" size={24} color="#1F1F1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Acting Driver Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['All', 'Upcoming', 'In Progress', 'Completed'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: '#1F1F1F',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#5E35B1',
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#757575',
  },
  tabTextActive: {
    color: '#5E35B1',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#1F1F1F',
    marginTop: 16,
    marginBottom: 12,
  },
  cardContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  dateColumn: {
    alignItems: 'center',
    marginRight: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    paddingRight: 16,
  },
  dateText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
  },
  monthText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
  },
  contentColumn: {
    flex: 1,
  },
  contentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleImage: {
    width: 60,
    height: 40,
    marginRight: 12,
  },
  topRightInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  vehicleNameText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#1F1F1F',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#424242',
  },
});

export default MyActingDriverBookings;
