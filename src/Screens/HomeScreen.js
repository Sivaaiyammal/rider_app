import { ScrollView, StyleSheet, View, TouchableOpacity, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';

import InputContainer from '../Components/InputContainer';
import SavedAddress from '../Components/SavedAddress';
import RecentSearch from '../Components/RecentSearch';
import NearBy from '../Components/NearBy';
import SearchResult from '../Components/SearchResult';
import DraggableBottomSheet from '../Components/BottomSheet';
import Map from './Map';
import { IconButton } from 'react-native-paper';

import CurrentLocationIcon from '../Assets/Icons/currentLocation.svg';
import DirectionsIcon from '../Assets/Icons/direction.svg';

const HomeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  const clearText = () => {
    setSearchText('');
  };

  const handleSearch = value => {
    setSearchText(value);
  };

  useEffect(() => {
    const handleBackPress = () => {
      console.log('Back pressed');
      return true;
    };
    
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  const BottomSheet = () => (
    
    <View style={{ flex: 1 }}>

      <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <IconButton 
          icon="menu" 
          size={24} 
          containerColor='#fff' 
          color="#000" 
          onPress={() => {
            console.log('Pressed');
          }}
        />
      </View>

      <View style={{ position: 'absolute', top: 10, right: 0, zIndex: 1000 }}>
        <TouchableOpacity onPress={() => console.log('Pressed')}>
          <CurrentLocationIcon />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => console.log('Pressed')}>
          <DirectionsIcon />
        </TouchableOpacity>
      </View>

      <DraggableBottomSheet
        minHeightRatio={0.57}
        children={
          <View style={styles.screenContainer}>
            <InputContainer
              placeholder={'Search'}
              onChange={value => handleSearch(value)}
              value={searchText}
              onCancelPress={() => clearText()}
            />
            {searchText?.length !== 0 ? (
              <SearchResult searchTxt={searchText} />
            ) : (
              <ScrollView>
                <SavedAddress />
                <RecentSearch />
                <NearBy />
              </ScrollView>
            )}
          </View>
        }
      />
    </View>
  );

  return (
    <>
      <Map />
      <BottomSheet />
    </>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default HomeScreen;