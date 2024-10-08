import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import {colors, Fonts} from '../../constants/constants';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const StatusModal = ({
  isVisible,
  onClose,
  successMessage,
  onBackDropPress,
  additionalContainerStyles,
  animationType = 'none',
  children,
  onRightPress,
  rightBtnText,
  leftBtnTxt,
  status,
}) => {

  return (
    <Modal
      transparent
      animationType={animationType}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.overlay} onPress={onBackDropPress}>
        <View style={[styles.modalContainer, additionalContainerStyles]}>
          {successMessage && <Text style={styles.title}>{successMessage}</Text>}
          {children && <View>{children}</View>}
          <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity onPress={onClose} style={styles.offlineCloseBtn}>
              <Text style={styles.offlineCloseBtnText}>{leftBtnTxt}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onRightPress}
                style={styles.offlineActionBtn}>
             <Text style={styles.offlineActionBtnText}>{rightBtnText}</Text>
          </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={onRightPress}
              style={styles.onlineActionBtn}>
              <Text style={styles.onlineActionText}>{rightBtnText}</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StatusModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.black,
    textAlign: 'center',
  },
  offlineCloseBtn: {
    backgroundColor: colors.green_xxlight,
    width: '50%',
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.green_online,
    borderRadius: 8,
  },
  offlineCloseBtnText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: colors.green_online,
  },
  offlineActionBtn: {
    backgroundColor: colors.orange_xxlight,
    width: '50%',
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger_red,
    borderRadius: 8,
  },
  offlineActionBtnText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: colors.danger_red,
  },
  onlineActionBtn: {
    backgroundColor: colors.black,
    width: '50%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  onlineActionText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: colors.white,
  },
});

StatusModal.propTypes = {
  isVisible: PropTypes.bool,
  onClose: PropTypes.func,
  successMessage: PropTypes.string,
  image: PropTypes.any,
  SvgImage: PropTypes.any,
  onBackDropPress: PropTypes.func,
  additionalContainerStyles: PropTypes.object,
  animationType: PropTypes.string,
  children: PropTypes.any,
  onRightPress: PropTypes.func,
  rightBtnText: PropTypes.string,
  SubText: PropTypes.string,
};

StatusModal.defaultProps = {
  isVisible: false,
  onClose: () => {},
  successMessage: '',
  image: '',
  SvgImage: '',
  onBackDropPress: () => {},
  additionalContainerStyles: {},
  animationType: '',
  children: '',
  onRightPress: () => {},
  rightBtnText: '',
  SubText: '',
};
