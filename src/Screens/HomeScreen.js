import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import InputContainer from '../Components/InputContainer';
import SavedAddress from '../Components/SavedAddress';
import RecentSearch from '../Components/RecentSearch';
import NearBy from '../Components/NearBy';
import SearchResult from '../Components/SearchResult';

const HomeScreen = () => {
  const [searchText, setSearchText] = useState('');

  const clearText = () => {
    setSearchText('');
  };

  const handleSearch = value => {
    setSearchText(value);
  };

  return (
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
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});
