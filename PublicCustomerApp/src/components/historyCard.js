import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, Fonts} from '../constants/constants';

const HistoryCard = () => {
  // Mock data - in real app this would come from storage/API
  const historyItems = [
    {
      id: 1,
      name: 'Brookefields Mall',
      address: 'Dr Krishnasamy Mudaliyar Rd, Coimbatore',
      latitude: 11.0168,
      longitude: 76.9558,
      distance: '2.3 km'
    },
    {
      id: 2,
      name: 'VOC Park and Zoo',
      address: 'Sanganoor Road, Ram Nagar, Coimbatore', 
      latitude: 11.0139,
      longitude: 76.9703,
      distance: '3.1 km'
    },
    {
      id: 3,
      name: 'Prozone Mall',
      address: 'Sathy Rd, Ganapathy, Coimbatore',
      latitude: 11.0374,
      longitude: 76.9900,
      distance: '5.8 km'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent</Text>
      {historyItems.map(item => (
        <View key={item.id} style={styles.historyItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={20} color={colors.grey} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.address}>{item.address}</Text>
         
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginHorizontal: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grey,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.black,
  },
  address: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grey,
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.black,
    marginBottom: 10,
  },
});

export default HistoryCard;