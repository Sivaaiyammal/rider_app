import React,{useState} from "react";
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
import {useStackScreenStore} from '../../Store/useStackScreen';
import useMapStore from '../../Store/useMapStore.js'
import useLocationStore from '../../Store/useLocationStore.js'
import AlertModal from "../AlertModal.jsx";
import Icon from 'react-native-vector-icons/FontAwesome5';

const POISearch = () => {
  const { setStackScreen } = useStackScreenStore();
  const { setSearchPOI } = useMapStore();
  const { location } = useLocationStore();

  const { t } = useTranslation();

  const [alertModal, setAlertModal] = useState(false);

  const onIconPress = (item) => {
    if (location === null) {
      setAlertModal(true);
    } else {
      if (item.poiID) {
        console.log(item.poiID);
        setSearchPOI({
          poiID: item.poiID,
          latitude: location[1],
          longitude: location[0],
        });
        setStackScreen("POIresult");
      }
    }
  };

  const renderAlertModal = () => (
    <AlertModal
      isVisible={alertModal}
      onClose={() => {
        setAlertModal(false);
      }}
      leftBtnTxt={"Cancel"}
      successMessage={"Current Location Not Available"}
      SubText={"Please enable location permission"}
      onRightPress={() => Linking.openSettings()}
      rightBtnText={"Go To Settings"}
      animationType={"slide"}
    />
  );

  const renderSectionHeader = (title) => {
    return (
      <View style={searchTabsStyles.sectionHeader}>
        <Text style={searchTabsStyles.sectionHeaderText}>{t(title)}</Text>
      </View>
    );
  };

  const renderItems = (items) => {
    return items.map((item, index) => (
      <View key={index} style={searchTabsStyles.poiListCard}>
        <TouchableOpacity
          onPress={() => onIconPress(item)}
          style={searchTabsStyles.poibtns}
        >
          <Icon name={item.icon} size={15} color="#000" />
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
    {alertModal && renderAlertModal()}
  </View>
  );
};

export default POISearch;
