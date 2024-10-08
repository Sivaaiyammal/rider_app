import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';

const DriveScreenHeader = (props) => {
  const {toggleMenu, showMenu} = props;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <TouchableOpacity onPress={() => toggleMenu()}>
        <Ionicons
          name={!showMenu ? 'reorder-three-outline' : 'close'}
          size={35}
        />
      </TouchableOpacity>
    </View>
  );
};

export default DriveScreenHeader;

const styles = StyleSheet.create({});
