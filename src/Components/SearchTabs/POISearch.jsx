import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  SectionList,
  StatusBar,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { poiSearchData } from "../../Constants/JsonData";
import { searchTabsStyles } from "../../Styles/SearchTabStyles";
import { useTranslation } from "react-i18next";

const POISearch = () => {

  const {t} = useTranslation();

  const renderSectionHeader = (title) => {
    return (
      <View style={searchTabsStyles.sectionHeader}>
        <Text style={searchTabsStyles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  const renderItems = (items) => {
    return items.map((item, index) => (
      <View key={index} style={searchTabsStyles.poiListCard}>
        <TouchableOpacity
          onPress={() => setSelectedItem(item)}
          style={searchTabsStyles.poibtns}
        >
          <Text style={searchTabsStyles.itemText}>{t(item.name)}</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View style={searchTabsStyles.POIcontainer}>
    <ScrollView contentContainerStyle={searchTabsStyles.scrollViewContent}>
      {poiSearchData.map((section, sectionIndex) => (
        <View key={sectionIndex}>
          {renderSectionHeader(section.title)}
          <View style={searchTabsStyles.row}>
            {renderItems(section.data)}
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
  );
};

export default POISearch;
