import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Colors, Fonts } from '../../common/constants/constants';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import { useMapMarkerStore } from '../../common/store/useMapMarkerStore';
import useTripsStore from '../store/useTripsStore';
import useActingDriverMediaStore from '../store/useActingDriverMediaStore';
import useDeviceTokenStore from '../../common/store/useDeviceTokenStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';
import CustomeBottomSheet from '../../common/components/CustomeBottomSheet';
import CancelRideModal from '../components/CancelModel';
import BGLocationTask from '../../common/controllers/BGLocationTask';
import locationTask from '../../common/controllers/GetCurrentLocation';
import {
  checkBackgroundLocationPermissions,
  checkFineLocationPermissions,
} from '../../common/controllers/PermissionHandler';
import { DataStore } from '../../common/controllers/DataStore';

const { NeNativeModule } = NativeModules;

const ActingDriverOnRideScreen = () => {
  const { setStackScreen } = useStackScreenStore();

  const {
    disduration,
    setDisduration,
    userLocation,
    startNavigation,
    setStartNavigation,
    setDirectionPoints,
    setDirectionResponse,
    routeLoading,
    directionReadyCallback,
    setMapMarkers,
    routeNotFound,
    setRouteNotFound,
  } = useMapMarkerStore();

  const { activeTripData, setActiveTripData, setFareBreakDown } = useTripsStore();
  const { loading, setLoading, setFetchLocationDate, isGetFare, setIsOnGoing } = useTripAcceptStore();

  const {
    hasLocationPermission,
    hasBackgroundLocationPermission,
    hasNotificationPermission,
  } = useDeviceTokenStore();

  const { postTripDone } = useActingDriverMediaStore();

  const [cancelRideModalVisible, setCancelRideModalVisible] = useState(false);
  const [openNavChoiceModal, setOpenNavChoiceModal] = useState(false);
  const [showPostTripWarning, setShowPostTripWarning] = useState(false);

  const tripsStatus = activeTripData?.[0]?.status || '';

  // Server-side post-trip check
  const _postPhotos = activeTripData?.[0]?.bills?.postTripVehiclePhotos;
  const postTripUploadedOnServer = !!(
    _postPhotos?.front && _postPhotos?.rear && _postPhotos?.leftSide && _postPhotos?.rightSide
  );
  const postTripReady = postTripDone || postTripUploadedOnServer;

  // ─── Start Navigation ──────────────────────────────────────────────────────
  const onStartNavigationPress = () => {
    setOpenNavChoiceModal(true);
  };

  const handleNavMode = async (mode) => {
    setOpenNavChoiceModal(false);
    const pickupStop = activeTripData?.[0]?.stops?.[0];

    if (mode === 'google') {
      const lat = pickupStop?.location?.[1];
      const lng = pickupStop?.location?.[0];
      const url = lat && lng
        ? `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupStop?.address || '')}`;
      Linking.openURL(url).catch(() => {});
      return;
    }

    // In-app navigation
    const hasFine = await checkFineLocationPermissions();
    const hasBg = Platform.OS === 'android' && Platform.Version <= 28
      ? true
      : await checkBackgroundLocationPermissions();
    if (!hasFine || !hasBg) return;
    if (!userLocation) {
      await locationTask.getCurrentLocation();
      return;
    }
    if (userLocation && pickupStop?.location) {
      setDirectionPoints({
        locations: [
          { lat: userLocation[0], lon: userLocation[1] },
          { lat: pickupStop.location[1], lon: pickupStop.location[0] },
        ],
        type: 'car',
        padding: [50, 50, 50, 200],
      });
    }
    setStartNavigation(true);
    setMapMarkers([]);
    setRouteNotFound(null);
    await BGLocationTask.runDriverBgTask();
  };

  // ─── End Trip ──────────────────────────────────────────────────────────────
  const endTrip = async () => {
    const hasFine = await checkFineLocationPermissions();
    const hasBg = Platform.OS === 'android' && Platform.Version <= 28
      ? true
      : await checkBackgroundLocationPermissions();
    if (!hasFine || !hasBg) return;
    if (!userLocation) {
      await locationTask.getCurrentLocation();
      return;
    }
    if (tripsStatus !== 'PICKEDUP') return;
    if (!postTripReady) {
      setShowPostTripWarning(true);
      return;
    }
    setFetchLocationDate(true);
    setLoading(true);
  };

  // ─── Nav choice modal ──────────────────────────────────────────────────────
  const renderNavChoiceModal = () => (
    <Modal visible={openNavChoiceModal} transparent animationType="fade" onRequestClose={() => setOpenNavChoiceModal(false)}>
      <View style={styles.navOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setOpenNavChoiceModal(false)} activeOpacity={1} />
        <View style={styles.navSheet}>
          <View style={styles.navHandle} />
          <Text style={styles.navTitle}>Choose Navigation</Text>
          <Text style={styles.navSub}>Select your preferred navigation app</Text>
          <View style={styles.navOptionsRow}>
            <TouchableOpacity style={styles.navOptionCard} onPress={() => handleNavMode('google')} activeOpacity={0.8}>
              <MaterialCommunityIcons name="google-maps" size={32} color="#4285F4" />
              <Text style={styles.navOptionLabel}>Google Maps</Text>
              <Text style={styles.navOptionDesc}>Open in Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navOptionCard} onPress={() => handleNavMode('vm')} activeOpacity={0.8}>
              <MaterialCommunityIcons name="map-outline" size={32} color="#352166" />
              <Text style={styles.navOptionLabel}>VirtualMaze</Text>
              <Text style={styles.navOptionDesc}>In-app navigation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ─── Post-trip warning modal ───────────────────────────────────────────────
  const renderPostTripWarning = () => (
    <Modal visible={showPostTripWarning} transparent animationType="fade" onRequestClose={() => setShowPostTripWarning(false)}>
      <View style={styles.warnOverlay}>
        <View style={styles.warnBox}>
          <MaterialCommunityIcons name="camera-alert" size={40} color="#E53935" style={{ alignSelf: 'center', marginBottom: 10 }} />
          <Text style={styles.warnTitle}>Post-Trip Photos Required</Text>
          <Text style={styles.warnMsg}>
            Please upload the 4 post-trip vehicle condition photos before ending the ride.
          </Text>
          <TouchableOpacity
            style={styles.warnBtn}
            onPress={() => { setShowPostTripWarning(false); setStackScreen('ActingDriverPostTripScreen'); }}
            activeOpacity={0.8}>
            <MaterialCommunityIcons name="camera-plus-outline" size={18} color={Colors.white} />
            <Text style={styles.warnBtnTxt}>Upload Photos Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.warnCancelBtn} onPress={() => setShowPostTripWarning(false)}>
            <Text style={styles.warnCancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const trip = activeTripData?.[0];
  const customerName = trip?.bookingForName || '-';
  const customerPhone = trip?.bookingForPhone || '-';
  const pickupAddress = trip?.stops?.[0]?.address || '-';
  const dropAddress = trip?.stops?.[trip?.stops?.length - 1]?.address || '-';

  return (
    <View style={{ flex: 1 }}>
      <CustomeBottomSheet useScrollView={true}>

        {/* ── Start Navigation button ── */}
        {!disduration && tripsStatus !== 'COMPLETED' && (
          <TouchableOpacity
            style={[styles.navBtn, (routeLoading?.loading && routeLoading?.message !== 'initialState') && { opacity: 0.7 }]}
            onPress={onStartNavigationPress}
            disabled={routeLoading?.loading && routeLoading?.message !== 'initialState'}
            activeOpacity={0.85}>
            {routeLoading?.loading && routeLoading?.message !== 'initialState'
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <MaterialCommunityIcons name="navigation-variant-outline" size={20} color={Colors.white} />}
            <Text style={styles.navBtnTxt}>Start Navigation</Text>
          </TouchableOpacity>
        )}

        {/* ── Upload Photos & Bills (dummy) ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Upload Photos and Bills</Text>
          <TouchableOpacity style={styles.uploadRow} onPress={() => setStackScreen('DriverVehiclePhotosScreen')} activeOpacity={0.8}>
            <View style={styles.uploadIconWrap}>
              <MaterialCommunityIcons name="car-outline" size={22} color={Colors.white} />
            </View>
            <Text style={styles.uploadRowTxt}>Upload Vehicle Photos</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.cool_grey} />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.uploadRow} onPress={() => setStackScreen('DriverBillsExpensesScreen')} activeOpacity={0.8}>
            <View style={[styles.uploadIconWrap, { backgroundColor: '#E8EAF6' }]}>
              <MaterialCommunityIcons name="receipt" size={22} color="#3949AB" />
            </View>
            <Text style={styles.uploadRowTxt}>Upload Bills and Expenses</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.cool_grey} />
          </TouchableOpacity>
        </View>

        {/* ── Customer info (dummy) ── */}
        <View style={styles.sectionCard}>
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}>
              <Feather name="user" size={26} color="#0F223C" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerPhone}>{customerPhone}</Text>
              <Text style={[styles.customerStatus, { color: '#4CAF50' }]}>Status: {tripsStatus?.toLowerCase()}</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${customerPhone?.replace(/\s|-/g, '')}`)}>
              <Feather name="phone" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <MaterialCommunityIcons name="map-marker-distance" size={13} color="#0F223C" />
              <Text style={styles.statTxt}>{trip?.estimatedDistance ? `${parseFloat(trip.estimatedDistance).toFixed(1)} Km` : '-'}</Text>
            </View>
            <View style={styles.statChip}>
              <MaterialCommunityIcons name="clock-outline" size={13} color="#0F223C" />
              <Text style={styles.statTxt}>{trip?.estimatedDuration ? `${trip.estimatedDuration} mins` : '-'}</Text>
            </View>
            <View style={styles.statChip}>
              <MaterialCommunityIcons name="currency-inr" size={13} color="#0F223C" />
              <Text style={styles.statTxt}>{trip?.minFare || '0'}</Text>
            </View>
            <TouchableOpacity style={styles.helpBtn}>
              <MaterialCommunityIcons name="headset" size={13} color="#0F223C" />
              <Text style={styles.helpTxt}>HELP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Trip details (dummy collapsible) ── */}
        <View style={styles.sectionCard}>
          <View style={styles.tripDetailsHeader}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={18} color="#0F223C" />
            <Text style={styles.sectionTitle}>Trip Details</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#0F223C" style={{ marginLeft: 'auto' }} />
          </View>
          <View style={{ marginTop: 12 }}>
            <View style={styles.addressRow}>
              <View style={styles.dotBlue} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>PickUp Location</Text>
                <Text style={styles.addressVal} numberOfLines={1}>{pickupAddress}</Text>
              </View>
            </View>
            <View style={styles.addressDivLine} />
            <View style={styles.addressRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#E53935" />
              <View style={{ flex: 1, marginLeft: 4 }}>
                <Text style={styles.addressLabel}>Drop Location</Text>
                <Text style={styles.addressVal} numberOfLines={1}>{dropAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* bottom padding */}
        <View style={{ height: 100 }} />
      </CustomeBottomSheet>

      {/* ── SOS + End Trip footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.sosBtn} onPress={() => Linking.openURL('tel:112')} activeOpacity={0.8}>
          <View style={styles.sosDot}>
            <Text style={styles.sosDotTxt}>SOS</Text>
          </View>
          <Text style={styles.sosTxt}>SOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.endTripBtn} onPress={() => setCancelRideModalVisible(true)} activeOpacity={0.85}>
          <Text style={styles.endTripTxt}>
            {tripsStatus === 'PICKEDUP' ? 'End Trip' : 'Cancel Trip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {renderNavChoiceModal()}
      {renderPostTripWarning()}
      {cancelRideModalVisible && (
        <CancelRideModal
          modalVisible={cancelRideModalVisible}
          setModalVisible={setCancelRideModalVisible}
          callCancelRide={() => {
            setCancelRideModalVisible(false);
            if (tripsStatus === 'PICKEDUP') endTrip();
          }}
          loading={loading}
          tripData={trip}
        />
      )}
    </View>
  );
};

export default ActingDriverOnRideScreen;

const styles = StyleSheet.create({
  // Start Navigation
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F223C',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
  },
  navBtnTxt: { fontSize: 15, fontFamily: Fonts.bold, color: Colors.white, letterSpacing: 0.3 },

  // Section cards
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: { fontSize: 14, fontFamily: Fonts.semi_bold, color: '#0F223C', marginLeft: 6 },

  // Upload rows
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  uploadIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#0F223C', alignItems: 'center', justifyContent: 'center' },
  uploadRowTxt: { flex: 1, fontSize: 14, fontFamily: Fonts.medium, color: '#0F223C' },
  rowDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },

  // Customer info
  customerRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F4F8', alignItems: 'center', justifyContent: 'center' },
  customerName: { fontSize: 15, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  customerPhone: { fontSize: 12, fontFamily: Fonts.regular, color: '#757575', marginTop: 1 },
  customerStatus: { fontSize: 11, fontFamily: Fonts.medium, marginTop: 1 },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0F4F8', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
  statTxt: { fontSize: 11, fontFamily: Fonts.medium, color: '#0F223C' },
  helpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0F4F8', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, marginLeft: 'auto' },
  helpTxt: { fontSize: 11, fontFamily: Fonts.semi_bold, color: '#0F223C' },

  // Trip details
  tripDetailsHeader: { flexDirection: 'row', alignItems: 'center' },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  dotBlue: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#42A5F5', marginTop: 4 },
  addressDivLine: { width: 1, height: 16, backgroundColor: '#BDBDBD', marginLeft: 4, marginBottom: 4 },
  addressLabel: { fontSize: 10, fontFamily: Fonts.medium, color: '#42A5F5' },
  addressVal: { fontSize: 13, fontFamily: Fonts.regular, color: '#333', marginTop: 1 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
  },
  sosBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E53935', backgroundColor: Colors.white },
  sosDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
  sosDotTxt: { fontSize: 8, fontFamily: Fonts.bold, color: Colors.white },
  sosTxt: { fontSize: 14, fontFamily: Fonts.semi_bold, color: '#E53935' },
  endTripBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E53935', backgroundColor: Colors.white, alignItems: 'center' },
  endTripTxt: { fontSize: 15, fontFamily: Fonts.semi_bold, color: '#E53935' },

  // Nav choice modal
  navOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  navSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 12 },
  navHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 4 },
  navTitle: { fontSize: 16, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  navSub: { fontSize: 12, fontFamily: Fonts.regular, color: '#757575' },
  navOptionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  navOptionCard: { flex: 1, alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E8ECEF', gap: 6 },
  navOptionLabel: { fontSize: 14, fontFamily: Fonts.semi_bold, color: '#0F223C' },
  navOptionDesc: { fontSize: 11, fontFamily: Fonts.regular, color: '#757575', textAlign: 'center' },

  // Post-trip warning modal
  warnOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  warnBox: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, width: '100%', gap: 10 },
  warnTitle: { fontSize: 16, fontFamily: Fonts.semi_bold, color: '#BF360C', textAlign: 'center' },
  warnMsg: { fontSize: 13, fontFamily: Fonts.regular, color: '#555', textAlign: 'center', lineHeight: 18 },
  warnBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#E53935', paddingVertical: 13, borderRadius: 10, marginTop: 4 },
  warnBtnTxt: { fontSize: 14, fontFamily: Fonts.semi_bold, color: Colors.white },
  warnCancelBtn: { alignItems: 'center', paddingVertical: 8 },
  warnCancelTxt: { fontSize: 13, fontFamily: Fonts.medium, color: '#757575' },
});
