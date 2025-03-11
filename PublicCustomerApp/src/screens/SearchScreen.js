import React, {useCallback, useMemo,useState,useContext} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {debounce} from 'lodash';
import {colors, Fonts} from '../constants/constants';
import NavBar from '../components/NavBar';
import {useStackScreenStore} from '../store/useStackScreenStore';
import useMapStore from '../store/useMapStore';
import useLocationStore from '../store/useLocationStore';
import Marker from '../controllers/NEMap/Marker';
import { performSearch } from '../components/Native/NESearch';
import { SearchResultV2 } from './searchResult';
import StateVectorConatiner from '../components/StateVectorConatiner';
import { clearSingleStateVector } from "../components/Native/NESearch";
import FullScreenLoader from '../components/Loaders/FullScreenLoader';
import HistoryCard from '../components/historyCard';
const SearchScreen = () => {
  const [searchTxt,setSearchTxt] = useState("");
  const {goBack} = useStackScreenStore();
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

  // Debounce the search input to limit API calls 
  const searchAPI = async (value,statevectore={},fullSearch=false) => {

    console.log('hari-->>location-->>', location)
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
  };

  const debouncedSetSearchUnit = useMemo(
    () => debounce(searchAPI, 500),
    [setSearchUnit]
  );

  // Memoize the input change handler to avoid unnecessary re-renders
  const _onChangeText = useCallback(
    value => {
      debouncedSetSearchUnit(value);
      setSearchTxt(value);
    },
    [debouncedSetSearchUnit],
  );
 
  
  const selectedCallBack = async (item, type) => {
    console.log( "directions",directions)
    if (type === 'Fast_match') {
      await searchAPI('',item)
      setSearchTxt('')
   
      
    }else{
    
      onLocationNamePress(item)
    }
  };

  // Set route direction when markers are updated
  const setRouteDirection = useCallback(
    directions => {
      if (directions.length >= 2) {
        const sortedDirections = directions.sort((a, b) => a.id - b.id);
        const routeData = sortedDirections.map(direction => ({
          lat: direction.lat,
          lon: direction.lng,
        }));
        setMapMarkers([]);

        setDirectionPoints({locations: routeData, type: 'car'});
      } else {
        setDirectionPoints(null);
      }
    },
    [setDirectionPoints, setMapMarkers],
  );

  // Set route direction when markers are removed
  const updateRouteDirections = useCallback(
    newData => {
      const input = selectedInput.id;
      const routeData = directions.map(item => {
        if (item.id === input) {
          return {
            lat: newData.latitude,
            lon: newData.longitude,
            locationName: newData.address,
          };
        } else if (item.location && item.location.length > 1) {
          return {
            lat: item.location[1] !== undefined ? item.location[1] : null,
            lon: item.location[0] !== undefined ? item.location[0] : null,
          };
        } else {
          return null;
        }
      }).filter(point => point !== null && point.lat !== null && point.lon !== null);
      // console.log('hari-->>route-->>', routeData);
      setDirectionPoints({ locations: routeData, type: 'car' });
      goBack();
    },
    [selectedInput, directions]
  );
  
  const removeStateVecotr = async (item) =>{
     clearSingleStateVector(item.key, item.index)
     await searchAPI(searchTxt, null)
  }

  // add map markers if route not added
  const addMapMarkers = useCallback(
    (item, markerType) => {
      if (!directionPoints) {
        const marker = new Marker(
          String(selectedInput.id),
          item?.name || Math.random().toString(),
          item?.longitude,
          item?.latitude,
          markerType,
          36,
          true,
        );
        const updatedMarkers = [...mapMarkers];
        const existingIndex = updatedMarkers.findIndex(
          m => m.type === markerType,
        );
        if (existingIndex !== -1) {
          updatedMarkers[existingIndex] = marker;
        } else {
          updatedMarkers.push(marker);
        }
        setMapMarkers(updatedMarkers);
        setRouteDirection(updatedMarkers);
        marker.setFocus(true);
        goBack();
      } else {
        updateRouteDirections(item);
      }
    },
    [directionPoints],
  );

  // onpress on search results
  const onLocationNamePress = useCallback(
    item => {
     
      const input = selectedInput?.id - 1;
      console.log('input-->>', input)
      const newDirections = directions.map((dir, index) =>
        index === input
          ? {
              ...dir,
              locationName:  item.name,
              locationAddress: item.address?.charAt(0).toUpperCase() + item.address?.slice(1),
              location: [item.longitude, item.latitude],
            }
          : dir,
      );
      setDirections(newDirections);
      setOnSearchResults(null);
      setSearchUnit('');

      if (selectedInput.id === 1) {
        addMapMarkers(item, 'marker_start');
      } else if (input === directions.length - 1) {
        
        addMapMarkers(item, 'marker_end');
      } else {
        addMapMarkers(item, 'marker_waypoint');
      }
      setSelectedInput(null);
    },
    [directions],
  );


  const fullSearch = () =>{
    searchAPI(searchTxt, null,true)
  }

  const onGoBack = () =>{
    goBack(),
    setSelectedInput(null) // to disable locate on map when goBack
  }

  return (
    <>
    {isLoading && <FullScreenLoader />}
    <View style={styles.screen}>
      <NavBar onBackPress={onGoBack} title={'Search'} />
      <View style={styles.inputContainer}>
        <View style={{flexDirection:'row',alignItems:'center',gap:5}}>
        <AntDesign name="search1" color={colors.grey} size={22} />
        <TextInput
          placeholder="Search Places"
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
          {searchTxt.length > 0 && <Ionicons onPress={()=>fullSearch()} name="checkmark-outline" color={colors.grey} size={24} />}
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
      {onSearchResults? <SearchResultV2 searchTxt={searchTxt} search_data={onSearchResults} selectedCallBack={selectedCallBack}/>:<HistoryCard/>}
      
      <TouchableOpacity style={styles.bottomBtn} onPress={()=>goBack()}>
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
