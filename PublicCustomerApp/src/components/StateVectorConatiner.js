import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Entypo from "react-native-vector-icons/Entypo";
import useMapStore from "../store/useMapStore";
import { colors, Fonts } from "../constants/constants";


const StateVectorConatiner = (props) => {
  const { stateVector, setStateVector } = useMapStore();
  const { stateVectorArr, removeStateVecotr } = props;

  const onVectorPress = (item, index) => {
    // console.log('hari-->>item-->>', item, index)
    // const updatedStateVector = { ...stateVector };
    // updatedStateVector[key].splice(index, 1);
    // if (updatedStateVector[key].length === 0) {
    //   delete updatedStateVector[key];
    // }
    // setStateVector(updatedStateVector);
    removeStateVecotr(item);
  };

  const stateVectorArray = stateVectorArr?.searchData?.matchedStrings.filter((item) => item.key !== "");

  return stateVectorArray ? (
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
  // return stateVector ? (
  // <View style={styles.vectorContainer}>

  //       {Object.entries(stateVector).map(([key, values]) => (
  //       values?.map((value, index) => (
  //         <View key={index} style={styles.stateBtn}>
  //           <Text style={styles.stateText}>{value[1]}</Text>
  //           <TouchableOpacity key={key} onPress={()=>onVectorPress(key, index)}>
  //           <Entypo name="cross" size={22} color={'black'}/>
  //           </TouchableOpacity>
  //         </View>
  //       ))
  //   ))}
  // </View>
  // ) : null;
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
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: colors.grey_xlight,
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
