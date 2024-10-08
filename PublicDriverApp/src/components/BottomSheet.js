/* eslint-disable react/display-name */
import React, { useRef } from 'react';
import { View, KeyboardAvoidingView } from 'react-native';
import { Modalize } from 'react-native-modalize';

const BottomSheet = React.memo(({ children, minHeight, maxHeight, panGestureEnabled = true, reference = null }) => {
  const modalizeRef = reference || useRef(null);
  return (
    <Modalize
      ref={modalizeRef}
      alwaysOpen={minHeight || 300}
      childrenStyle={{ height: maxHeight || 700 }}
      adjustToContentHeight={false}
      handlePosition="inside"
      withOverlay={true}
      panGestureEnabled={panGestureEnabled}
      withHandle={panGestureEnabled}
    >
      <KeyboardAvoidingView behavior={null}>
        <View style={{ paddingTop: 20 }}>{children}</View>
      </KeyboardAvoidingView>
    </Modalize>
  );
});

export default BottomSheet;
