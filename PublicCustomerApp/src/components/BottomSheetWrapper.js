import React, { useMemo, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import PropTypes from 'prop-types';

const BottomSheetWrapper = forwardRef(({
  children,
  snapPoints = ['25%', '50%', '90%'],
  index = 1,
  enablePanDownToClose = false,
  enableOverDrag = true,
  enableScroll = false,
  enableDynamicSizing = false,
  handleIndicatorStyle,
  handleComponent,
  style,
  isLoading = false,
  ...props
}, ref) => {
  // variables
  const snapPointsArray = useMemo(() => snapPoints, [snapPoints]);

  // Don't render scroll view until content is ready
  const shouldRenderScrollView = enableScroll && !isLoading && children;

  return (
    <BottomSheet
      ref={ref}
      index={index}
      snapPoints={snapPointsArray}
      enablePanDownToClose={enablePanDownToClose}
      enableOverDrag={enableOverDrag}
      enableScroll={shouldRenderScrollView}
      enableDynamicSizing={enableDynamicSizing}
      handleIndicatorStyle={handleIndicatorStyle}
      handleComponent={handleComponent}
      style={[styles.bottomSheet, style]}
      {...props}
    >
      {shouldRenderScrollView ? (
        <BottomSheetScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        <View style={styles.contentContainer}>
          {children}
        </View>
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
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    minHeight: 200, // Ensure minimum height for content
  },
  scrollContent: {
    paddingHorizontal: 10,
    flexGrow: 1,
    backgroundColor: 'white',
    minHeight: 200, // Ensure minimum height for scroll content
  },
});

BottomSheetWrapper.propTypes = {
  children: PropTypes.node,
  snapPoints: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  index: PropTypes.number,
  enablePanDownToClose: PropTypes.bool,
  enableOverDrag: PropTypes.bool,
  enableScroll: PropTypes.bool,
  enableDynamicSizing: PropTypes.bool,
  handleIndicatorStyle: PropTypes.object,
  handleComponent: PropTypes.element,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isLoading: PropTypes.bool,
};

BottomSheetWrapper.defaultProps = {
  snapPoints: ['25%', '50%', '90%'],
  index: 1,
  enablePanDownToClose: false,
  enableOverDrag: true,
  enableScroll: false,
  enableDynamicSizing: false,
  isLoading: false,
};

BottomSheetWrapper.displayName = 'BottomSheetWrapper';

export default BottomSheetWrapper;
