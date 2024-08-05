import { Text, View } from "react-native";
import React from "react";
import { searchTabsStyles } from "../../Styles/SearchTabStyles";
import NoDataFound from "../NoDataFound";

const Recents = () => {
  return (
    <View style={searchTabsStyles.components}>
      <NoDataFound message={'Recents Not Found'}/>
    </View>
  );
};

export default Recents;
