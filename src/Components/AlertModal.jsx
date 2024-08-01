import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Fonts } from "../Constants";
import { Colors } from "../Constants/Contants";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
    gap: 20,
  },
  closeButton: {
    alignSelf: "center",
    padding: 5,
    backgroundColor: "black",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    width: "50%",
    textAlign: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.semi_bold,
    color: Colors.black,
  },
  SubText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
});

const AlertModal = ({
  isVisible,
  onClose,
  successMessage,
  onBackDropPress,
  additionalContainerStyles,
  animationType = "none",
  children,
  onRightPress,
  rightBtnText,
  SubText,
  isLoading,
  leftBtnTxt,
}) => {
  return (
    <Modal
      transparent
      animationType={animationType}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay} onPress={onBackDropPress}>
        <View style={[styles.modalContainer, additionalContainerStyles]}>
          {successMessage && <Text style={styles.title}>{successMessage}</Text>}
          {SubText && <Text style={styles.SubText}>{SubText}</Text>}
          <View>{children}</View>
          <View style={{flexDirection:'row',gap:10}}>
            {leftBtnTxt && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>{leftBtnTxt}</Text>
              </TouchableOpacity>
            )}
            {rightBtnText && (
              <TouchableOpacity
                onPress={onRightPress}
                style={styles.closeButton}
              >
                {isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.closeButtonText}>{rightBtnText}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;
