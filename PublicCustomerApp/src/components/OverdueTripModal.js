import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AdaptiveText from './Common/AdaptiveText';
import { Fonts } from '../constants/constants';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const OverdueTripModal = ({ visible, onClose, onSelect ,TripId }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handlePress = (nextStatus) => {
    if (submitting) return;
    setSubmitting(true);
    onSelect && onSelect(nextStatus, TripId);
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={submitting ? undefined : onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <AdaptiveText style={styles.title}>
            {t('overdue.title')}
          </AdaptiveText>
          <Text style={styles.message}>
            {t('overdue.message')}
          </Text>
          {submitting && (
            <View style={styles.loaderRow}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loaderText}>{t('loading') || 'Loading...'}</Text>
            </View>
          )}
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, submitting && styles.btnDisabled]} disabled={submitting} onPress={() => handlePress('DIVERGED')}>
              <AdaptiveText style={styles.btnText}>{t('overdue.cancelled_midway')}</AdaptiveText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, submitting && styles.btnDisabled]} disabled={submitting} onPress={() => handlePress('CANCELLED')}>
              <AdaptiveText style={styles.btnText}>{t('cancelled')}</AdaptiveText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, submitting && styles.btnDisabled]} disabled={submitting} onPress={() => handlePress('COMPLETED')}>
              <AdaptiveText style={styles.btnText}>{t('completed')}</AdaptiveText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, submitting && styles.btnDisabled]} disabled={submitting} onPress={() => handlePress('ONGOING')}>
              <AdaptiveText style={styles.btnText}>{t('ongoing')}</AdaptiveText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.close} onPress={submitting ? undefined : onClose} disabled={submitting}>
            <AdaptiveText style={styles.closeText}>{t('dismiss')}</AdaptiveText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '88%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontFamily: Fonts.semi_bold,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loaderText: {
    marginLeft: 8,
    color: '#007AFF',
  },
  buttons: {
    gap: 8,
  },
  btn: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: 'black',
  },
  close: {
    marginTop: 12,
    alignItems: 'center',
  },
  closeText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#007AFF',
  },
});

export default OverdueTripModal;

OverdueTripModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  TripId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};


