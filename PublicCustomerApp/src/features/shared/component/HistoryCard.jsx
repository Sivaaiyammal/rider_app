import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { colors, Fonts } from '../../../constants/constants';
import { DataStore } from '../../../controllers/DataStore';
import HistoryIcon from '../../../assets/icons/HistoryIcon.svg';

const HistoryCard = ({ selectCallback, header = true, bottomborder = true,fromSearchScreen=false }) => {
  const [historyItems, setHistoryItems] = useState([]);
  
  const setRecentSearches = useCallback(async () => {
    const recentSearches = await DataStore.loadData('recentSearches');
    console.log(recentSearches)
    setHistoryItems(recentSearches?.data || []);
  }, []);

  useEffect(() => {
    setRecentSearches();
  }, [setRecentSearches]);

  return (
    <View style={styles.container}>
      {(historyItems?.length > 0 && header) && <Text style={styles.title}>Recent</Text>}
      {historyItems?.length > 0 ? (
        historyItems.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => selectCallback(item)}>
            <View style={[styles.historyItem, bottomborder && {borderBottomWidth: index === historyItems.length - 1 ? 0 : 0.5} ]}>
              <View style={styles.iconContainer}>
                <HistoryIcon width={50} height={50} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.name,fromSearchScreen&&{fontSize:15}]}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
                {item.address && <Text style={[styles.address,fromSearchScreen&&{fontSize:14}]} numberOfLines={1} ellipsizeMode="tail">{item.address}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noHistoryContainer}>
        
          <Text style={styles.noHistoryText}>No recent searches</Text>
          <Text style={styles.noHistorySubtext}>Your recent searches will appear here</Text>
          <View style={styles.noHistoryIconContainer}>
            <Ionicons name="search-outline" size={40} color={"#757575"} />
          </View>
        </View>
      )}
    </View>
  );
};

HistoryCard.propTypes = {
  selectCallback: PropTypes.func.isRequired,
  header: PropTypes.bool,
  bottomborder: PropTypes.bool,
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

    borderBottomColor: colors.grey,
    gap: 20,
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
    fontFamily: Fonts.regular,
    color: '#212121',
  },
  address: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#757575',
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.black,
    marginBottom: 10,
  },
  noHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  noHistoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 15,
  },
  noHistoryText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: colors.black,
    marginBottom: 5,
  },
  noHistorySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#757575",
    textAlign: 'center',
  },
});

export default HistoryCard;
