import React, {useCallback, useState, useRef, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {colors, Fonts} from '../../../constants/constants';
import NavBar from '../../../components/NavBar';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import useLocationStore from '../../../store/useLocationStore';
import { performSearch } from '../../../components/Native/NESearch';
import { SearchResultV2 } from '../components/SearchResult';
import SearchResultSkeleton from '../components/SearchResultSkeleton';
import HorizontalLoadingIndicator from '../components/HorizontalLoadingIndicator';
import StateVectorConatiner from '../../../components/StateVectorConatiner';
import { clearSingleStateVector, clearAllStateVectors } from "../../../components/Native/NESearch";
import HistoryCard from '../../shared/component/HistoryCard';
import { DataStore } from '../../../controllers/DataStore';

import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';

const CACHE_EXPIRY = 5 * 60 * 1000;
const searchCache = new Map();

const SearchScreen = ({onSearchClick=null,searchType,fromaddWayPoint=false,getwaitingTime=false,title=null,index=null}) => {
  const [searchTxt,setSearchTxt] = useState("");
  const {goBack,setStackScreen} = useStackScreenStore();
  const [isLoading,setIsLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRegionModalVisible, setIsRegionModalVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [onSearchResults, setOnSearchResults] = useState([]);
  const {location, setSelectedInput} = useLocationStore();
  const [stateVector, setStateVector] = useState(null);
  const { t } = useTranslation(); 
  
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Region configuration
  const REGIONS = useMemo(() => [
    { id: 1, name: 'India', value: 'india' },
    // { id: 2, name: 'United States', value: 'united states' }
  ], []);

  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  // Load recent searches when component mounts
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const recentSearches = await DataStore.loadData('recentSearches');
        if (recentSearches && recentSearches.data) {
          setRecentSearches(recentSearches.data);
        }
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    };
    loadRecentSearches();
  }, []);

  const storeRecentSearch = async (item) => {
    try {
      const recentSearches = await DataStore.loadData('recentSearches');
      let updatedSearches = [];

      if (recentSearches && recentSearches.data) {
        // Check if item already exists
        const exists = recentSearches.data.some(search => search.name === item.name);
        
        if (!exists) {
          // Add new item to start of array, limit to 5 items
          updatedSearches = [item, ...recentSearches.data].slice(0, 4);
        } else {
          // Move existing item to start
          updatedSearches = [
            item,
            ...recentSearches.data.filter(search => search.name !== item.name)
          ].slice(0, 5);
        }
      } else {
        updatedSearches = [item];
      }

      await DataStore.storeData('recentSearches', updatedSearches);
      setRecentSearches(updatedSearches);
    } catch (error) {
      console.error("Error storing recent search:", error);
    }
  }

  // Debounce the search input to limit API calls 
  const searchAPI = useCallback(async (value, statevectore={}, fullSearch=false) => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      const stateVectorStr = JSON.stringify(statevectore);
      const cacheKey = `${value.toLowerCase().trim()}_${stateVectorStr}`;
      const cachedResult = searchCache.get(cacheKey);

      if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_EXPIRY)) {
        setOnSearchResults(cachedResult.results);
        return;
      }

      if (statevectore && Object.keys(statevectore).length > 0) {
        fullSearch = true;
      }

      const searchParams = {
        latitude: location[1] || 11.0168, 
        longitude: location[0] || 76.9558, 
        searchString: value,
        mapUnitName: selectedRegion?.value || "india",
        stateVector: statevectore,
        resultCount: 10,
        langCode: 'en',
        debug: false,
        onlineOnly: false,
        makeFullSearch: fullSearch,
        isPoiSearch: false,
        radius: 50000,
        category: [],
        signal: abortControllerRef.current.signal
      };

      setIsLoading(true);
      const searchResults = await performSearch(searchParams);
      setIsLoading(false);
      setOnSearchResults(searchResults);
      
      searchCache.set(cacheKey, { results: searchResults, timestamp: Date.now() });
 
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('Search request was cancelled');
        return;
      }
      console.error('Error performing search:', e);
      setOnSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [location, setOnSearchResults, selectedRegion]);

  const debouncedSetSearchUnit = useMemo(() => debounce((query) => {
    if (query.trim()) searchAPI(query);
    else setOnSearchResults([]);
  }, 300), [searchAPI]);

  useEffect(() => {
    return () => {
      debouncedSetSearchUnit.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSetSearchUnit]);

  // Cleanup effect to clear all state vectors when component unmounts
  useEffect(() => {
    return () => {
      clearAllStateVectors();
      setStateVector(null);
    };
  }, []);

  // Memoize the input change handler to avoid unnecessary re-renders
  const _onChangeText = useCallback(
    value => {
      debouncedSetSearchUnit(value);
      setSearchTxt(value);
    },
    [debouncedSetSearchUnit],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isSearchFocused ? 1 : 0,
        duration: isSearchFocused ? 300 : 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isSearchFocused ? 0 : 50,
        duration: isSearchFocused ? 300 : 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [isSearchFocused]);
 
  const selectedCallBack = async (item, type) => {
    console.log("selectedCallBack",item,type);
    if (type === 'FastMatch') {
      if(item?.stateVectorForMatches){
        await searchAPI('', item?.stateVectorForMatches);
        setSearchTxt('');
        setStateVector(item?.stateVectorForMatches);
      }
    } else {
      onLocationNamePress(item);
    }
  };

  const removeStateVecotr = async (item) => {
    console.log("removeStateVecotr",item);
    clearSingleStateVector(item.key, item.index);
    setStateVector(null);
    await searchAPI(searchTxt, null);
  }

  // onpress on search results
  const onLocationNamePress = useCallback((item) => {
    item["locationFrom"] = "SEARCH";
    storeRecentSearch(item);
    onSearchClick(item, searchType, index);
  }, [onSearchClick, searchType, index]);

  const fullSearch = () => {
    searchAPI(searchTxt, null, true);
  }

  const onGoBack = () => {
    goBack();
    setSelectedInput(null); // to disable locate on map when goBack
  }

  const handleLocateOnMapCallback = (item) => {
    onSearchClick(item, searchType, index);
  }

  const handleLocateOnMap = () => {
    goBack();
    setStackScreen('PickLocationScreen', {
      onPickLocationResultCallback: handleLocateOnMapCallback,
      locationTypes: searchType,
      fromaddWayPoint: fromaddWayPoint,
      getwaitingTime: getwaitingTime,
      title: title,
      index: index
    });
  }

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchTxt.trim()) debouncedSetSearchUnit(searchTxt);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };



  const showRegionModal = () => {
    setIsRegionModalVisible(true);
  };

  const hideRegionModal = () => {
    setIsRegionModalVisible(false);
  };

  const handleRegionSelect = useCallback((newRegion) => {
    setSelectedRegion(newRegion);
    hideRegionModal();
    searchCache.clear();
    if (searchTxt.trim()) {
      searchAPI(searchTxt);
    }
  }, [searchTxt, searchAPI]);

  const handleClearSearch = () => {
    setSearchTxt('');
    setOnSearchResults([]);
  };

  useEffect(() => {
    console.log("onSearchResults",JSON.stringify(onSearchResults, null, 2));
  }, [onSearchResults]);

  return (
    <View style={styles.screen}>
        <NavBar onBackPress={onGoBack} title={t('search')} />
        
        {/* Search Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.searchContainer}>
            <AntDesign name="search1" color={'black'} size={22} />
            <TextInput
              ref={searchInputRef}
              placeholder={t('search_cities_areas_streets')}
              placeholderTextColor="grey"
              style={styles.input}
              onChangeText={_onChangeText}
              value={searchTxt}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              autoFocus
              onSubmitEditing={() => fullSearch()}
            />
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClearSearch}>
            <View style={styles.searchAction}>
              {searchTxt.length > 0 && <Ionicons onPress={()=>fullSearch()} name="checkmark-outline" color={'black'} size={24} />}
              {searchTxt.length > 0 && <AntDesign name="close" color={'black'} size={22} />} 
            </View>
          </TouchableOpacity>
        </View>

        {/* Region Selector */}
        {/* <View style={styles.regionRow}>
          <Text style={styles.regionLabel}>{t('search_region')}</Text>
          <TouchableOpacity style={styles.dropDownContainer} onPress={showRegionModal}>
            <Text style={styles.dropDownText}>
              {selectedRegion?.name || 'Select'}
            </Text>
            <Ionicons
              name={isRegionModalVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.black}
            />
          </TouchableOpacity>
        </View> */}

        {/* State Vector Container */}
        <StateVectorConatiner stateVectorArr={onSearchResults} removeStateVector={removeStateVecotr}/>
        
        {/* Search Results or Recent Searches */}
        {searchTxt.trim() === '' && !onSearchResults && recentSearches.length > 0 ? (
          <View style={styles.recentSearchesContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultHeaderText}>{t('recent_searches')}</Text>
              
            </View>
            {isLoading && (
                <HorizontalLoadingIndicator 
                  width="100%" 
                  height={3} 
                  backgroundColor={colors.grey_light}
                  activeColor={colors.primary}
                  duration={1500}
                />
              )}
            {recentSearches.map((result, index) => (
              <TouchableOpacity
                key={`${result.name}-${index}`}
                style={styles.recentSearchItem}
                onPress={() => onLocationNamePress(result)}
              >
                <Ionicons name="time-outline" size={20} color={colors.grey} style={styles.recentSearchIcon} />
                <View style={styles.recentSearchTextContainer}>
                  <Text style={styles.recentSearchText}>{result.name}</Text>
                  <Text style={styles.recentSearchAddress}>{result.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : searchTxt.trim() !== '' || stateVector ? (
          <View>
            <View style={styles.resultHeader}>
              <Text style={styles.resultHeaderText}>
                {searchTxt.length < 1 ? `Search results` : `Search results for "${searchTxt}"`}
              </Text>
              
            </View>
            {isLoading && (
                <HorizontalLoadingIndicator 
                  width="100%" 
                  height={3} 
                  backgroundColor={colors.grey_light}
                  activeColor={colors.primary}
                  duration={1500}
                />
              )}
            {isLoading ? (
              <SearchResultSkeleton count={8} />
            ) : onSearchResults && onSearchResults.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={40} color={colors.grey} />
                <Text style={styles.noResultsText}>No results found</Text>
              </View>
            ) : (
              <SearchResultV2    
                  searchTxt={searchTxt}
                  search_data={onSearchResults}
                  selectedCallBack={selectedCallBack}
                  setStateVector={setStateVector}
              />
            )}
          </View>
        ) : (
          <HistoryCard selectCallback={onLocationNamePress}/>
        )}
        
        <TouchableOpacity style={styles.bottomBtn} onPress={()=>handleLocateOnMap()}>
          <Entypo name="location" size={18} color={colors.black} />
          <Text style={styles.bottomBtnTxt}>{t('locate_on_map')}</Text>
        </TouchableOpacity>

        {/* Region Selection Modal */}
        <Modal
          visible={isRegionModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={hideRegionModal}
          statusBarTranslucent={true}
        >
          <TouchableOpacity 
            style={styles.regionModalOverlay} 
            activeOpacity={1} 
            onPress={hideRegionModal}
          >
            <View style={styles.regionModalContent}>
              <View style={styles.regionModalHeader}>
                <Text style={styles.regionModalTitle}>Select Search Region</Text>
                <TouchableOpacity onPress={hideRegionModal}>
                  <Ionicons name="close" size={24} color={colors.black} />
                </TouchableOpacity>
              </View>
              <View style={styles.regionList}>
                {REGIONS.map((region) => (
                  <TouchableOpacity
                    key={region.id}
                    style={[
                      styles.regionItem,
                      selectedRegion.id === region.id && styles.selectedRegionItem
                    ]}
                    onPress={() => handleRegionSelect(region)}
                  >
                    <Text style={[
                      styles.regionItemText,
                      selectedRegion.id === region.id && styles.selectedRegionText
                    ]}>
                      {region.name}
                    </Text>
                    {selectedRegion.id === region.id && (
                      <Ionicons name="checkmark" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  inputContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: colors.grey_light,
    marginTop: 5,
    height: 50,
  
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  closeBtn: {
    width: '12%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 5,
    color: colors.black,
    fontFamily: Fonts.regular,
    fontSize: 16,
    backgroundColor: 'transparent'
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  regionLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.grey_dark,
  },
  dropDownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.grey_light,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dropDownText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: colors.black,
    marginRight: 8,
  },
  resultHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: 'black',
    gap: 8,
  },
  resultHeaderText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.white,
  },
  recentSearchesContainer: {
    flex: 1,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_light,
  },
  recentSearchIcon: {
    marginRight: 10,
  },
  recentSearchTextContainer: {
    flex: 1,
  },
  recentSearchText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  recentSearchAddress: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grey_dark,
    marginTop: 2,
  },

  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.grey_dark,
    marginTop: 10,
  },
  regionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  regionModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  regionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_light,
  },
  regionModalTitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  regionList: {
    padding: 16,
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey_light,
  },
  selectedRegionItem: {
    backgroundColor: colors.grey_light,
  },
  regionItemText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  selectedRegionText: {
    fontFamily: Fonts.medium,
    color: colors.primary,
  },
  bottomBtn: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  bottomBtnTxt: {
    fontFamily: Fonts.regular,
    color: colors.black,
    fontSize: 16,
    marginLeft: 15,
  },
  searchAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingRight: 10
  },
});
