import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from "react-native";
// import {search_data} from '../Constants/DummyData';

// icons
import Feather from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import Fontisto from "react-native-vector-icons/Fontisto";
import { Colors, Fonts, Icons } from "../Constants/Contants";
import { AddressCards } from "../Styles/ComponentStyles";

const groupByType = (data) => {
  if (!data) return [];
  const grouped = data?.reduce((acc, item) => {
    const { type } = item;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  return Object.keys(grouped).map((type) => ({
    title: type,
    data: grouped[type],
  }));
};

const SearchResult = (props) => {
  const { searchTxt, search_data, selectedCallBack } = props;

  console.log("hari-->>searchData-->>", search_data);
  const groupedData = groupByType(search_data);

  const renderSectionHeader = ({ section: { title } }) => {
    const titleTxt = title.split('_')[1]
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{titleTxt}</Text>
      </View>
    );
  };

  const setSelectedItem = (item) => {
    const newItem = {
      name :item.name,
      coordinates : [item.longitude, item.latitude]
    }
    selectedCallBack(newItem)
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedItem(item)}
        style={styles.item}
      >
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.itemSubText}>{item.address}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SectionList
      stickySectionHeadersEnabled
      sections={groupedData}
      keyExtractor={(item, index) => item.name + index}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  sectionHeaderText: {
    fontFamily:Fonts.bold,
    fontSize:16,
    color:Colors.black
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  itemSubText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  searchCancelBtn: {
    width: "14%",
    margin: 4,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contentList: {
    flexDirection: "row",
    alignItems: "center",
  },
  borderDashed: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#edeff6",
    paddingBottom: 3,
  },
  borderbottom: {
    borderBottomWidth: 1,
    borderColor: "#edeff6",
    padding: 8,
  },
  m5: {
    marginLeft: 5,
    width: "68%",
  },
  cardContainer: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 4,
    borderColor: "#edeff6",
    paddingTop: 4,
  },
  upArrow: {
    width: "14%",
    margin: 4,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  expandBtn: {
    width: "10%",
    margin: 4,
    borderRadius: 40,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: "#edeff6",
  },
  resultSearchIcon: {
    width: "12%",
    margin: 4,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    backgroundColor: "#edeff6",
  },
  resultFound: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
});

export default SearchResult;
