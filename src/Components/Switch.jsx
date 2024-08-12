import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../Constants/Contants';

const Switch = (props) => {
  const {
    value: propValue = false,
    onValueChange = () => null,
    disabled = false,
    activeText = 'On',
    inActiveText = 'Off',
    backgroundActive = 'green',
    backgroundInactive = 'gray',
    circleActiveColor = 'white',
    circleInActiveColor = 'white',
    circleBorderActiveColor = 'rgb(100, 100, 100)',
    circleBorderInactiveColor = 'rgb(80, 80, 80)',
    switchWidth = 30,
    switchHeight = 30,
    switchBorderRadius = 100,
    barHeight = null,
    circleBorderWidth = 1,
    changeValueImmediately = true,
    innerCircleStyle = { alignItems: 'center', justifyContent: 'center' },
    outerCircleStyle = {},
    renderActiveText = true,
    renderInActiveText = true,
    renderInsideCircle = () => null,
    switchLeftPx = 4,
    switchRightPx = 4,
    switchWidthMultiplier = 2,
    ...restProps
  } = props;

  const [value, setValue] = useState(propValue);
  const transformSwitch = useRef(new Animated.Value(
    propValue ? switchWidth / switchLeftPx : -switchWidth / switchRightPx
  )).current;
  const backgroundColor = useRef(new Animated.Value(propValue ? 75 : -75)).current;
  const circleColor = useRef(new Animated.Value(propValue ? 75 : -75)).current;
  const circleBorderColor = useRef(new Animated.Value(propValue ? 75 : -75)).current;

  useEffect(() => {
    if (propValue !== value || !disabled) {
      animateSwitch(propValue, () => setValue(propValue));
    }
  }, [propValue, disabled]);

  const handleSwitch = () => {
    if (disabled) return;

    if (propValue === value) {
      onValueChange(!value);
      return;
    }

    if (changeValueImmediately) {
      animateSwitch(!propValue);
      onValueChange(!propValue);
    } else {
      animateSwitch(!value, () => {
        setValue(!value);
        onValueChange(!value);
      });
    }
  };

  const animateSwitch = (toValue, cb = () => {}) => {
    Animated.parallel([
      Animated.spring(transformSwitch, {
        toValue: toValue
          ? switchWidth / switchLeftPx
          : -switchWidth / switchRightPx,
        useNativeDriver: false,
      }),
      Animated.timing(backgroundColor, {
        toValue: toValue ? 75 : -75,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(circleColor, {
        toValue: toValue ? 75 : -75,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(circleBorderColor, {
        toValue: toValue ? 75 : -75,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(cb);
  };

  const interpolatedColorAnimation = backgroundColor.interpolate({
    inputRange: [-75, 75],
    outputRange: [backgroundInactive, backgroundActive],
  });

  const interpolatedCircleColor = circleColor.interpolate({
    inputRange: [-75, 75],
    outputRange: [circleInActiveColor, circleActiveColor],
  });

  const interpolatedCircleBorderColor = circleBorderColor.interpolate({
    inputRange: [-75, 75],
    outputRange: [circleBorderInactiveColor, circleBorderActiveColor],
  });

  return (
    <TouchableWithoutFeedback onPress={handleSwitch} {...restProps}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: interpolatedColorAnimation,
            width: switchWidth * switchWidthMultiplier,
            height: barHeight || switchHeight,
            borderRadius: switchBorderRadius,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              left: transformSwitch,
              width: switchWidth * switchWidthMultiplier,
            },
            outerCircleStyle,
          ]}
        >
          {value && renderActiveText && (
            <Text style={[styles.text, styles.paddingRight]}>
              {activeText}
            </Text>
          )}

          <Animated.View
            style={[
              styles.circle,
              {
                borderWidth: circleBorderWidth,
                borderColor: interpolatedCircleBorderColor,
                backgroundColor: interpolatedCircleColor,
                width: switchWidth,
                height: switchHeight,
                borderRadius: switchBorderRadius / 2,
              },
              innerCircleStyle,
            ]}
          >
            {renderInsideCircle()}
          </Animated.View>
          {!value && renderInActiveText && (
            <Text style={[styles.text, styles.paddingLeft]}>
              {inActiveText}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 71,
    height: 30,
    borderRadius: 30,
    backgroundColor: Colors.black,
  },
  animatedContainer: {
    flex: 1,
    width: 78,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
  },
  text: {
    color: Colors.white,
    backgroundColor: 'transparent',
  },
  paddingRight: {
    paddingRight: 5,
  },
  paddingLeft: {
    paddingLeft: 5,
  },
});

export default Switch;
