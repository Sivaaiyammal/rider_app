import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { vehicleList } from '../styles/AddLocationStyles';
import NavBar from '../components/NavBar';
import BottomSheet from '../components/BottomSheet';
import Duration from '../assets/image/duration.svg';
import People from '../assets/image/people.svg';
import AddLocationCard from './SearchLocation/AddLocationCard';
import { useStackScreenStore } from '../store/useStackScreenStore';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';
import useLocationStore from '../store/useLocationStore';
import useRideSelectionStore from '../store/useRideSelectionStore';
import { showNotification } from '../components/NotificationManger';

import { useGetQuery, usePostQuery } from '../hooks/useQuery';


const VehicleListScreen = () => {
  const { goBack, setStackScreen } = useStackScreenStore();
  const { setSelectedVehicle } = useSelectedVehicleStore();
  const { directions, setDirections } = useLocationStore();
  const { selectedTrip, selectedRide } = useRideSelectionStore();



  const vehicleListData = [
    {
      id: 'bike',
      name: 'Motor Bike',
      image: require('../assets/image/vehicle/bike.png'),
      duration: 0,
      count: 1,
      total_price: 0,
      discount_price: null,
    },
    {
      id: 'auto',
      name: 'Auto Rickshaw',
      image: require('../assets/image/vehicle/auto.png'),
      duration: 0,
      count: 1,
      total_price: 0,
      discount_price: null,
    },
    {
      id: 'hatchback',
      name: 'Hatchback',
      image: require('../assets/image/vehicle/hatchback.png'),
      duration: 0,
      count: 1,
      total_price: 0,
      discount_price: null,
    },
    {
      id: 'sedan',
      name: 'Sedan',
      image: require('../assets/image/vehicle/sedan.png'),
      duration: 0,
      count: 1,
      total_price: 0,
      discount_price: null,
    },
    {
      id: 'suv',
      name: 'SUV',
      image: require('../assets/image/vehicle/suv.png'),
      duration: 0,
      count: 1,
      total_price: 0,
      discount_price: null,
    },
    {
      id: 'luxsedan',
      name: 'Luxury Sedan',
      image: require('../assets/image/vehicle/luxsedan.png'),
      duration: 0,
      count: 1,
      total_price: 0,
      discount_price: null,
    },
  ];

  const [VehicleListData, setVehicleListData] = useState([])

  const onBackPress = () => {
    goBack();
  };

  const SelectedVehicle = (item) => {
    setStackScreen('SelectedVehicle')
    setSelectedVehicle(item)
  }


  const onGetRideEstimateSuccess = async (data) => {

    console.log(data, 'data');


    if (data.success) {

      let estimate_data = data.data

      let _vehicleListData = [...vehicleListData]

      _vehicleListData = _vehicleListData.map(item => {
        let vehicle = estimate_data.filter(vehicle => vehicle.type == item.id)[0]

        if (vehicle) {
          item.active = true
          item.total_price = parseFloat(vehicle.fare).toFixed(2)
          item.distance = parseFloat(vehicle.distance).toFixed(2)
          item.duration = parseFloat(vehicle.duration).toFixed(2)
          item.discount_price = 0
        } else {
          item.active = false
        }
        return item
      })
      setVehicleListData(_vehicleListData)


    } else {
      showNotification('Please try again', data.message, 'danger');
    }

  }

  const onGetRideEstimateError = (data) => {
    if (!data.success) showNotification('Please try again', data.message, 'danger');

  }

  const { mutate: GetRideEstimateMutate, isSuccess } = usePostQuery({
    onSuccess: onGetRideEstimateSuccess,
    onError: onGetRideEstimateError
  });
  const getTripTypeValue = (type) => {
    if (type == '1') return 'instant';
    if (type == '2') return 'schedule';
    return 'instant'
  }
  const getRideTypeValue = (type) => {
    if (type == '1') return 'one_way';
    if (type == '2') return 'round_trip';
    return 'one_way'
  }
  const HandleGetRideEstimate = async () => {

    if (directions.length < 2) {
      return showNotification('Please select start and end location', 'Please select start and end location', 'danger');
    }

    let start_location = directions.filter(item => item.name == 'Start')[0]
    let end_location = directions.filter(item => item.name == 'End')[0]
    let waypoints = directions.filter(item => item.name == 'Waypoint')
    let trip_type = getTripTypeValue(selectedTrip.id)
    let ride_type = getRideTypeValue(selectedRide.id)

    let payload = {
      startLocation: {
        lat: start_location.location[0],
        lon: start_location.location[1],
      },
      endLocation: {
        lat: end_location.location[0],
        lon: end_location.location[1],
      },

      waypoints: waypoints.map(item => { return { lat: item.location[0], lon: item.location[1] } }),
      trip_type: trip_type,
    }

    await GetRideEstimateMutate({
      queryKey: 'getRideEstimateQuery',
      url: '/customer/ride/getRideEstimate',
      payload: payload
    })

  }

  useEffect(() => {
    HandleGetRideEstimate()
  }, [])

  return (
    <>
      <NavBar withBg title={'Choose Your Ride'} onBackPress={onBackPress} />
      <AddLocationCard screenType={'vehicleList'} />
      <BottomSheet>
        {VehicleListData.filter(v => v.active).map(item => {
          return (
            <TouchableOpacity key={item.id} style={vehicleList.cards} onPress={() => SelectedVehicle(item)}>
              <View style={vehicleList.imageContainer}>
                <Image
                  source={item.image}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              </View>
              <View style={vehicleList.vehicleDetails}>
                <Text style={vehicleList.vehicleName}>{item.name}</Text>
                <View style={vehicleList.vehicleDetailsContainer}>
                  <View style={vehicleList.vehicleDetailsTxt}>
                    <Duration />
                    <Text>{item.duration || ''} mins away</Text>
                  </View>
                  <View style={vehicleList.vehicleDetailsTxt}>
                    <People />
                    <Text>1</Text>
                  </View>
                </View>
              </View>
              <View style={vehicleList.priceDetails}>
                <Text style={vehicleList.totalPrice}>₹{item.total_price}</Text>
                {item.discount_price ?
                  <Text style={vehicleList.discountPrice}>
                    {item.discount_price || "0"}% off
                  </Text> : ''
                }

              </View>
            </TouchableOpacity>
          );
        })}
      </BottomSheet>
    </>
  );
};

export default VehicleListScreen;
