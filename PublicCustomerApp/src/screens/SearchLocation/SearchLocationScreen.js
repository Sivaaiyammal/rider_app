import {View} from 'react-native';
import React from 'react';
import NavBar from '../../components/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import AddLocationCard from './AddLocationCard';

const SearchLocation = () => {
  const {goBack} = useStackScreenStore();

  const onBackPress = () => {
    goBack();
  };

  return (
    <View>
      <NavBar withBg onBackPress={onBackPress} title={'Destination'} />
      <AddLocationCard />
    </View>
  );
};

export default SearchLocation;
