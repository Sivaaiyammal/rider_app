import React, {Component} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

class CustomModal extends Component {
  render() {
    const {
      visible,
      title,
      content,
      onClose,
      style,
      children,
      closeModalonBackPress,
    } = this.props;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={closeModalonBackPress}>
          <View style={[styles.modalContainer, style]}>{children}</View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default CustomModal;
