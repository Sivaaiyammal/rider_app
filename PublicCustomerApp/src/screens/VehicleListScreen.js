import { Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { vehicleList } from '../styles/AddLocationStyles';
import BottomSheet from '../components/BottomSheet';
import Duration from '../assets/image/duration.svg';
import People from '../assets/image/people.svg';
import { useStackScreenStore } from '../store/useStackScreenStore';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';
import { getVehicleDetailsById } from '../constants/JsonData';
import { Fonts } from '../constants/constants';


const VehicleListScreen = (props) => {
  const {vehicleListData} = props
  const { setStackScreen } = useStackScreenStore();
  const { setSelectedVehicle } = useSelectedVehicleStore();

  const SelectedVehicle = (item) => {
    setStackScreen('SelectedVehicle')
    setSelectedVehicle(item)
  }

  return (
    <>
      <BottomSheet>
        {vehicleListData.map(item => {
          return (
            <TouchableOpacity key={item.id} style={vehicleList.cards} onPress={() => SelectedVehicle(item)}>
              <View style={vehicleList.imageContainer}>
                <Image
                  source={getVehicleDetailsById(item.type).image}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              </View>
              <View style={vehicleList.vehicleDetails}>
                <Text style={vehicleList.vehicleName}>{getVehicleDetailsById(item.type).name}</Text>
                <View style={vehicleList.vehicleDetailsContainer}>
                  <View style={vehicleList.vehicleDetailsTxt}>
                    <Duration />
                    <Text style={{fontFamily:Fonts.light}}>{item.duration.toFixed(2) || ''} mins away</Text>
                  </View>
                  <View style={vehicleList.vehicleDetailsTxt}>
                    <People />
                    <Text style={{fontFamily:Fonts.light}}>{getVehicleDetailsById(item.type).capacity}</Text>
                  </View>
                </View>
              </View>
              <View style={vehicleList.priceDetails}>
                <Text style={vehicleList.totalPrice}>₹{item.fare}</Text>
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
