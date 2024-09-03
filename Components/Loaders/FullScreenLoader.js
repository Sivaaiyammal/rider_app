import React, { Component } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import LoaderKit from 'react-native-loader-kit'


class FullScreenLoader extends Component {
  render() {
    const { message, showBG = true } = this.props;

    return (
      <View style={[styles.container, { backgroundColor: showBG ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)' }]}>
        {/* <ActivityIndicator size="large" color="#007BFF" /> */}
        <LoaderKit
          style={{ width: 50, height: 50 }}
          name={'LineScalePulseOut'} // Optional: see list of animations below
          size={50} // Required on iOS
          color={'cornflowerblue'} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default FullScreenLoader;