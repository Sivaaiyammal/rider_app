/* eslint-disable react/display-name */
import React, { useRef } from 'react';
import { View, KeyboardAvoidingView, Dimensions } from 'react-native';
import { Modalize } from 'react-native-modalize';

const BottomSheet = React.memo(({ children, minHeight, maxHeight, panGestureEnabled = true, reference = null }) => {
  const modalizeRef = reference || useRef(null);
  const screenHeight = Dimensions.get('window').height;

  return (
  
      <Modalize
        ref={modalizeRef}
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

export default BottomSheet;
