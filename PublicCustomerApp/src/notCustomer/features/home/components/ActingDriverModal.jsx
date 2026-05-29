import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import PropTypes from 'prop-types';
import { colors, Fonts, actingDriverColors } from '../../../constants/constants';
import { DataStore } from '../../../controllers/DataStore';
import { utils } from '../../../utils/Utils';

const TRIP_TABS = [
  {
    key: 'LOCAL',
    label: 'Local',
    image: require('../../../assets/markers/hatchback.png'),
    badgeIcon: 'location',
  },
  {
    key: 'RENTAL',
    label: 'Rental',
    image: require('../../../assets/markers/sedan.png'),
    badgeIcon: 'time',
  },
  {
    key: 'OUTSTATION',
    label: 'Outstation',
    image: require('../../../assets/markers/suv.png'),
    badgeIcon: 'compass',
  },
  // {
  //   key: 'BIKE',
  //   label: 'Bike',
  //   image: require('../../../assets/markers/bike.png'),
  //   badgeIcon: null,
  // },
  // {
  //   key: 'AUTO',
  //   label: 'Auto',
  //   image: require('../../../assets/image/vehicle/auto.png'),
  //   badgeIcon: null,
  // },
];

const RENTAL_PACKAGES = [
  { hours: 1, kms: 10, label: '1 hr', sub: '10 Kms' },
  { hours: 2, kms: 20, label: '2 hrs', sub: '20 Kms' },
  { hours: 3, kms: 30, label: '3 hrs', sub: '30 Kms' },
  { hours: 4, kms: 40, label: '4 hrs', sub: '40 Kms' },
  { hours: 6, kms: 60, label: '6 hrs', sub: '60 Kms' },
  { hours: 8, kms: 80, label: '8 hrs', sub: '80 Kms' },
];

const ActingDriverModal = ({ visible, onClose, onTripTypeSelect, loading }) => {
  const [activeTab, setActiveTab] = useState('LOCAL');
  const [selectedPackage, setSelectedPackage] = useState(RENTAL_PACKAGES[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Fetch recent searches
  useEffect(() => {
    if (visible) {
      const fetchRecent = async () => {
        try {
          const data = await DataStore.loadData('recentSearches');
          setRecentSearches(data?.data?.slice(0, 5) || []);
        } catch (e) {
          console.log('Error loading searches in acting driver modal:', e);
        }
      };
      fetchRecent();
    }
  }, [visible]);

  const handleSearchPress = () => {
    onTripTypeSelect(activeTab, selectedDate, selectedPackage, null);
  };

  const handleRecentPress = (item) => {
    onTripTypeSelect(activeTab, selectedDate, selectedPackage, item);
  };

  const renderRecentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => handleRecentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recentIconWrap}>
        <Ionicons name="location" size={20} color={actingDriverColors.secondary} />
      </View>
      <View style={styles.recentTextWrap}>
        <Text style={styles.recentName} numberOfLines={1}>
          {item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}
        </Text>
        {item.address && (
          <Text style={styles.recentAddress} numberOfLines={1}>
            {utils.formatArrayAddress(item.address)}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.heartBtn} activeOpacity={0.6}>
        <Ionicons name="heart-outline" size={20} color={colors.grey_dark} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <DatePicker
        modal
        open={openDatePicker}
        date={selectedDate}
        mode="date"
        minimumDate={new Date()}
        theme="light"
        onConfirm={(date) => {
          setOpenDatePicker(false);
          setSelectedDate(date);
        }}
        onCancel={() => {
          setOpenDatePicker(false);
        }}
      />

      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Bottom sheet panel */}
      <View style={styles.panel}>
        {/* Drag Handle */}
        <View style={styles.handle} />

        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Acting Driver</Text>
            <Text style={styles.subtitle}>Book professional drivers for your vehicle</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={actingDriverColors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Category Tabs (Local, Rental, Outstation) */}
        <View style={styles.tabsContainer}>
          {TRIP_TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, isSelected && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <View style={styles.tabImageWrapper}>
                  <Image source={tab.image} style={styles.tabImage} resizeMode="contain" />
                  {tab.badgeIcon && (
                    <View style={styles.badgeOverlay}>
                      <Ionicons name={tab.badgeIcon} size={10} color={colors.white} />
                    </View>
                  )}
                </View>
                {isSelected ? (
                  <View style={styles.selectedPill}>
                    <Text style={styles.selectedPillText}>{tab.label}</Text>
                  </View>
                ) : (
                  <Text style={styles.tabLabel}>{tab.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content based on Active Tab */}
        {activeTab === 'RENTAL' && (
          <View style={styles.rentalSection}>
            <Text style={styles.sectionLabel}>Choose Package</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.packagesScroll}
            >
              {RENTAL_PACKAGES.map((pkg) => {
                const isPkgSelected = selectedPackage.hours === pkg.hours;
                return (
                  <TouchableOpacity
                    key={pkg.hours}
                    style={[
                      styles.packageCard,
                      isPkgSelected && styles.packageCardActive,
                    ]}
                    onPress={() => setSelectedPackage(pkg)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.packageHrs, isPkgSelected && styles.packageHrsActive]}>
                      {pkg.label}
                    </Text>
                    {/* <Text style={styles.packageKms}>{pkg.sub}</Text> */}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.rentalBanner}>
              <Text style={styles.rentalBannerText}>
                Hourly Rentals, Budget-Friendly Prices, Trusted Journeys - Unlock a better ride with Red Taxi Rental.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'OUTSTATION' && (
          <View style={styles.outstationSection}>
            <Text style={styles.sectionLabel}>Select Departure Date</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setOpenDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={20} color={actingDriverColors.primary} />
              <Text style={styles.dateText}>
                {utils.formatDate(selectedDate, 'DD MMM YYYY, ddd')}
              </Text>
              <Ionicons name="chevron-forward-outline" size={18} color={colors.grey_dark} />
            </TouchableOpacity>
          </View>
        )}

        {/* Search Input Box */}
        {activeTab !== 'RENTAL' && (
          <TouchableOpacity
            style={styles.searchBox}
            activeOpacity={0.8}
            onPress={handleSearchPress}
          >
            <Ionicons name="search-outline" size={20} color={colors.grey_xxdark} />
            <Text style={styles.searchPlaceholder}>Where do you want to go?</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'RENTAL' && (
          <TouchableOpacity
            style={styles.proceedButton}
            activeOpacity={0.8}
            onPress={handleSearchPress}
          >
            <Text style={styles.proceedButtonText}>Proceed to Location Selection</Text>
            <Ionicons name="arrow-forward-outline" size={18} color={colors.white} />
          </TouchableOpacity>
        )}

        {/* Recent Places List */}
        {activeTab !== 'RENTAL' && recentSearches.length > 0 && (
          <View style={styles.recentSection}>
            <FlatList
              data={recentSearches}
              renderItem={renderRecentItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          </View>
        )}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={actingDriverColors.primary} />
            <Text style={styles.loadingText}>Initializing acting driver info...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

ActingDriverModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTripTypeSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

ActingDriverModal.defaultProps = {
  loading: false,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    backgroundColor: actingDriverColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 36,
    paddingTop: 10,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: actingDriverColors.border,
    marginBottom: 16,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold || Fonts.semi_bold,
    color: actingDriverColors.secondary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
  },
  closeBtn: {
    padding: 4,
    marginTop: 2,
  },

  /* Category Tabs */
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 10,
    marginBottom: 16,
  },
  tabItem: {
    alignItems: 'center',
    minWidth: 90,
    paddingVertical: 6,
  },
  tabItemActive: {
    // any active tab item outer container styles if needed
  },
  tabImageWrapper: {
    width: 60,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tabImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: actingDriverColors.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
  },
  selectedPill: {
    backgroundColor: actingDriverColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedPillText: {
    fontSize: 13,
    fontFamily: Fonts.semi_bold,
    color: actingDriverColors.secondary,
  },

  /* Search Box */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white_dirt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    flex: 1,
  },

  /* Outstation section */
  outstationSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: actingDriverColors.secondary,
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white_dirt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: actingDriverColors.secondary,
    flex: 1,
  },

  /* Rental Section */
  rentalSection: {
    marginBottom: 16,
  },
  packagesScroll: {
    gap: 10,
    paddingBottom: 10,
  },
  packageCard: {
    width: 80,
    height: 70,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: actingDriverColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  packageCardActive: {
    borderColor: actingDriverColors.primary,
    borderWidth: 2,
  },
  packageHrs: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: actingDriverColors.secondary,
  },
  packageHrsActive: {
    color: actingDriverColors.secondary,
  },
  packageKms: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
  },
  rentalBanner: {
    backgroundColor: colors.white_dirt,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  rentalBannerText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
    lineHeight: 18,
  },

  /* Proceed Button */
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: actingDriverColors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 16,
  },
  proceedButtonText: {
    fontSize: 15,
    fontFamily: Fonts.semi_bold,
    color: colors.white,
  },

  /* Recent Searches */
  recentSection: {
    marginTop: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white_dirt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentTextWrap: {
    flex: 1,
  },
  recentName: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: actingDriverColors.secondary,
    marginBottom: 2,
  },
  recentAddress: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
  },
  heartBtn: {
    padding: 6,
  },
  divider: {
    height: 0.5,
    backgroundColor: actingDriverColors.border,
  },

  /* Loading State */
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.grey_xxdark,
  },
});

export default ActingDriverModal;
