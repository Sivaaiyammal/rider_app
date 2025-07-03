/* eslint-disable react/display-name */
import React, { useRef } from 'react';
import { View, KeyboardAvoidingView, Dimensions, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';

const BottomSheet = React.memo(({ children, minHeight, maxHeight, panGestureEnabled = true, reference = null }) => {
  const modalizeRef = reference || useRef(null);
  const screenHeight = Dimensions.get('window').height;

  return (
  
      <Modalize
        ref={modalizeRef}
        modalStyle={styles.modalShadow}
        alwaysOpen={minHeight || 300}
        childrenStyle={{ height: minHeight || 300 }}
        modalHeight={maxHeight || screenHeight}
        adjustToContentHeight={false}
        handlePosition="inside"
        withOverlay={true}
        panGestureEnabled={panGestureEnabled}
        withHandle={panGestureEnabled}
        disableScrollIfPossible={false}
      >
        <KeyboardAvoidingView behavior={null}>
          <View style={{ paddingTop: 20 }}>{children}</View>
        </KeyboardAvoidingView>
      </Modalize>
  
  );
});
const styles = StyleSheet.create({
  modalShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 20,
    borderRadius: 16,
    
    backgroundColor: '#fff',
  },
});
export default BottomSheet;
