import React, { Component } from 'react';
import { View, Text, PanResponder, Animated, StyleSheet } from 'react-native';

class SwipeButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSwiped: false,
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: this.handlePanResponderMove,
      onPanResponderRelease: this.handlePanResponderRelease,
    });

    this.swipeValue = new Animated.Value(0);
  }

  handlePanResponderMove = (e, gestureState) => {
    if (!this.state.isSwiped) {
      const { dx } = gestureState;

      if (dx > 0) {
        this.swipeValue.setValue(dx);
      }
    }
  };

  handlePanResponderRelease = () => {
    const { threshold } = this.props;

    if (this.swipeValue._value >= threshold) {
      this.swipeComplete();
    } else {
      this.swipeReset();
    }
  };

  swipeComplete = () => {
    const { onSwipe } = this.props;

    Animated.timing(this.swipeValue, {
      toValue: this.props.width,
      duration: 200,
    }).start(() => {
      this.setState({ isSwiped: true });
      onSwipe();
    });
  };

  swipeReset = () => {
    Animated.timing(this.swipeValue, {
      toValue: 0,
      duration: 200,
    }).start(() => {
      this.setState({ isSwiped: false });
    });
  };

  render() {
    const { isSwiped } = this.state;
    const { width, height, backgroundColor, textColor } = this.props;

    return (
      <View
        {...this.panResponder.panHandlers}
        style={[styles.container, { width, height, backgroundColor }]}
      >
        {isSwiped ? (
          <Text style={{ color: textColor }}>Swiped!</Text>
        ) : (
          <Animated.View
            style={[
              styles.swipeButton,
              { width: this.swipeValue, backgroundColor },
            ]}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    overflow: 'hidden',
  },
  swipeButton: {
    position: 'absolute',
    height: '100%',
  },
});

export default SwipeButton;
