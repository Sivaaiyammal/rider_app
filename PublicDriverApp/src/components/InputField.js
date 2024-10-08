import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import {colors, Fonts} from '../constants/constants';

const InputField = props => {
  const {
    label,
    errorText,
    value,
    style,
    onBlur,
    onFocus,
    icon,
    keyboardType = 'default',
    ...restOfProps
  } = props;
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [focusAnim, isFocused, value]);

  let color = isFocused ? colors.grey_xxdark : colors.black;
  let borderColor = isFocused ? colors.yellow : colors.grey;
  let backgroundColor =isFocused ? colors.white : colors.white_dirt;

  return (
    <>
   
    <View style={[styles.inputConatiner,{borderColor,backgroundColor}]}>
      <TextInput
        style={[styles.input]}
        ref={inputRef}
        {...restOfProps}
        value={value}
        onBlur={event => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={event => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        keyboardType={keyboardType}
      />
      {icon}
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <Animated.View
          style={[
            styles.labelContainer,
            {
              transform: [
                {
                  scale: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.7],
                  }),
                },
                {
                  translateY: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -24],
                  }),
                },
                {
                  translateX: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [19, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text
            style={[
              styles.label,
              {
                color,
              },
            ]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
    {!!errorText && <Text style={styles.error}>{errorText}</Text>}
    </>
  );
};

const styles = StyleSheet.create({
  inputConatiner: {
    
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    borderRadius:8,
    marginVertical:10
  },
  input: {
    width: '90%',
    paddingHorizontal: 10,
    top:5,
    fontFamily:Fonts.regular,
    color:colors.black,
    fontSize:16
  },
  labelContainer: {
    position: 'absolute',
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.light,
  },
  error: {
    fontSize: 12,
    color: colors.danger_red,
    fontFamily:Fonts.light,
    bottom:8
  },
});

export default InputField;
