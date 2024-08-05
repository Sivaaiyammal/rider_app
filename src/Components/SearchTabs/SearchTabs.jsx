import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Recents from "./Recents";
import POISearch from "./POISearch";
import SavedAddress from "./SavedAddress";
import { Colors, Fonts } from "../../Constants/Contants";

import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { searchTabsStyles } from "../../Styles/SearchTabStyles";

const searchTabBtns = [
  // {
  //   id: 1,
  //   name: "Map",
  //   title: "map",
  // },
  {
    id: 2,
    name: "Recent",
    title: "recent",
    icon: <Entypo name={"back-in-time"} size={16} color={Colors.black} />,
  },
  {
    id: 3,
    name: "Saved",
    title: "saved",
    icon: <Entypo name={"star"} size={16} color={Colors.black} />,
  },
  {
    id: 4,
    name: "POI",
    title: "poi",
    icon: (
      <MaterialCommunityIcons
        name={"office-building-marker"}
        size={16}
        color={Colors.black}
      />
    ),
  },
];

const SearchTabs = () => {
  const [selectedTab, setSelectedTab] = useState(searchTabBtns[0]);

  const getTabContent = () => {
    switch (selectedTab.id) {
      case 1:
        return <></>;
      case 2:
        return <Recents />;
      case 3:
        return <SavedAddress />;
      case 4:
        return <POISearch />;
    }
  };

  return (
    <View style={searchTabsStyles.contianer}>
      <View style={searchTabsStyles.tabContianer}>
        {searchTabBtns.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                searchTabsStyles.tabBtns,
                {
                  borderBottomColor:
                    selectedTab.name === item.name ? Colors.black : "white",
                },
              ]}
              onPress={() => setSelectedTab(item)}
            >
              {item.icon}
              <Text style={searchTabsStyles.tabBtnsTxt}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {getTabContent()}
    </View>
  );
};

export default SearchTabs;
