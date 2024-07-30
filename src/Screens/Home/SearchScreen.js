import { StyleSheet, ScrollView, View } from 'react-native';
import React, { useState } from 'react';

import { useStackScreenStore } from '../../Store/useStackScreen';

import SearchResult from '../../Components/SearchResult';
import SavedAddress from '../../Components/SavedAddress';
import RecentSearch from '../../Components/RecentSearch';
import NearBy from '../../Components/NearBy';
import SearchInput from './searchInput';

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [searchData, setSearchData] = useState([]);
  const { setStackScreen } = useStackScreenStore();

  const selectedCallBack = (data) => {
    setStackScreen('TargetLocation', data);
  }

  return (
    <View style={styles.screenContainer}>
      <SearchInput 
        searchText={searchText} 
        setSearchText={setSearchText} 
        setSearchData={setSearchData}
        focused={false}
      />
      {searchText?.length !== 0 ? (
        <SearchResult 
          searchTxt={searchText} 
          search_data={searchData} 
          selectedCallBack={selectedCallBack}
        />
      ) : (
        <ScrollView>
          <SavedAddress />
          <RecentSearch />
          <NearBy />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
    zIndex: 1000,
  },
});

export default SearchScreen;

