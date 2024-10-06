import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import NavBarA from '../../components/TopNavBar/NavBarA';
import {colors, Fonts} from '../../constants/constants';
import VehicleEntry from './VehicleEntry';
import DriverEntry from './DriverEntry';

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
      <View style={styles.tabContainer}>
        {driverDetailsTab.map(item => {
          return (
            <TouchableOpacity
              style={styles.tabBtns}
              key={item.id}
              onPress={() => setSelected(item)}>
              <Text
                style={
                  selected.id === item.id
                    ? styles.selectedtitleText
                    : styles.titleText
                }>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.subConatiner}>
      {_renderComponent()}
      </View>
    
    </View>
  );
};

export default DriverVehiclesDetails;

const styles = StyleSheet.create({
  tabContainer: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  titleText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: colors.grey_dark,
  },
  selectedtitleText: {
    color: colors.yellow,
    fontFamily: Fonts.medium,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  tabBtns: {
    width: '50%',
    alignItems: 'center',
  },
  subConatiner:{
    width:'90%',
    alignSelf:'center',
    marginTop:10
  }
});
