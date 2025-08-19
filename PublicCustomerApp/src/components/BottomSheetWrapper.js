import React, { useCallback, useMemo, useRef, forwardRef } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { height } from '../utils/Utils';

const BottomSheetWrapper = forwardRef(({
  children,
  snapPoints = ['25%', '50%', '90%'],
  index = 1,
  onChange,
  onAnimate,
  enablePanDownToClose = false,
  enableOverDrag = true,
  enableHandlePanningGesture = true,
  enableContentPanningGesture = true,
  enableDynamicSizing = false,
  enableScroll = false,
  animatedIndex,
  animatedPosition,
  handleHeight,
  handleIndicatorStyle,
  handleStyle,
  backgroundStyle,
  containerStyle,
  style,
  handleComponent,
  ...props
}, ref) => {
  // refs
  const bottomSheetRef = useRef(null);

  // variables
  const snapPointsArray = useMemo(() => snapPoints, [snapPoints]);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    console.log('handleSheetChanges', index);
    onChange?.(index);
  }, [onChange]);

  const handleAnimate = useCallback((fromIndex, toIndex) => {
    console.log('handleAnimate', fromIndex, toIndex);
    onAnimate?.(fromIndex, toIndex);
  }, [onAnimate]);

  return (
    <BottomSheet
      ref={ref || bottomSheetRef}
      index={index}
      snapPoints={snapPointsArray}
      onChange={handleSheetChanges}
      onAnimate={handleAnimate}
      enablePanDownToClose={enablePanDownToClose}
      enableOverDrag={enableOverDrag}
      enableHandlePanningGesture={enableHandlePanningGesture}
      enableContentPanningGesture={enableContentPanningGesture}
      enableDynamicSizing={enableDynamicSizing}
      animatedIndex={animatedIndex}
      animatedPosition={animatedPosition}
      handleHeight={handleHeight}
      handleIndicatorStyle={handleIndicatorStyle}
      handleStyle={handleStyle}
      backgroundStyle={backgroundStyle}
      containerStyle={containerStyle}
      handleComponent={handleComponent}
      style={[styles.bottomSheet, style]}
      {...props}
    >
      {enableScroll ? (
        <ScrollView 
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {children}
        </ScrollView>
      ) : (
        <BottomSheetView 
          style={styles.contentContainer}
          enableContentPanningGesture={true}
        >
          {children}
        </BottomSheetView>
      )}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'white',
    padding: 10,
  },
  contentContainer: {
    flex: 1,
  },

});

BottomSheetWrapper.displayName = 'BottomSheetWrapper';

export default BottomSheetWrapper;
