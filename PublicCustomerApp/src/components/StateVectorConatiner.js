import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Entypo from "react-native-vector-icons/Entypo";
import PropTypes from 'prop-types';

import { colors, Fonts } from "../constants/constants";


const StateVectorConatiner = ({ 
  stateVectorArr = {
    searchData: {
      matchedStrings: []
    }
  }, 
  removeStateVector 
}) => {

  const onVectorPress = (item) => {
    removeStateVector(item);
  };

  const stateVectorArray = stateVectorArr?.searchData?.matchedStrings?.filter((item) => item?.key !== "") || [];

  return stateVectorArray.length > 0 ? (
    <View style={styles.vectorContainer}>
      {stateVectorArray.map((item, index) =>
          <View key={index} style={styles.stateBtn}>
          <Text style={styles.stateText}>{item.text.charAt(0).toUpperCase() + item.text.slice(1)}</Text>
          <TouchableOpacity
            onPress={() => onVectorPress(item, index)}
          >
            <Entypo name="cross" size={22} style={styles.crossIcon} color={"black"} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  ) : null;
 
};

StateVectorConatiner.propTypes = {
  stateVectorArr: PropTypes.shape({
    searchData: PropTypes.shape({
      matchedStrings: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        text: PropTypes.string
      }))
    })
  }),
  removeStateVector: PropTypes.func.isRequired
};

export default StateVectorConatiner;

const styles = StyleSheet.create({
  vectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "90%",
    alignSelf: "center",
    paddingVertical:5,
    
  },
  stateBtn: {
    flexDirection: "row",
    margin: 2,
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.primary,
    gap: 10,
  },
  stateText: {
    fontFamily: Fonts.regular,
    padding:3,
    paddingRight:0,
        color: colors.black,
  },
  crossIcon: {
    padding:2,
    paddingLeft:0
  }
});
