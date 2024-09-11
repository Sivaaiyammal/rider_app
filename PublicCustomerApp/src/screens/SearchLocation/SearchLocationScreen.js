import {Image, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import NavBar from '../../components/NavBar';
import {useStackScreenStore} from '../../store/useStackScreenStore';
import AddLocationCard from './AddLocationCard';
import useLocationStore from '../../store/useLocationStore';
import useMapStore from '../../store/useMapStore';
import locationTask from '../../controllers/GetCurrentLocation';
import {addLocation } from '../../styles/AddLocationStyles';


const SearchLocation = () => {
  const {goBack, setStackScreen} = useStackScreenStore();
  const {setDirections} = useLocationStore();
  const {
    setOnSearchResults,
    setMapMarkers,
    setDirectionPoints,
    setSearchUnit,
    directionPoints,
  } = useMapStore();

  const onBackPress = async () => {
    setDirections([
      {id: 1, name: 'Start', location: [], locationName: ''},
      {id: 2, name: 'End', location: [], locationName: ''},
    ]);
    setOnSearchResults(null);
    setMapMarkers([]);
    goBack();
    setDirectionPoints(null);
    setSearchUnit('');
    await locationTask.getCurrentLocation();
  };

  const onConfirm = () => {
    setStackScreen('VehicleList')
  }

  return (
    <>
      <NavBar withBg onBackPress={onBackPress} title={'Destination'} />
      <AddLocationCard screenType={'searchLocation'}/>
      {directionPoints && (
        <TouchableOpacity style={addLocation.confirmBtn} onPress={()=>onConfirm()}>
          <Text style={addLocation.confirmBtnTxt}>CONFIRM DESTINATION</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default SearchLocation;
