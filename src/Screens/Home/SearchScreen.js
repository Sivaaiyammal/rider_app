import { StyleSheet, ScrollView, View } from 'react-native';
import React, { useState } from 'react';

import { useStackScreenStore } from '../../Store/useStackScreen';

import SearchResult from '../../Components/SearchResult';
import SavedAddress from '../../Components/SavedAddress';
import RecentSearch from '../../Components/RecentSearch';
import NearBy from '../../Components/NearBy';
import SearchInput from './searchInput';
import useMapStore from '../../Store/useMapStore';
import SearchTabs from '../../Components/SearchTabs/SearchTabs';

const SearchScreen = ({ data }) => {
  const [searchText, setSearchText] = useState('');
  const [searchData, setSearchData] = useState([]);
  const { setStackScreen } = useStackScreenStore();
  const {onSearchResults} = useMapStore();

  const selectedCallBack = (result) => {
    setStackScreen('TargetLocation', result);
  }

  return (
    <View style={styles.screenContainer}>
      <SearchInput 
        searchText={searchText} 
        setSearchText={setSearchText} 
        setSearchData={setSearchData}
        focused={data === 'saved' || data === 'poi'}
        closeBtn={true}
      />
      {searchText?.length !== 0 ? (
        <SearchResult 
          searchTxt={searchText} 
          search_data={onSearchResults?.searchResults} 
          selectedCallBack={selectedCallBack}
        />
      ) : (
        // <ScrollView>
        //   <SavedAddress />
        //   <NearBy />
        // </ScrollView>
        <SearchTabs currentTab={data}/>
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

