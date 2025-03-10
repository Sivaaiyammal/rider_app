import { Text, View, Image, TouchableOpacity, StatusBar } from 'react-native';
import React, {useEffect,useState} from 'react';
import { vehicleList } from '../styles/AddLocationStyles';
import BottomSheet from '../components/BottomSheet';
import Duration from '../assets/image/duration.svg';
import People from '../assets/image/people.svg';
import useSelectedVehicleStore from '../store/useSelectedVehicleStore';
import { getVehicleDetailsById } from '../constants/JsonData';
import { Fonts,colors } from '../constants/constants';
import  useRideSelectionStore from '../store/useRideSelectionStore';
import NavBar from '../components/NavBar';
import {useStackScreenStore} from '../store/useStackScreenStore';
import { shallow } from 'zustand/shallow';
import useMapStyleStore from '../store/useMapStyleStore';


const VehicleListScreen = () => {
  const { goBack, setStackScreen } = useStackScreenStore();
  const { setSelectedVehicle } = useSelectedVehicleStore();
  const { vehicleList: vehicles } = useRideSelectionStore();
  const { setMapStyle, resetMapStyle } = useMapStyleStore();

  const [bottomSheetHeight, setBottomSheetHeight] = useState(0);

  const handleVehicleSelect = (vehicle) => {
    resetMapStyle();
    setStackScreen('SelectedVehicle');
    setSelectedVehicle(vehicle);
  };
  useEffect(() => {
    setMapStyle({
      width: "100%",
      height: "70%",
    });
  }, []);

  const onBackPress = () => {
    resetMapStyle();
    goBack();
  };

  return (
    <><StatusBar barStyle="dark-content" backgroundColor="#ffffff"  />
      <NavBar onBackPress={onBackPress} title={'Choose Vehicle'} />
      <BottomSheet minHeight={bottomSheetHeight}>
        <View style={{paddingBottom:40}}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setBottomSheetHeight(height); // Dynamically set the height
        }}
        >
        {vehicles.map((item, idx) => {
          const vehicleDetails = getVehicleDetailsById(item.vehicleType);
          return (
            <TouchableOpacity key={idx} style={vehicleList.cards} onPress={() => handleVehicleSelect(item)}>
              <View style={vehicleList.imageContainer}>
                <Image
                  source={vehicleDetails.image}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              </View>
              <View style={vehicleList.vehicleDetails}>
                <Text style={vehicleList.vehicleName}>{vehicleDetails.name}</Text>
                <View style={vehicleList.vehicleDetailsContainer}>
                  <View style={vehicleList.vehicleDetailsTxt}>
                    <Duration />
                    <Text style={{fontFamily: Fonts.light, color: colors.black}}>{item.time || ''} mins away</Text>
                  </View>
                  <View style={vehicleList.vehicleDetailsTxt}>
                    <People />
                    <Text style={{fontFamily: Fonts.light, color: colors.black}}>{vehicleDetails.capacity}</Text>
                  </View>
                </View>
              </View>
              <View style={vehicleList.priceDetails}>
                <Text style={vehicleList.totalPrice}>₹{item.price}</Text>
                {item.discount_price > 0 && (
                  <Text style={vehicleList.discountPrice}>
                    {item.discount_price}% off
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        </View>
      </BottomSheet>
    </>
  );
};

export default VehicleListScreen;
