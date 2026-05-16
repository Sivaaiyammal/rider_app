import React, {useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import PropTypes from 'prop-types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../../common/constants/constants';
import useUserStore from '../../common/store/useUserStore';
import usePublicDriverStore from '../store/usePublicDriverStore';
import {useStackScreenStore} from '../../common/store/useStackScreenStore';
import APIRequest from '../../common/APIRequest';
import {showNotification} from '../../common/components/Alerts/showNotification';

// Required field definitions per mode
const DRIVER_REQUIRED = [
  {key: 'location',   label: 'Home location',       check: (s) => !!s.locationCompleteStatus},
  {key: 'personal',   label: 'Personal details',     check: (s) => !!s.driverDetailsCompleteStatus},
  {key: 'vehicle',    label: 'Vehicle details & docs', check: (s) => !!s.vehicleDetailsCompleteStatus},
  {key: 'bank',       label: 'Bank / UPI details',   check: (s) => !!s.bankDetailsCompleteStatus},
  {key: 'documents',  label: 'ID documents (Aadhar/PAN)', check: (s) => !!s.documentsCompleteStatus},
];

const ACTING_REQUIRED = [
  {key: 'location',          label: 'Home location',                check: (s) => !!s.locationCompleteStatus},
  {key: 'personal',          label: 'Personal details',              check: (s) => !!s.driverDetailsCompleteStatus},
  {key: 'documents',         label: 'ID documents (Aadhar/PAN)',     check: (s) => !!s.documentsCompleteStatus},
  {key: 'drivingExperience', label: 'Driving experience',            check: (s) => Boolean(s.driverInfo?.drivingExperience?.totalExperience)},
  {key: 'vehicleHandling',   label: 'Vehicle handling experience',   check: (s) => Boolean(s.driverInfo?.vehicleHandling?.vehicleTypes?.length > 0 && s.driverInfo?.vehicleHandling?.transmission?.length > 0)},
];

const MODES = [
  {
    key: 'driver',
    label: 'Driver',
    subtitle: 'Own your vehicle & earnings',
    icon: 'drive-eta',
  },
  {
    key: 'acting_driver',
    label: 'Acting Driver',
    subtitle: 'Drive customer vehicles on request',
    icon: 'swap-horiz',
  },
];

const DriverModeModal = ({visible, onClose}) => {
  const {driverMode, setDriverMode, userInfo} = useUserStore();
  const {setStackScreen} = useStackScreenStore();
  const storeStatus = usePublicDriverStore(s => ({
    locationCompleteStatus: s.locationCompleteStatus,
    driverDetailsCompleteStatus: s.driverDetailsCompleteStatus,
    vehicleDetailsCompleteStatus: s.vehicleDetailsCompleteStatus,
    bankDetailsCompleteStatus: s.bankDetailsCompleteStatus,
    documentsCompleteStatus: s.documentsCompleteStatus,
    driverInfo: s.driverInfo,
  }));

  const [selectedSingleMode, setSelectedSingleMode] = useState(driverMode === 'both' ? 'driver' : (driverMode || 'driver'));
  const [bothMode, setBothMode] = useState(driverMode === 'both');
  const [loading, setLoading] = useState(false);

  const selected = bothMode ? 'both' : selectedSingleMode;

  const handleModeChange = (key) => {
    if (!bothMode) {
      setSelectedSingleMode(key);
    }
  };

  const toggleBothMode = (value) => {
    setBothMode(value);
  };

  const getMissingItems = (mode) => {
    if (mode === 'both') {
      // Combine requirements for both modes
      const combined = [...DRIVER_REQUIRED];
      ACTING_REQUIRED.forEach(req => {
        if (!combined.find(r => r.key === req.key)) {
          combined.push(req);
        }
      });
      return combined.filter(f => !f.check(storeStatus)).map(f => f.label);
    }
    const fields = mode === 'driver' ? DRIVER_REQUIRED : ACTING_REQUIRED;
    return fields.filter(f => !f.check(storeStatus)).map(f => f.label);
  };

  const missingItems = getMissingItems(selected);
  const isComplete = missingItems.length === 0;

  const handleContinue = async () => {
    if (!isComplete) {
      onClose();
      setStackScreen('EditDocCenter');
      return;
    }
    setLoading(true);
    try {
      const api = new APIRequest();
      const res = await api.request(
        '/publicrides/actingDriver/v2/updateDriverMode',
        'POST',
        {mode: selected},
        userInfo?.token,
      );
      if (res?.success) {
        setDriverMode(selected);
        showNotification(res?.message || 'Mode updated', '', 'success');
        onClose();
      } else {
        showNotification(res?.message || 'Failed to update mode', '', 'danger');
      }
    } catch {
      showNotification('Something went wrong', '', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Change Driver Mode</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <MaterialIcons name="close" size={22} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Select the mode you want to operate in. Missing details will be required before switching.
          </Text>

          {/* Mode buttons */}
          <View style={styles.modeRow}>
            {MODES.map(mode => {
              const active = selectedSingleMode === mode.key && !bothMode;
              const disabled = bothMode;
              return (
                <TouchableOpacity
                  key={mode.key}
                  style={[
                    styles.modeCard, 
                    active && styles.modeCardActive,
                    disabled && styles.modeCardDisabled
                  ]}
                  onPress={() => handleModeChange(mode.key)}
                  activeOpacity={0.8}
                  disabled={disabled}>
                  <MaterialIcons
                    name={mode.icon}
                    size={28}
                    color={active ? Colors.blue_xxdark : '#9e9e9e'}
                  />
                  <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                    {mode.label}
                  </Text>
                  <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                  {active && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Both Mode Switch */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Both Mode</Text>
            <View style={styles.switchWrapper}>
              <Switch
                trackColor={{ false: '#D1D1D1', true: Colors.blue_xxdark + '80' }}
                thumbColor={bothMode ? Colors.blue_xxdark : '#f4f3f4'}
                onValueChange={toggleBothMode}
                value={bothMode}
              />
              <Text style={styles.switchStatus}>{bothMode ? 'On' : 'Off'}</Text>
            </View>
          </View>

          {/* Missing fields warning */}
          {!isComplete && (
            <View style={styles.warningRow}>
              <MaterialIcons name="info-outline" size={16} color="#FB8C00" style={{marginTop: 2}} />
              <View style={{flex: 1}}>
                <Text style={styles.warningText}>
                  Complete the following before switching to{' '}
                  <Text style={{fontFamily: Fonts.semi_bold}}>
                    {selected === 'driver' ? 'Driver' : selected === 'acting_driver' ? 'Acting Driver' : 'Both'}
                  </Text>{' '}mode:
                </Text>
                {missingItems.map((item, i) => (
                  <Text key={i} style={styles.warningItem}>{'• '}{item}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.continueBtn, loading && {opacity: 0.7}]}
              onPress={handleContinue}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.continueBtnText}>
                  {isComplete ? 'Continue' : 'Complete Details'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DriverModeModal;

DriverModeModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontFamily: Fonts.semi_bold,
    color: Colors.black || '#111',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#757575',
    marginBottom: 18,
    lineHeight: 17,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    gap: 4,
    position: 'relative',
  },
  modeCardActive: {
    borderColor: Colors.blue_xxdark,
    backgroundColor: '#EEF0FB',
  },
  modeCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: Fonts.semi_bold,
    color: '#FF0000', // Red color as requested/image
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchStatus: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.black,
    minWidth: 25,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.blue_xxdark,
    borderRadius: 20,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    fontSize: 13,
    fontFamily: Fonts.semi_bold,
    color: '#555',
    textAlign: 'center',
  },
  modeLabelActive: {
    color: Colors.periwinkle || '#0F223C',
  },
  modeSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.periwinkle || '#0F223C',
    borderRadius: 20,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  warningText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#E65100',
    lineHeight: 16,
  },
  warningItem: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#E65100',
    lineHeight: 18,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: '#555',
  },
  continueBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.periwinkle || '#0F223C',
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 14,
    fontFamily: Fonts.semi_bold,
    color: '#fff',
  },
});
