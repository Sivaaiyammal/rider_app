import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { useStackScreenStore } from "../../Store/useStackScreen";
import SearchResult from "../SearchResult";
import GlobalContext from "../../Context/GlobalContext";

const SavedAddress = () => {
  const { savedAddress } = useContext(GlobalContext);
  const { setStackScreen } = useStackScreenStore();

  const selectedCallBack = (data) => {
    setStackScreen("TargetLocation", data);
  };

  return (
    <SearchResult
      searchTxt={""}
      search_data={savedAddress}
      selectedCallBack={selectedCallBack}
    />
  );
};

export default SavedAddress;
