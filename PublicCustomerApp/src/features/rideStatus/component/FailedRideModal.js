import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { colors, Fonts } from '../../../constants/constants';

const FailedRideModal = ({
  visible,
  onRetry,
  onCancel,
  message = 'Unable to find a driver at the moment. Please try again.',
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>⚠️</Text>
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Driver Not Found</Text>

          {/* Message */}
          <Text style={styles.modalMessage}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3CD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: colors.black,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.black,
  },
  cancelButton: {
    backgroundColor: colors.grey_light,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  cancelButtonText: {
    color: colors.black,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});

FailedRideModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  message: PropTypes.string,
};

export default FailedRideModal; 