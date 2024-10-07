import { Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import NavBarA from '../../components/TopNavBar/NavBarA';
import {colors} from '../../constants/constants';
import VehicleEntry from './VehicleEntry';
import DriverEntry from './DriverEntry';
import { driverDetailStyles } from '../../styles/DriverDetailsUpload';

const DriverVehiclesDetails = () => {
  const driverDetailsTab = [
    {
      id: 1,
      title: 'Driver Details',
    },
    {
      id: 2,
      title: 'Vehicle Details',
    },
  ];

  const [selected, setSelected] = useState(driverDetailsTab[0]);

  const _renderComponent = () => {
    switch (selected.id) {
      case 1:
        return <DriverEntry />;
      case 2:
        return <VehicleEntry />;
      default:
        return <DriverEntry />;
    }
  };

  return (
    <View style={{backgroundColor:colors.white, flex:1}}>
      <NavBarA title={'Enter'} subtitle={'Driver & Vehicle Details'} />
      <View style={driverDetailStyles.tabContainer}>
        {driverDetailsTab.map(item => {
          return (
            <TouchableOpacity
              style={driverDetailStyles.tabBtns}
              key={item.id}
              onPress={() => setSelected(item)}>
              <Text
                style={
                  selected.id === item.id
                    ? driverDetailStyles.selectedtitleText
                    : driverDetailStyles.titleText
                }>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={driverDetailStyles.subConatiner}>
      {_renderComponent()}
      </View>
    
    </View>
  );
};

export default DriverVehiclesDetails;
