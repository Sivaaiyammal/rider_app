import { View, Text } from "react-native";
import React from "react";

const NoDataFound = (props) => {
  const { message, subText} = props;
  return (
    <View>
      <Text style={{textAlign:'center'}}>{message}</Text>
      <Text>{subText}</Text>
    </View>
  );
};

export default NoDataFound;
