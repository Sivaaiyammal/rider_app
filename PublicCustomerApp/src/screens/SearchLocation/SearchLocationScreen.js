import {View} from 'react-native';
import React from 'react';
import NavBar from '../../components/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import AddLocationCard from './AddLocationCard';
import useLocationStore from '../../store/useLocationStore';

const SearchLocation = () => {
  const {goBack} = useStackScreenStore();
  const {resetDirections} = useLocationStore();

  const onBackPress = () => {
    goBack();
    resetDirections();
  };

  return (
    <View>
      <NavBar withBg onBackPress={onBackPress} title={'Destination'} />
      <AddLocationCard />
    </View>
  );
};

export default SearchLocation;
