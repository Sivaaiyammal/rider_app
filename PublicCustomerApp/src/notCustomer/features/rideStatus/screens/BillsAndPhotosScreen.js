import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { getTripDetails, approveBill } from '../../../API/EndPoints/EndPoints';
import { getPresignedImageUrl } from '../../../../common/utils/getPresignedImageUrl';
import { colors, Fonts } from '../../../constants/constants';
import useUserInfoStore from '../../../../common/store/useUserInfoStore';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';

const PHOTO_LABELS = {
  front: 'Front',
  rear: 'Rear',
  leftSide: 'Left Side',
  rightSide: 'Right Side',
};

const normalizeKey = (url) =>
  url?.trim().replace(/^https?:\/\/[^/]+\/?/, '').replace(/^\//, '') || '';

const BillsAndPhotosScreen = ({ tripId }) => {
  const { goBack } = useStackScreenStore();
  const { userdetails } = useUserInfoStore();
  const token = userdetails?.token || null;

  const { bills: socketBills } = useCurrentRideInfoStore();
  // Track the last socketBills reference we processed so we only react to genuine changes
  const socketBillsRef = useRef(socketBills);

  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  // Keep a stable ref to bills so the socket sync effect can read it without being a dep
  const billsRef = useRef(bills);
  useEffect(() => { billsRef.current = bills; }, [bills]);
  const [driverInfo, setDriverInfo] = useState({});
  const [preTripPhotos, setPreTripPhotos] = useState({});
  const [postTripPhotos, setPostTripPhotos] = useState({});
  const [previewUri, setPreviewUri] = useState(null);
  // tracks per-bill action: 'payNow' | 'payLater' | 'rejected'
  const [billActions, setBillActions] = useState({});
  const [billLoadingIdx, setBillLoadingIdx] = useState(null);

  const resolveUrl = useCallback(
    async (rawUrl) => {
      const key = normalizeKey(rawUrl);
      if (!key || !token) return null;
      return getPresignedImageUrl(key, token);
    },
    [token],
  );

  const payViaUpi = async ({ amount, upiId, name }) => {
    const txnRef = `TXN${Date.now()}`;
    const note = 'Ride Bill Payment';

    const url =
      `upi://pay?pa=${encodeURIComponent(upiId)}` +
      `&pn=${encodeURIComponent(name)}` +
      `&tr=${encodeURIComponent(txnRef)}` +
      `&tn=${encodeURIComponent(note)}` +
      `&am=${encodeURIComponent(parseFloat(amount).toFixed(2))}` +
      `&cu=INR`;

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Error', 'No UPI app found on this device');
      return false;
    }

    try {
      await Linking.openURL(url);
      return true;
    } catch (e) {
      Alert.alert('Error', 'Unable to open UPI app');
      return false;
    }
  };

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    let active = true;

    const fetchData = async () => {
      try {
        const data = await getTripDetails(tripId);
        if (!active) return;

        const tripBills = data?.trip?.bills?.bills || [];
        const preRaw = data?.trip?.bills?.preTripVehiclePhotos || {};
        const postRaw = data?.trip?.bills?.postTripVehiclePhotos || {};

        // Resolve receipt photos for bills
        const billsWithUrls = await Promise.all(
          tripBills.map(async (bill) => ({
            ...bill,
            receiptPhotoUri: bill.receiptPhoto
              ? await resolveUrl(bill.receiptPhoto)
              : null,
          })),
        );
        if (!active) return;

        // Resolve pre-trip vehicle photo URLs
        const resolvedPre = {};
        for (const key of Object.keys(PHOTO_LABELS)) {
          if (preRaw[key]) {
            resolvedPre[key] = await resolveUrl(preRaw[key]);
          }
        }
        if (!active) return;

        // Resolve post-trip vehicle photo URLs
        const resolvedPost = {};
        for (const key of Object.keys(PHOTO_LABELS)) {
          if (postRaw[key]) {
            resolvedPost[key] = await resolveUrl(postRaw[key]);
          }
        }
        if (!active) return;

        setBills(billsWithUrls);
        setPreTripPhotos(resolvedPre);
        setPostTripPhotos(resolvedPost);
        setDriverInfo(data?.trip?.driverInfo || {});

        // Seed billActions from existing approval values
        const initialActions = {};
        billsWithUrls.forEach((bill, idx) => {
          if (bill.approval === 'approved') initialActions[idx] = 'payNow';
          if (bill.approval === 'rejected') initialActions[idx] = 'rejected';
        });
        setBillActions(initialActions);
      } catch (e) {
        // silently handle
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [tripId, resolveUrl]);

  // Sync bills from socket store when driver adds or deletes a bill in real-time
  useEffect(() => {
    // Skip if no change in the socket store reference (same object = no new socket event)
    if (socketBills === socketBillsRef.current) return;
    socketBillsRef.current = socketBills;
    // Don't update while the initial API fetch is still running (it will set bills itself)
    if (loading) return;
    if (!socketBills?.bills) return;

    let active = true;
    (async () => {
      try {
        const tripBills = socketBills.bills;
        const billsWithUrls = await Promise.all(
          tripBills.map(async (bill) => {
            // Reuse an already-resolved URL for the same receipt photo key
            const existing = billsRef.current.find(b => b.receiptPhoto && b.receiptPhoto === bill.receiptPhoto);
            return {
              ...bill,
              receiptPhotoUri:
                existing?.receiptPhotoUri ||
                (bill.receiptPhoto ? await resolveUrl(bill.receiptPhoto) : null),
            };
          }),
        );
        if (!active) return;
        setBills(billsWithUrls);
        // Re-seed bill action states from approval values
        const newActions = {};
        billsWithUrls.forEach((bill, idx) => {
          if (bill.approval === 'approved') newActions[idx] = 'payNow';
          if (bill.approval === 'rejected') newActions[idx] = 'rejected';
        });
        setBillActions(newActions);
      } catch {
        // silently handle
      }
    })();

    return () => {
      active = false;
    };
  }, [socketBills, loading, resolveUrl, bills]);

  const hasPrePhotos = Object.values(preTripPhotos).some(Boolean);
  const hasPostPhotos = Object.values(postTripPhotos).some(Boolean);
  const isEmpty = !loading && bills.length === 0 && !hasPrePhotos && !hasPostPhotos;

  const handleBillAction = async (idx, action) => {
    if (action === 'payNow') {
      const bill = bills[idx];
      const opened = await payViaUpi({
        amount: bill.amount,
        upiId: driverInfo?.upiid || '',
        name: driverInfo?.driverName || 'Driver',
      });
      if (!opened) return;
    }

    if (action === 'approved') return

    const approval = action === 'rejected' ? 'rejected' : 'approved';
    setBillLoadingIdx(idx);
    try {
      const res = await approveBill(String(tripId), idx, approval);
      if (res?.success) {
        setBillActions(prev => ({ ...prev, [idx]: action }));
      } else {
        Alert.alert('Error', res?.message || 'Could not update bill.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setBillLoadingIdx(null);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color={colors.black || '#000'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bills & Photos</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary || '#000'} />
        </View>
      ) : isEmpty ? (
        <View style={styles.centered}>
          <Ionicons name="document-outline" size={52} color="#ccc" />
          <Text style={styles.emptyText}>No bills or photos added by driver</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Driver Bills */}
          {bills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Bills / Expenses</Text>
              {bills.map((bill, idx) => {
                const action = billActions[idx] || null;
                const isLoading = billLoadingIdx === idx;
                return (
                  <View key={idx} style={styles.billCard}>
                    <View style={styles.billRow}>
                      <Text style={styles.billDesc}>{bill.description || 'Expense'}</Text>
                      <Text style={styles.billAmount}>₹{parseFloat(bill.amount || 0).toFixed(2)}</Text>
                    </View>

                    {bill.receiptPhotoUri && (
                      <TouchableOpacity onPress={() => setPreviewUri(bill.receiptPhotoUri)} activeOpacity={0.8}>
                        <Image source={{ uri: bill.receiptPhotoUri }} style={styles.receiptThumb} resizeMode="cover" />
                      </TouchableOpacity>
                    )}

                    {/* Action area */}
                    {action ? (
                      <View style={[
                        styles.badge,
                        action === 'rejected' ? styles.badgeRejected : styles.badgeApproved,
                      ]}>
                        <Ionicons
                          name={action === 'rejected' ? 'close-circle' : 'checkmark-circle'}
                          size={13}
                          color={action === 'rejected' ? '#E53935' : '#43A047'}
                        />
                        <Text style={[
                          styles.badgeTxt,
                          action === 'rejected' ? styles.badgeTxtRejected : styles.badgeTxtApproved,
                        ]}>
                          {action === 'rejected' ? 'Rejected' : 'Paid'}
                        </Text>
                      </View>
                    ) : isLoading ? (
                      <ActivityIndicator size="small" color={colors.primary || '#5C6BC0'} style={{ alignSelf: 'center', marginTop: 8 }} />
                    ) : (
                      <View style={styles.actionRow}>
                        {/* <TouchableOpacity
                          style={[styles.actionBtn, styles.payNowBtn]}
                          onPress={() => handleBillAction(idx, 'payNow')}
                          activeOpacity={0.8}>
                          <Ionicons name="checkmark" size={13} color="#fff" />
                          <Text style={styles.actionTxt}>Make Payment</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.rejectBtn]}
                          onPress={() => handleBillAction(idx, 'rejected')}
                          activeOpacity={0.8}>
                          <Ionicons name="close" size={13} color="#fff" />
                          <Text style={styles.actionTxt}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Pre-trip Vehicle Photos */}
          {hasPrePhotos && (
            <PhotoSection
              title="Pre-trip Vehicle Photos"
              photos={preTripPhotos}
              onPress={setPreviewUri}
            />
          )}

          {/* Post-trip Vehicle Photos */}
          {hasPostPhotos && (
            <PhotoSection
              title="Post-trip Vehicle Photos"
              photos={postTripPhotos}
              onPress={setPreviewUri}
            />
          )}
        </ScrollView>
      )}

      {/* Full-screen Image Preview */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewUri(null)} activeOpacity={0.8}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {previewUri && (
            <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const PhotoSection = ({ title, photos, onPress }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.photoGrid}>
      {Object.entries(PHOTO_LABELS).map(([key, label]) =>
        photos[key] ? (
          <TouchableOpacity
            key={key}
            style={styles.photoItem}
            onPress={() => onPress(photos[key])}
            activeOpacity={0.8}>
            <Image source={{ uri: photos[key] }} style={styles.photoThumb} resizeMode="cover" />
            <Text style={styles.photoLabel}>{label}</Text>
          </TouchableOpacity>
        ) : null,
      )}
    </View>
  </View>
);

PhotoSection.propTypes = {
  title: PropTypes.string.isRequired,
  photos: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

BillsAndPhotosScreen.propTypes = {
  tripId: PropTypes.string,
};

export default BillsAndPhotosScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    padding: 4,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: '#111',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: '#212121',
    marginBottom: 12,
  },
  billCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billDesc: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#212121',
    flex: 1,
  },
  billAmount: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#212121',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },
  badgeApproved: { backgroundColor: '#E8F5E9' },
  badgeRejected: { backgroundColor: '#FFEBEE' },
  badgeTxt: { fontSize: 12, fontFamily: Fonts.regular },
  badgeTxtApproved: { color: '#43A047' },
  badgeTxtRejected: { color: '#E53935' },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payNowBtn: { backgroundColor: '#43A047' },
  rejectBtn: { backgroundColor: '#E53935' },
  actionTxt: { fontSize: 12, fontFamily: Fonts.medium, color: '#fff' },
  receiptThumb: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoItem: {
    width: '47%',
    alignItems: 'center',
  },
  photoThumb: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  photoLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
});
