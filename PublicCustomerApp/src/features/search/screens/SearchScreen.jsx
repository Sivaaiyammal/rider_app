import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {colors, Fonts} from '../../../constants/constants';
import NavBar from '../../../components/NavBar';
import {useStackScreenStore} from '../../../store/useStackScreenStore';
import useMapStore from '../../../features/map/store/useMapStore';
import useLocationStore from '../../../store/useLocationStore';
import Marker from '../../../controllers/NEMap/Marker';
import { performSearch } from '../../../components/Native/NESearch';
import { SearchResultV2 } from '../components/SearchResult';
import StateVectorConatiner from '../../../components/StateVectorConatiner';
import { clearSingleStateVector } from "../../../components/Native/NESearch";
import FullScreenLoader from '../../../components/Loaders/FullScreenLoader';
import HistoryCard from '../../shared/component/HistoryCard';
import { DataStore } from '../../../controllers/DataStore';
import useUserInfoStore from '../../../store/useUserInfoStore';
import { useDebouncedSearch } from '../../../hooks/useDebounce';
import { LocationTypes } from '../../booking/types/LocationTypes';
const SearchScreen = ({onSearchClick=null,searchType,fromaddWayPoint=false,getwaitingTime=false,title=null,index=null}) => {
  const [searchTxt,setSearchTxt] = useState("");
  const {goBack,setStackScreen} = useStackScreenStore();
  const [isLoading,setIsLoading] = useState(false);
  const {
    setSearchUnit,
    onSearchResults,
    searchUnit,
    setOnSearchResults,
    setMapMarkers,
    mapMarkers,
    setDirectionPoints,
    directionPoints,
  } = useMapStore();
  const {location, selectedInput, setSelectedInput,setDirections, directions} = useLocationStore();
  const {isFavouriteLocationSearchEnabled,setIsFavouriteLocationSearchEnabled,setCurrentSearchFavouriteLocation,CurrentSearchFavouriteLocation,setHomelocation,setWorklocation} = useUserInfoStore();
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
    } catch (error) {
      console.error("Error storing recent search:", error);
    }
  }
  // Debounce the search input to limit API calls 
  const searchAPI = useCallback(async (value,statevectore={},fullSearch=false) => {

    
    const searchParams = {
      latitude: location[1], 
      longitude: location[0], 
      searchString: value,
      mapUnitName: "india",
      stateVector:statevectore,
      resultCount: 10,
      langCode: 'en', // i18n.language 
      debug: true,
      onlineOnly: true,
      makeFullSearch: fullSearch,
      isPoiSearch: false,
      radius: 100000,
      category: [],
    };

    try {
      
      setIsLoading(true);
      const searchResults = await performSearch(searchParams);
      setIsLoading(false);
      setOnSearchResults(searchResults);
 
    } catch (e) {
      throw new Error(e);
    } finally {
      setIsLoading(false);
    }
  }, [location, setOnSearchResults]);

  const debouncedSetSearchUnit = useDebouncedSearch(searchAPI, 500);

  // Memoize the input change handler to avoid unnecessary re-renders
  const _onChangeText = useCallback(
    value => {
      debouncedSetSearchUnit(value);
      setSearchTxt(value);
    },
    [debouncedSetSearchUnit],
  );
 
  
  const selectedCallBack = async (item, type) => {
  
    if (type === 'Fast_match') {
      await searchAPI('',item)
      setSearchTxt('')
   
      
    }else{
    
      onLocationNamePress(item)
    }
  };

  

  
  
  const removeStateVecotr = async (item) =>{
     clearSingleStateVector(item.key, item.index)
     await searchAPI(searchTxt, null)
  }

  

  // onpress on search results
  const onLocationNamePress = useCallback((item)=>{

    item["locationFrom"]="SEARCH"
    storeRecentSearch(item);
    
    
    onSearchClick(item,searchType,index);
    

  }, [onSearchClick, searchType]);


  const fullSearch = () =>{
    searchAPI(searchTxt, null,true)
  }

  const onGoBack = () =>{
    goBack(),
    setSelectedInput(null) // to disable locate on map when goBack
  }


  const handleLocateOnMapCallback=(item)=>{
    
    onSearchClick(item,searchType,index)
  
    
  }

  const handleLocateOnMap = () =>{
    goBack()
    setStackScreen('PickLocationScreen',{
        onPickLocationResultCallback:handleLocateOnMapCallback,
        locationTypes:searchType,
        fromaddWayPoint:fromaddWayPoint,
        getwaitingTime:getwaitingTime,
        title:title,
        index:index
      })
  }

  return (
    <>
    {isLoading && <FullScreenLoader />}
    <View style={styles.screen}>
      <NavBar onBackPress={onGoBack} title={'Search'} />
      <View style={styles.inputContainer}>
        <View style={{flexDirection:'row',alignItems:'center',gap:5}}>
        <AntDesign name="search1" color={'black'} size={22} />
        <TextInput
          placeholder="Search Places"
          placeholderTextColor="grey"
          style={styles.input}
          onChangeText={_onChangeText}
          autoFocus
          onSubmitEditing={() => fullSearch()}
        />
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setSearchUnit('')}>
            <View style={styles.searchAction}>
          {searchTxt.length > 0 && <Ionicons onPress={()=>fullSearch()} name="checkmark-outline" color={'black'} size={24} />}
           {searchTxt.length > 0 && <AntDesign name="close" color={colors.grey} size={22} />} 
            </View>
        </TouchableOpacity>
      </View>
      <StateVectorConatiner stateVectorArr={onSearchResults} removeStateVecotr={removeStateVecotr}/>
      {/* {onSearchResults?.searchResults?.length > 0 && searchUnit.length > 0 && (
        <ScrollView contentContainerStyle={{paddingBottom: 80}}>
          {onSearchResults.searchResults.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.resultsBtn}
              onPress={() => onLocationNamePress(item)}>
              <Text style={styles.resultsBtnName}>{item.name}</Text>
              <Text style={styles.resultsBtnAdd}>{item.address}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )} */}
      {onSearchResults? <SearchResultV2 searchTxt={searchTxt} search_data={onSearchResults} selectedCallBack={selectedCallBack}/>:<HistoryCard selectCallback={onLocationNamePress}/>}
      
      <TouchableOpacity style={styles.bottomBtn} onPress={()=>handleLocateOnMap()}>
        <Entypo name="location" size={18} color={colors.black} />
        <Text style={styles.bottomBtnTxt}>Locate on Map</Text>
      </TouchableOpacity>
    </View>
    </>
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
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.grey_light,
    marginTop: 5,
  },
  closeBtn: {
    width: '12%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 5,
    color:colors.black,
    fontFamily:Fonts.regular,
    fontSize:16
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
  resultsBtn: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 5,
    borderBottomWidth: 0.3,
    paddingBottom: 8,
  },
  resultsBtnName: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: colors.black,
  },
  searchAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap:10,
    paddingRight:10
  },
  resultsBtnAdd: {
    fontFamily: Fonts.light,
    fontSize: 12,
    color: colors.black,
  },
});
