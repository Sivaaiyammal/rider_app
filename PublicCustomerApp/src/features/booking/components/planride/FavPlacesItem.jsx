import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import { Fonts } from '../../../../constants/constants';
import { from } from '@apollo/client';

const ICONS = {
  home: {
    name: 'home',
    label: 'home',
  },
  work: {
    name: 'work',
    label: 'work',
  },
  star: {
    name: 'star',
    label: 'star',
  },
};

const getIcon = (label,type) => {
  if (label.toLowerCase() === 'home') {
    return 'home';
  } else if (label.toLowerCase() === 'work') {
    return 'work';
  } else if (type === 'add') {
    return 'add';
  } else {
    return 'star';
  }
}

  const FavPlacesItem = ({ data, onPress,type,selected ,fromPickScreen=false}) => {
  const { t } = useTranslation();
  const randomColors = ['#ffffffff'];
  const isPickedSelected = fromPickScreen && selected;
  const bgColor = isPickedSelected ? '#000' : (fromPickScreen ? randomColors[Math.floor(Math.random()*randomColors.length)] : '#fff');
  const fgColor = isPickedSelected ? '#fff' : '#121212';
  const iconColor = isPickedSelected ? '#fff' : (selected ? '#fff' : '#757575');
  
  return (
    <TouchableOpacity style={[styles.container, {backgroundColor:bgColor}, selected && !fromPickScreen && {backgroundColor:'grey',borderWidth:1}, fromPickScreen && {paddingVertical:7}]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconLabelRow}>
        <MaterialIcons name={getIcon(data?.label,type)} size={20} color={iconColor} style={styles.icon} />
        <Text style={[styles.label,{color: fgColor}, selected && !fromPickScreen && {color:'#fff'}]}>{t(data?.label?.toLowerCase() || 'star')}</Text>
      </View>
    </TouchableOpacity>
  );
};

FavPlacesItem.propTypes = {
  type: PropTypes.oneOf(['home', 'work','add']),
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
    fontFamily:Fonts.regular,
    textTransform: 'capitalize',
  },
});

export default FavPlacesItem;
