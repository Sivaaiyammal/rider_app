import React from 'react';
import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/constants';
import LinearGradient from 'react-native-linear-gradient';

const MapTopOverley = () => {
  return (
    <LinearGradient 
      colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']} 
      locations={[0, 0.3, 0.5, 0.7, 1]}
      style={styles.container} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1000,
    width: '100%',
  },
  text: {
    fontSize: 16,
    color: colors.black,
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default MapTopOverley;
