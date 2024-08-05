import { StyleSheet, Text, View } from "react-native";
import React from "react";
import useLocationStore from "../../Store/useLocationStore";
import { useStackScreenStore } from "../../Store/useStackScreen";
import SearchResult from "../SearchResult";

const SavedAddress = () => {
  const { savedLocation } = useLocationStore();
  const { setStackScreen } = useStackScreenStore();

  const selectedCallBack = (data) => {
    setStackScreen("TargetLocation", data);
  };

  return (
    <SearchResult
      searchTxt={""}
      search_data={savedLocation}
      selectedCallBack={selectedCallBack}
    />
  );
};

export default SavedAddress;
