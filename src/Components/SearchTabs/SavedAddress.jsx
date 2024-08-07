import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { useStackScreenStore } from "../../Store/useStackScreen";
import SearchResult from "../SearchResult";
import GlobalContext from "../../Context/GlobalContext";
import NoDataFound from "../NoDataFound";

const SavedAddress = () => {
  const { savedAddress } = useContext(GlobalContext);
  const { setStackScreen } = useStackScreenStore();

  const selectedCallBack = (data) => {
    setStackScreen("TargetLocation", data);
  };

  return savedAddress.length === 0 ? (
    <View style={{flex:1,alignItems:'center', justifyContent:'center'}}>
    <NoDataFound message={"No Data Found"} />
    </View>
  ) : (
    <SearchResult
      searchTxt={""}
      search_data={savedAddress}
      selectedCallBack={selectedCallBack}
    />
  );
};

export default SavedAddress;
