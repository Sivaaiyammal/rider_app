// import React, { Component, useRef, useState, useEffect } from 'react';
// import {
//   View,
//   StyleSheet,
//   Platform,
//   PanResponder,
//   Animated,
//   Text,
// } from 'react-native';
// import { WINDOW_HEIGHT } from '../utils';

// const DraggableBottomSheet = ({ minHeightRatio = 0.5, children, minHeight = 0.3 }) => {
//   // Set the maximum height for the bottom sheet (90% of the window height by default)
//   const [BOTTOM_SHEET_MAX_HEIGHT] = useState(WINDOW_HEIGHT * 0.9);
//   // Set the minimum height for the bottom sheet based on the passed prop
//   const [BOTTOM_SHEET_MIN_HEIGHT] = useState(WINDOW_HEIGHT * minHeightRatio);

//   // Initial position of the bottom sheet (collapsed state)
//   const collapsedPosition = WINDOW_HEIGHT - BOTTOM_SHEET_MIN_HEIGHT;
//   // Position of the bottom sheet when fully expanded (expanded state)
//   const expandedPosition = WINDOW_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT;

//   const animatedHeight = useRef(new Animated.Value(collapsedPosition)).current;

//   const [Dragging, setDragging] = useState(false);

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: (e, gesture) => {
//         // Calculate the next position of the bottom sheet
//         const nextPosition = gesture.moveY;

//         setDragging(true);

//         // Prevent dragging below the minimum height threshold
//         if (nextPosition <= WINDOW_HEIGHT - WINDOW_HEIGHT * minHeight && nextPosition >= expandedPosition) {
//           animatedHeight.setValue(nextPosition);
//         }
//       },
//       onPanResponderRelease: (e, gesture) => {
//         const dragDistance = Math.abs(gesture.dy);
//         const totalHeight = WINDOW_HEIGHT; // Total height of the bottom sheet or relevant component

//         // Determine the default position as a ratio of the current height
//         let defaultPosition = animatedHeight._value / totalHeight;

//         // Determine the direction of the drag
//         const isDraggingDown = gesture.dy >= 0;
//         const MIN_SCALE_FACTOR = 0.1; // Minimum scale factor
//         const REFERENCE_DISTANCE = totalHeight / 2; // This could be half of the total height or any other reference distance

//         // Calculate scale factors (simple proportional example)
//         const downScaleFactor = isDraggingDown ? Math.max(MIN_SCALE_FACTOR, 1 - (dragDistance / REFERENCE_DISTANCE)) : 1;

//         // Adjust the target height based on the drag direction
//         let targetHeight = isDraggingDown ? defaultPosition * downScaleFactor : defaultPosition;
//         let floatNumber = targetHeight.toString().split('.')[1];

//         Animated.spring(animatedHeight, {
//           toValue: !isDraggingDown ? WINDOW_HEIGHT * targetHeight : WINDOW_HEIGHT - WINDOW_HEIGHT * (floatNumber.charAt(0) == 0 ? 0.15 : targetHeight),
//           animationFriction: 6,
//           useNativeDriver: false,
//         }).start();

//         setDragging(false);
//       },
//     })
//   ).current;

//   // Styles for the bottom sheet container
//   const bottomSheetStyles = [
//     styles.bottomSheet,
//     {
//       height: BOTTOM_SHEET_MAX_HEIGHT,
//       transform: [{ translateY: animatedHeight }],
//     },
//   ];

//   return (
//     <View style={styles.container}>
//       <Animated.View style={[styles.bottomSheet, bottomSheetStyles]} {...panResponder.panHandlers}>
//         <View style={styles.draggbleArea} >
//           {/* {showTopModal && (
//             <View style={styles.modalStyle}>{props.modalChildren}</View>
//           )} */}
//           <View style={styles.dragHandle} />
//         </View>
//         {children}
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   bottomSheet: {
//     position: 'absolute',
//     zIndex: 100,
//     width: '100%',
//     height: '90%',
//     // bottom: !stopDragging
//     //   ? MAX_UPWARD_TRANSLATE_Y
//     //   : 0,
//     backgroundColor: 'white',
//     ...Platform.select({
//       android: {
//         elevation: 10,
//       },
//       ios: {
//         shadowColor: 'black',
//         shadowOffset: { width: 0, height: 0 },
//         shadowOpacity: 1,
//         shadowRadius: 10,
//       },
//     }),
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   dragHandle: {
//     width: 100,
//     height: 10,
//     backgroundColor: '#f2f2f2',
//     borderRadius: 3,
//   },
//   draggbleArea: {
//     width: '100%',
//     height: 30,
//     alignSelf: 'center',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalStyle: {
//     position: 'absolute',
//     bottom: 50,S
//     alignSelf: 'flex-end',
//     right: 30,
//   },
// });

// export default DraggableBottomSheet;

import React, {useRef} from 'react';
import {View, Button, KeyboardAvoidingView, Platform} from 'react-native';
import {Modalize} from 'react-native-modalize';
import {useIsFocused} from '@react-navigation/native';

function BottomSheet({children, minHeight, maxHeight}) {
  const modalizeRef = useRef(null);

  return (
    <Modalize
      ref={modalizeRef}
      alwaysOpen={minHeight || 300}
      childrenStyle={{height: maxHeight || 700}}
      adjustToContentHeight={false}
      handlePosition="inside"
      withOverlay={true}>
      <KeyboardAvoidingView behavior={null}>
        <View style={{paddingTop: 20}}></View>
        {children}
      </KeyboardAvoidingView>
    </Modalize>
  );
}

export default BottomSheet;
