import React, { useState, useRef } from 'react';
import { View, Text, Animated, PanResponder, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SwipeButton = ({ onSwipeSuccess, buttonText = "Swipe to Confirm" }) => {
  const [swiped, setSwiped] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const slideWidth = width - 150; // Total width for the swipe

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => true, // Allow movement on any gesture
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx <= slideWidth) {
          pan.setValue({ x: gestureState.dx, y: 0 }); // Move only on the X-axis within the slide range
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > slideWidth -150) {
          // Trigger swipe success if slid close to the end
          Animated.timing(pan, {
            toValue: { x: slideWidth, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setSwiped(true);
            onSwipeSuccess();
          });
        } else {
          // If not swiped far enough, reset the position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.swipeContainer}>
        <Text style={styles.swipeText}>{swiped ? "Confirmed!" : buttonText}</Text>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.swipeButton, { transform: [{ translateX: pan.x }] }]}
        >
          <Text style={styles.buttonText}>➤</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor:'red'
  },
  swipeContainer: {
    width: width - 60,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  swipeText: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#aaa',
    fontSize: 18,
    zIndex: 1,
  },
  swipeButton: {
    width: 50,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    zIndex: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
  },
});

export default SwipeButton;
