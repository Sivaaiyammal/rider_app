import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {vehicleList} from '../styles/AddLocationStyles';
import NavBar from '../components/NavBar';
import BottomSheet from '../components/BottomSheet';
import Duration from '../assets/image/duration.svg';
import People from '../assets/image/people.svg';
import AddLocationCard from './SearchLocation/AddLocationCard';
import {useStackScreenStore} from '../store/useStackScreenStore';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';

const VehicleListScreen = () => {
  const {goBack, setStackScreen} = useStackScreenStore();
  const {setSelectedVehicle} = useSelectedVehicleStore();
  
  const vehicleListData = [
    {
      id: 1,
      name: 'Motor Bike',
      image: require('../assets/image/vehicle/bike.png'),
      duration: 10,
      count: 2,
      total_price: '₹100',
      discount_price: '₹50',
    },
    {
      id: 2,
      name: 'Auto Rickshaw',
      image: require('../assets/image/vehicle/auto.png'),
      duration: 10,
      count: 2,
      total_price: '₹100',
      discount_price: null,
    },
    {
      id: 3,
      name: 'Hatchback',
      image: require('../assets/image/vehicle/hatchback.png'),
      duration: 10,
      count: 2,
      total_price: '₹100',
      discount_price: null,
    },
    {
      id: 4,
      name: 'Sedan',
      image: require('../assets/image/vehicle/sedan.png'),
      duration: 10,
      count: 2,
      total_price: '₹100',
      discount_price: null,
    },
    {
      id: 5,
      name: 'SUV',
      image: require('../assets/image/vehicle/suv.png'),
      duration: 10,
      count: 2,
      total_price: '₹100',
      discount_price: null,
    },
    {
      id: 6,
      name: 'Luxury Sedan',
      image: require('../assets/image/vehicle/luxsedan.png'),
      duration: 10,
      count: 2,
      total_price: '₹100',
      discount_price: null,
    },
  ];

  const onBackPress = () => {
    goBack();
  };

  const SelectedVehicle = (item) => {
    setStackScreen('SelectedVehicle')
    setSelectedVehicle(item)
  }

  return (
    <>
      <NavBar withBg title={'Choose Your Ride'} onBackPress={onBackPress} />
      <AddLocationCard screenType={'vehicleList'}/>
      <BottomSheet>
        {vehicleListData.map(item => {
          return (
            <TouchableOpacity key={item.id} style={vehicleList.cards} onPress={()=>SelectedVehicle(item)}>
              <View style={vehicleList.imageContainer}>
                <Image
                  source={item.image}
                  style={{width: '100%', height: '100%', resizeMode: 'contain'}}
                />
              </View>
              <View style={vehicleList.vehicleDetails}>
                <Text style={vehicleList.vehicleName}>{item.name}</Text>
                <View style={vehicleList.vehicleDetailsContainer}>
                  <Text style={vehicleList.vehicleDetailsTxt}>
                    <Duration /> %min away
                  </Text>
                  <Text style={vehicleList.vehicleDetailsTxt}>
                    <People /> 1
                  </Text>
                </View>
              </View>
              <View style={vehicleList.priceDetails}>
                <Text style={vehicleList.totalPrice}>{item.total_price}</Text>
                {item.discount_price && (
                  <Text style={vehicleList.discountPrice}>
                    {item.discount_price}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </BottomSheet>
    </>
  );
};

export default VehicleListScreen;
