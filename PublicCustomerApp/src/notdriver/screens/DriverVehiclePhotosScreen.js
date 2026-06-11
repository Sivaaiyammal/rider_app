/**
 * DriverVehiclePhotosScreen
 * Combined screen for uploading pre-trip AND post-trip vehicle photos.
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts } from '../../common/constants/constants';
import {
  checkCameraPermission,
  RequestCameraPermission,
} from '../../common/controllers/PermissionHandler';
import { useStackScreenStore } from '../../common/store/useStackScreenStore';
import useActingDriverMediaStore from '../store/useActingDriverMediaStore';
import useUserStore from '../../common/store/useUserStore';
import useTripsStore from '../store/useTripsStore';
import { useTripAcceptStore } from '../store/useTripAcceptStore';
import APIRequest from '../../common/APIRequest';
import { getPresignedImageUrl } from '../../common/utils/getPresignedImageUrl';
import UseBackButton from '../../common/hooks/UseBackButton';
import { useTranslation } from 'react-i18next';

const PHOTO_SLOTS = [
  { key: 'front',     label: 'front',      icon: 'car-back' },
  { key: 'rear',      label: 'rear',       icon: 'car' },
  { key: 'leftSide',  label: 'left_side',  icon: 'car-side' },
  { key: 'rightSide', label: 'right_side', icon: 'car-side' },
];

const pickImage = async (source, callback) => {
  const options = { mediaType: 'photo', maxWidth: 1200, maxHeight: 1200, quality: 0.85 };
  const handler = res => {
    if (res.didCancel || !res.assets?.[0]) return;
    const a = res.assets[0];
    callback({ uri: a.uri, type: a.type || 'image/jpeg', name: a.fileName || `photo_${Date.now()}.jpg` });
  };
  if (source === 'camera') {
    const hasPerm = await checkCameraPermission();
    if (!hasPerm) { await RequestCameraPermission(); return; }
    launchCamera(options, handler);
  } else {
    launchImageLibrary(options, handler);
  }
};

const PhotoSlot = ({ slotKey, label, icon, image, onPick, loading, t }) => {
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);
  const handle = async src => { setBusy(true); await pickImage(src, img => onPick(slotKey, img)); setBusy(false); };

  useEffect(() => { setImgError(false); }, [image?.uri]);

  return (
    <View style={ps.slot}>
      {loading ? (
        <>
          <View style={[ps.emptyThumb, ps.loadingThumb]}>
            <ActivityIndicator size="small" color={Colors.periwinkle} />
          </View>
          <Text style={ps.label}>{label}</Text>
        </>
      ) : image ? (
        <>
          <View style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden' }}>
            <Image
              source={{ uri: image.uri }}
              style={ps.thumb}
              onError={() => setImgError(true)}
            />
            {imgError && (
              <View style={ps.imgOverlay}>
                <MaterialCommunityIcons name="image-broken-variant" size={24} color="#C0C0C0" />
              </View>
            )}
          </View>
          <View style={ps.footer}>
            <Text style={ps.label}>{t(label)}</Text>
            <TouchableOpacity style={ps.reBtn} onPress={() => handle('camera')} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera-retake-outline" size={13} color={Colors.white} />
              <Text style={ps.reTxt}>{t('retake')}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={ps.emptyThumb}>
            <MaterialCommunityIcons name={icon} size={30} color="#C0C0C0" />
          </View>
          <Text style={ps.label}>{t(label)}</Text>
          <View style={ps.pickRow}>
            <TouchableOpacity style={ps.pickBtn} onPress={() => handle('camera')} disabled={busy} activeOpacity={0.8}>
              {busy
                ? <ActivityIndicator size="small" color={Colors.periwinkle} />
                : <><MaterialCommunityIcons name="camera-outline" size={14} color={Colors.periwinkle} /><Text style={ps.pickTxt}>{t('camera')}</Text></>}
            </TouchableOpacity>
            <TouchableOpacity style={ps.pickBtn} onPress={() => handle('gallery')} disabled={busy} activeOpacity={0.8}>
              <MaterialCommunityIcons name="image-outline" size={14} color={Colors.periwinkle} />
              <Text style={ps.pickTxt}>{t('gallery')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const ps = StyleSheet.create({
  slot: { width: '47%', borderRadius: 12, borderWidth: 1.5, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA', padding: 10, alignItems: 'center', gap: 6 },
  thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  emptyThumb: { width: '100%', height: 100, borderRadius: 8, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  loadingThumb: { backgroundColor: '#E8E8FF' },
  label: { fontSize: 11, fontFamily: Fonts.medium, color: Colors.grey_dark, textTransform: 'uppercase', letterSpacing: 0.5 },
  footer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.periwinkle, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6 },
  reTxt: { fontSize: 10, fontFamily: Fonts.medium, color: Colors.white },
  pickRow: { flexDirection: 'row', gap: 6, width: '100%' },
  pickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F0F0FF', borderWidth: 1, borderColor: Colors.periwinkle + '44' },
  pickTxt: { fontSize: 10, fontFamily: Fonts.medium, color: Colors.periwinkle },
});

/* ─── main screen ─────────────────────────────────────────── */
const DriverVehiclePhotosScreen = () => {
  const { goBack } = useStackScreenStore();
  const {
    preTripPhotos, setPreTripPhotos, setPreTripDone,
    dentPhotos, setDentPhotos, setDentPhotosDone,
    odometerPhoto, setOdometerPhoto, setOdometerPhotoDone,
  } = useActingDriverMediaStore();
  const { userInfo } = useUserStore();
  const { activeTripData } = useTripsStore();
  const { upComingTripDetails } = useTripAcceptStore();
  const tripId = upComingTripDetails?._id || activeTripData?.[0]?._id;
  const isApproved = upComingTripDetails?.bills?.vehiclePhotosApproved === true ||
    activeTripData?.[0]?.bills?.vehiclePhotosApproved === true;

  const [loadingFromServer, setLoadingFromServer] = useState(false);

  const [preUploaded, setPreUploaded] = useState(false);
  const [dentUploaded, setDentUploaded] = useState(false);
  const [odometerUploaded, setOdometerUploaded] = useState(false);

  const { t } = useTranslation();

  const toObjectKey = url => {
    if (!url) return null;
    try { return decodeURIComponent(new URL(url).pathname.replace(/^\//, '')); }
    catch { return url.replace(/^https?:\/\/[^/]+\//, ''); }
  };

  const resolveSlot = async (rawUrl, name) => {
    if (!rawUrl) return null;
    const key = toObjectKey(rawUrl);
    const presigned = key ? await getPresignedImageUrl(key, userInfo?.token) : null;
    return { uri: presigned || rawUrl, type: 'image/jpeg', name };
  };

  // Seed from server
  useEffect(() => {
    const serverBills = activeTripData?.[0]?.bills;
    if (!serverBills) return;

    (async () => {
      setLoadingFromServer(true);
      try {
        const pre = serverBills.preTripVehiclePhotos;
        if (pre?.front && !Object.values(preTripPhotos).some(Boolean)) {
          const [front, rear, leftSide, rightSide] = await Promise.all([
            resolveSlot(pre.front, 'pre_front.jpg'),
            resolveSlot(pre.rear, 'pre_rear.jpg'),
            resolveSlot(pre.leftSide, 'pre_leftSide.jpg'),
            resolveSlot(pre.rightSide, 'pre_rightSide.jpg'),
          ]);
          const seeded = { front, rear, leftSide, rightSide };
          if (Object.values(seeded).some(Boolean)) { setPreTripPhotos(seeded); setPreUploaded(true); }
        }

        // Seed Dent Photos
        if (serverBills.dentPhotos && serverBills.dentPhotos.length > 0 && dentPhotos.length === 0) {
          const seededDents = await Promise.all(serverBills.dentPhotos.map(async (url, idx) => {
            return await resolveSlot(url, `dent_${idx}.jpg`);
          }));
          setDentPhotos(seededDents.filter(Boolean));
          setDentUploaded(true);
        }

        // Seed Odometer Photo
        if (serverBills.odometerPhoto && !odometerPhoto) {
          const seededOdometer = await resolveSlot(serverBills.odometerPhoto, 'odometer.jpg');
          if (seededOdometer) {
            setOdometerPhoto(seededOdometer);
            setOdometerUploaded(true);
          }
        }

      } finally {
        setLoadingFromServer(false);
      }
    })();
  }, [activeTripData]);

  const preDoneCount = Object.values(preTripPhotos).filter(Boolean).length;
  const preAllDone = preDoneCount === 4;

  const [preExpanded, setPreExpanded] = useState(true);
  const [dentExpanded, setDentExpanded] = useState(true);
  const [odometerExpanded, setOdometerExpanded] = useState(true);

  const [autoUploadingPre, setAutoUploadingPre] = useState(false);
  const [autoUploadingDent, setAutoUploadingDent] = useState(false);
  const [autoUploadingOdometer, setAutoUploadingOdometer] = useState(false);
  const [submittingPhotos, setSubmittingPhotos] = useState(false);

  const uploadPre = async (photos) => {
    if (!tripId) return false;
    try {
      const formData = new FormData();
      formData.append('tripId', tripId);
      formData.append('phase', 'pre');
      formData.append('preFront',     { uri: photos.front.uri,     type: photos.front.type,     name: photos.front.name });
      formData.append('preRear',      { uri: photos.rear.uri,      type: photos.rear.type,      name: photos.rear.name });
      formData.append('preLeftSide',  { uri: photos.leftSide.uri,  type: photos.leftSide.type,  name: photos.leftSide.name });
      formData.append('preRightSide', { uri: photos.rightSide.uri, type: photos.rightSide.type, name: photos.rightSide.name });
      const api = new APIRequest();
      const res = await api.request('/publicrides/driver/v2/uploadTripMedia', 'POST', formData, userInfo?.token);
      if (res.success) { setPreUploaded(true); setPreTripDone(true); return true; }
      return false;
    } catch { return false; }
  };

  const uploadDent = async (photos) => {
    if (!photos.length || !tripId) return false;
    try {
      const formData = new FormData();
      formData.append('tripId', tripId);
      formData.append('phase', 'dent');
      photos.forEach((photo, idx) => {
        formData.append(`dentPhoto_${idx}`, { uri: photo.uri, type: photo.type, name: photo.name || `dent_${idx}.jpg` });
      });
      const api = new APIRequest();
      const res = await api.request('/publicrides/driver/v2/uploadTripMedia', 'POST', formData, userInfo?.token);
      if (res.success) { setDentUploaded(true); setDentPhotosDone(true); return true; }
      return false;
    } catch { return false; }
  };

  const uploadOdometer = async (photo) => {
    if (!photo || !tripId) return false;
    try {
      const formData = new FormData();
      formData.append('tripId', tripId);
      formData.append('phase', 'odometer');
      formData.append('odometerPhoto', { uri: photo.uri, type: photo.type, name: photo.name || 'odometer.jpg' });
      const api = new APIRequest();
      const res = await api.request('/publicrides/driver/v2/uploadTripMedia', 'POST', formData, userInfo?.token);
      if (res.success) { setOdometerUploaded(true); setOdometerPhotoDone(true); return true; }
      return false;
    } catch { return false; }
  };

  // Auto-upload pre-trip when all 4 are captured
  useEffect(() => {
    const all4 = preTripPhotos.front && preTripPhotos.rear && preTripPhotos.leftSide && preTripPhotos.rightSide;
    if (!all4 || preUploaded || autoUploadingPre) return;
    setPreUploaded(false);
    setAutoUploadingPre(true);
    uploadPre(preTripPhotos).then(ok => {
      setAutoUploadingPre(false);
      if (!ok) Alert.alert('Upload Failed', 'Could not upload pre-trip photos. Please try retaking.');
    });
  }, [preTripPhotos]);

  // Auto-upload dent photos when a new one is added
  useEffect(() => {
    if (!dentPhotos.length || autoUploadingDent) return;
    setDentUploaded(false);
    setAutoUploadingDent(true);
    uploadDent(dentPhotos).then(ok => {
      setAutoUploadingDent(false);
      if (!ok) Alert.alert('Upload Failed', 'Could not upload dent photos. Please try again.');
    });
  }, [dentPhotos]);

  // Auto-upload odometer when photo is picked
  useEffect(() => {
    if (!odometerPhoto || odometerUploaded || autoUploadingOdometer) return;
    setAutoUploadingOdometer(true);
    uploadOdometer(odometerPhoto).then(ok => {
      setAutoUploadingOdometer(false);
      if (!ok) Alert.alert('Upload Failed', 'Could not upload odometer photo. Please retake.');
    });
  }, [odometerPhoto]);

  const onPickPre = (key, img) => { setPreTripPhotos({ ...preTripPhotos, [key]: img }); setPreUploaded(false); };

  const onPickDent = async (source) => {
    await pickImage(source, (img) => { setDentPhotos([...dentPhotos, img]); });
  };

  const removeDent = (index) => {
    const newPhotos = [...dentPhotos];
    newPhotos.splice(index, 1);
    setDentPhotos(newPhotos);
    setDentUploaded(false);
  };

  const onPickOdometer = (_key, img) => { setOdometerPhoto(img); setOdometerUploaded(false); };

  const allUploaded =
    preUploaded &&
    (dentPhotos.length === 0 || dentUploaded) &&
    odometerUploaded;

  const handleUpload = async () => {
    if (!preAllDone) { Alert.alert(t('photos_required'), t('please_capture_all_4_pre_trip_photos')); return; }
    if (!odometerPhoto) { Alert.alert(t('photos_required'), t('please_capture_odometer_photo')); return; }
    setSubmittingPhotos(true);
    if (!preUploaded) {
      const ok = await uploadPre(preTripPhotos);
      if (!ok) { Alert.alert('Upload Failed', 'Could not upload pre-trip photos.'); setSubmittingPhotos(false); return; }
    }
    if (dentPhotos.length > 0 && !dentUploaded) {
      const ok = await uploadDent(dentPhotos);
      if (!ok) { Alert.alert('Upload Failed', 'Could not upload dent photos.'); setSubmittingPhotos(false); return; }
    }
    if (!odometerUploaded) {
      const ok = await uploadOdometer(odometerPhoto);
      if (!ok) { Alert.alert('Upload Failed', 'Could not upload odometer photo.'); setSubmittingPhotos(false); return; }
    }
    setSubmittingPhotos(false);
  };

  const submitToCustomer = () => {
    goBack();
  };

  if (isApproved) {
    const bills = upComingTripDetails?.bills || activeTripData?.[0]?.bills || {};
    const prePhotos = Object.values(preTripPhotos).filter(Boolean);
    const serverPrePhotos = bills.preTripVehiclePhotos
      ? Object.values(bills.preTripVehiclePhotos).filter(Boolean)
      : [];
    const displayPrePhotos = prePhotos.length ? prePhotos.map(p => p.uri) : serverPrePhotos;
    const displayDentPhotos = dentPhotos.length
      ? dentPhotos.map(p => p.uri)
      : (bills.dentPhotos || []);
    const displayOdometer = odometerPhoto?.uri || bills.odometerPhoto || null;

    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <UseBackButton onBackPress={goBack} />
          <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.black} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Vehicle Photos</Text>
            <Text style={styles.subtitle}>Reviewed by customer</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Approved Banner */}
          <View style={styles.approvedBanner}>
            <MaterialCommunityIcons name="shield-check" size={28} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.approvedBannerTitle}>Customer Approved</Text>
              <Text style={styles.approvedBannerSub}>Vehicle condition photos have been verified and approved.</Text>
            </View>
          </View>

          {/* Pre-trip photos */}
          {displayPrePhotos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="car-back" size={18} color="#43A047" />
                <Text style={styles.sectionTitle}>Pre-trip Photos</Text>
                <MaterialCommunityIcons name="check-circle" size={16} color="#43A047" />
              </View>
              <View style={styles.grid}>
                {displayPrePhotos.map((uri, idx) => (
                  <View key={idx} style={[ps.slot, styles.approvedPhotoSlot]}>
                    <View style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden' }}>
                      <Image source={{ uri }} style={ps.thumb} />
                    </View>
                    <Text style={ps.label}>{['FRONT', 'REAR', 'LEFT', 'RIGHT'][idx] || ''}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Dent photos */}
          {displayDentPhotos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="car-door" size={18} color="#43A047" />
                <Text style={styles.sectionTitle}>Dent Photos</Text>
                <MaterialCommunityIcons name="check-circle" size={16} color="#43A047" />
              </View>
              <View style={styles.grid}>
                {displayDentPhotos.map((uri, idx) => (
                  <View key={idx} style={[ps.slot, styles.approvedPhotoSlot]}>
                    <View style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden' }}>
                      <Image source={{ uri }} style={ps.thumb} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Odometer */}
          {displayOdometer && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="speedometer" size={18} color="#43A047" />
                <Text style={styles.sectionTitle}>Odometer</Text>
                <MaterialCommunityIcons name="check-circle" size={16} color="#43A047" />
              </View>
              <View style={{ borderRadius: 10, overflow: 'hidden' }}>
                <Image source={{ uri: displayOdometer }} style={{ width: '100%', height: 160, resizeMode: 'cover' }} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footerWrap}>
          <TouchableOpacity style={styles.submitBtn} onPress={goBack} activeOpacity={0.8}>
            <Text style={styles.submitBtnTxt}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <UseBackButton onBackPress={goBack} />
        <TouchableOpacity style={styles.backBtn} onPress={() => goBack()} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{t('vehicle_photos')}</Text>
          <Text style={styles.subtitle}>{t('upload_before_after_trip_photos')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Pre-trip Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => setPreExpanded(v => !v)} activeOpacity={0.8}>
            <MaterialCommunityIcons name="car-back" size={18} color={Colors.periwinkle} />
            <Text style={styles.sectionTitle}>{t('pre_trip_photos')}</Text>
            <Text style={styles.progressTxt}>{preDoneCount}/4</Text>
            {preUploaded && (
              <View style={styles.uploadedBadge}>
                <MaterialCommunityIcons name="check-circle" size={13} color="#43A047" />
                <Text style={styles.uploadedTxt}>{t('uploaded')}</Text>
              </View>
            )}
            <MaterialCommunityIcons
              name={preExpanded ? 'chevron-up' : 'chevron-down'}
              size={20} color={Colors.grey_dark} style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
          {preExpanded && (
            <>
              <View style={styles.grid}>
                {PHOTO_SLOTS.map(s => (
                  <PhotoSlot key={s.key} slotKey={s.key} label={s.label} icon={s.icon} t={t}
                    image={preTripPhotos[s.key]} onPick={onPickPre} loading={loadingFromServer} />
                ))}
              </View>
              {autoUploadingPre && (
                <View style={styles.autoUploadingRow}>
                  <ActivityIndicator size="small" color={Colors.periwinkle} />
                  <Text style={styles.autoUploadingTxt}>Uploading photos...</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Dent Photos Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => setDentExpanded(v => !v)} activeOpacity={0.8}>
            <MaterialCommunityIcons name="car-door" size={18} color={Colors.periwinkle} />
            <Text style={styles.sectionTitle}>{t('dent_photos', 'Dent Photos')}</Text>
            <Text style={styles.progressTxt}>{dentPhotos.length} {t('photos', 'photos')}</Text>
            {dentUploaded && (
              <View style={styles.uploadedBadge}>
                <MaterialCommunityIcons name="check-circle" size={13} color="#43A047" />
                <Text style={styles.uploadedTxt}>{t('uploaded')}</Text>
              </View>
            )}
            <MaterialCommunityIcons
              name={dentExpanded ? 'chevron-up' : 'chevron-down'}
              size={20} color={Colors.grey_dark} style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
          {dentExpanded && (
            <>
              <View style={styles.grid}>
                {dentPhotos.map((photo, index) => (
                  <View key={index} style={ps.slot}>
                    <View style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden' }}>
                      <Image source={{ uri: photo.uri }} style={ps.thumb} />
                      <TouchableOpacity
                        style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 2 }}
                        onPress={() => removeDent(index)}
                      >
                        <MaterialCommunityIcons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                {/* Add New Dent Button */}
                <View style={ps.slot}>
                  <View style={ps.emptyThumb}>
                    <MaterialCommunityIcons name="image-plus" size={30} color="#C0C0C0" />
                  </View>
                  <View style={ps.pickRow}>
                    <TouchableOpacity style={ps.pickBtn} onPress={() => onPickDent('camera')} activeOpacity={0.8}>
                      <MaterialCommunityIcons name="camera-outline" size={14} color={Colors.periwinkle} />
                    </TouchableOpacity>
                    <TouchableOpacity style={ps.pickBtn} onPress={() => onPickDent('gallery')} activeOpacity={0.8}>
                      <MaterialCommunityIcons name="image-outline" size={14} color={Colors.periwinkle} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {autoUploadingDent && (
                <View style={styles.autoUploadingRow}>
                  <ActivityIndicator size="small" color={Colors.periwinkle} />
                  <Text style={styles.autoUploadingTxt}>Uploading photos...</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Odometer Photo Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => setOdometerExpanded(v => !v)} activeOpacity={0.8}>
            <MaterialCommunityIcons name="speedometer" size={18} color={Colors.periwinkle} />
            <Text style={styles.sectionTitle}>{t('odometer_photo', 'Odometer Photo')}</Text>
            <Text style={styles.progressTxt}>{odometerPhoto ? 1 : 0}/1</Text>
            {odometerUploaded && (
              <View style={styles.uploadedBadge}>
                <MaterialCommunityIcons name="check-circle" size={13} color="#43A047" />
                <Text style={styles.uploadedTxt}>{t('uploaded')}</Text>
              </View>
            )}
            <MaterialCommunityIcons
              name={odometerExpanded ? 'chevron-up' : 'chevron-down'}
              size={20} color={Colors.grey_dark} style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
          {odometerExpanded && (
            <>
              <View style={styles.grid}>
                <PhotoSlot
                  slotKey="odometer"
                  label="odometer"
                  icon="speedometer"
                  t={t}
                  image={odometerPhoto}
                  onPick={onPickOdometer}
                  loading={loadingFromServer}
                />
              </View>
              {autoUploadingOdometer && (
                <View style={styles.autoUploadingRow}>
                  <ActivityIndicator size="small" color={Colors.periwinkle} />
                  <Text style={styles.autoUploadingTxt}>Uploading photo...</Text>
                </View>
              )}
            </>
          )}
        </View>

      </ScrollView>

      <View style={styles.footerWrap}>
        {allUploaded ? (
          <TouchableOpacity style={styles.submitBtn} onPress={submitToCustomer} activeOpacity={0.8}>
            <MaterialCommunityIcons name="send-outline" size={18} color={Colors.white} />
            <Text style={styles.submitBtnTxt}>Send to Customer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.uploadActionBtn, (!preAllDone || !odometerPhoto || submittingPhotos || autoUploadingPre || autoUploadingDent || autoUploadingOdometer) && styles.uploadBtnDisabled]}
            onPress={handleUpload}
            disabled={!preAllDone || !odometerPhoto || submittingPhotos || autoUploadingPre || autoUploadingDent || autoUploadingOdometer}
            activeOpacity={0.8}>
            {submittingPhotos
              ? <><ActivityIndicator size="small" color={Colors.white} /><Text style={styles.submitBtnTxt}>Uploading...</Text></>
              : <><MaterialCommunityIcons name="cloud-upload-outline" size={18} color={Colors.white} /><Text style={styles.submitBtnTxt}>Upload Photos</Text></>}
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

export default DriverVehiclePhotosScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  title: { fontSize: 16, fontFamily: Fonts.semi_bold, color: Colors.black },
  subtitle: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.grey_dark, marginTop: 2 },
  body: { padding: 16, gap: 16, paddingBottom: 30 },
  section: {
    backgroundColor: '#FAFAFA', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#EBEBEB', gap: 12,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 14, fontFamily: Fonts.semi_bold, color: Colors.black, flex: 1 },
  progressTxt: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.grey_dark },
  uploadedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  uploadedTxt: { fontSize: 11, fontFamily: Fonts.medium, color: '#43A047' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.periwinkle, paddingVertical: 12, borderRadius: 10,
  },
  uploadBtnDisabled: { backgroundColor: '#BDBDBD' },
  uploadBtnTxt: { fontSize: 13, fontFamily: Fonts.medium, color: Colors.white },
  autoUploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 4 },
  autoUploadingTxt: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.periwinkle },
  approvedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#43A047', borderRadius: 14,
    padding: 16, marginBottom: 4,
  },
  approvedBannerTitle: { fontSize: 15, fontFamily: Fonts.bold, color: '#fff' },
  approvedBannerSub: { fontSize: 12, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  approvedPhotoSlot: { borderColor: '#A5D6A7' },
  footerWrap: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderColor: '#F0F0F0' },
  submitBtn: { backgroundColor: '#352166', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadActionBtn: { backgroundColor: Colors.periwinkle, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnTxt: { fontSize: 16, fontFamily: Fonts.semi_bold, color: Colors.white },
});


