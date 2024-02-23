import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {search_data} from '../Constants/DummyData';

// icons
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {Icons} from '../Constants/Contants';
import {AddressCards} from '../Styles/ComponentStyles';

const Item = ({title, searchKeyword}) => {
  const shouldShow =
    title.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    title.name.toLowerCase().includes(searchKeyword.toLowerCase());

  if (!shouldShow) {
    return null;
  }
  return (
    <View style={[styles.contentList, styles.borderbottom]}>
      <View style={styles.resultSearchIcon}>
        <Fontisto name="search" size={14} />
      </View>
      <TouchableOpacity style={styles.m5}>
        <Text style={AddressCards.resultName}>{title.name}</Text>
        <View style={AddressCards.flexRow}>
          {title.duration && (
            <Text style={[AddressCards.addressTxt, AddressCards.colorViolet]}>
              {title.duration}
            </Text>
          )}
          {title.address && (
            <Text
              numberOfLines={1}
              style={[AddressCards.addressTxt, {width: '70%'}]}>
              {' . '}
              {title.address}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.upArrow}>
        <Feather name="arrow-up-left" size={22} />
      </TouchableOpacity>
    </View>
  );
};

const Header = ({title, onPress, isCollapsed, searchKeyword}) => (
  <View>
    <TouchableOpacity
      style={[styles.contentList, styles.borderDashed]}
      onPress={onPress}>
      <View style={styles.searchCancelBtn}>
        {Icons.resturant}
        <View style={{position: 'absolute', bottom: 0, right: 0}}>
          {Icons.search_small}
        </View>
      </View>
      <View style={styles.m5}>
        <Text style={AddressCards.titleTxt}>{title}</Text>
        <Text style={AddressCards.statusTxt}>Search Nearby</Text>
      </View>
      <View style={styles.expandBtn}>
        {isCollapsed ? (
          <AntDesign name="down" size={14} />
        ) : (
          <AntDesign name="up" size={14} />
        )}
      </View>
    </TouchableOpacity>
    {!isCollapsed && (
      <View style={styles.resultFound}>
        <Text style={AddressCards.titleTxt}>Resturants Found</Text>
        <Text>Sort by Nearest</Text>
      </View>
    )}
    {!isCollapsed &&
      search_data
        .find(item => item.title === title)
        .data.map((dataItem, index) => (
          <Item key={index} title={dataItem} searchKeyword={searchKeyword} />
        ))}
  </View>
);

const SearchResult = props => {
  const {searchTxt} = props;
  const [collapsedHeaders, setCollapsedHeaders] = useState([]);

  const toggleHeader = title => {
    if (collapsedHeaders.includes(title)) {
      setCollapsedHeaders(collapsedHeaders.filter(item => item !== title));
    } else {
      setCollapsedHeaders([...collapsedHeaders, title]);
    }
  };

  const filteredData = search_data.filter(section => {
    const sectionTitleMatch = section.title
      .toLowerCase()
      .includes(searchTxt?.toLowerCase());
    const sectionDataMatch = section.data.some(item =>
      item.name.toLowerCase().includes(searchTxt?.toLowerCase()),
    );
    return sectionTitleMatch || sectionDataMatch;
  });

  return (
    <FlatList
      data={filteredData}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item}) => (
        <View style={styles.cardContainer}>
          <Header
            title={item.title}
            onPress={() => toggleHeader(item.title)}
            isCollapsed={collapsedHeaders.includes(item.title)}
            searchKeyword={searchTxt}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  searchCancelBtn: {
    width: '14%',
    margin: 4,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  borderDashed: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#edeff6',
    paddingBottom: 3,
  },
  borderbottom: {
    borderBottomWidth: 1,
    borderColor: '#edeff6',
    padding: 8,
  },
  m5: {
    marginLeft: 5,
    width: '68%',
  },
  cardContainer: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 4,
    borderColor: '#edeff6',
    paddingTop: 4,
  },
  upArrow: {
    width: '14%',
    margin: 4,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  expandBtn: {
    width: '10%',
    margin: 4,
    borderRadius: 40,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    backgroundColor: '#edeff6',
  },
  resultSearchIcon: {
    width: '12%',
    margin: 4,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    backgroundColor: '#edeff6',
  },
  resultFound: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
});

export default SearchResult;
