import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import { Fonts } from '../../../../constants/constants';

const ICONS = {
  home: {
    name: 'home',
    label: 'Home',
  },
  work: {
    name: 'work',
    label: 'Work',
  },
};

  const FavPlacesItem = ({ type, onPress,isDataExist }) => {
  const iconData = ICONS[type] || ICONS.home;
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconLabelRow}>
        <MaterialIcons name={iconData.name} size={20} color="#757575" style={styles.icon} />
        <Text style={styles.label}>{!isDataExist && "Add "}{iconData.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

FavPlacesItem.propTypes = {
  type: PropTypes.oneOf(['home', 'work']).isRequired,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: '#121212',
    fontWeight: '500',
    fontFamily:Fonts.regular
  },
});

export default FavPlacesItem;
