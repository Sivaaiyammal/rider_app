/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import EvilIcons from "react-native-vector-icons/EvilIcons";

import { OnBoradingStyles } from "../Styles/OnBoradingStyles";
import { onBoardingSlides } from "../Constants/JsonData";
import { WIDTH } from "../Constants";
import { Colors } from "../Constants/Contants";
import { DataStore } from "../Constants/DataStore";
import { CommonActions, useNavigation } from "@react-navigation/native";

const Slide = ({ data }) => {
  return (
    <View style={OnBoradingStyles.slide}>
      <Text style={OnBoradingStyles.slideTitle}>{data.title}</Text>
      <View style={[OnBoradingStyles.slideImageContainer]}>{data.image}</View>
      <Text style={OnBoradingStyles.slideSubtitle}>{data.content}</Text>
    </View>
  );
};

function Pagination({ index, length }) {
  const currentIndex = index + 1;
  return (
    <View style={OnBoradingStyles.pagination}>
      {onBoardingSlides.map((item, id) => (
        <View
          key={id}
          style={[
            OnBoradingStyles.paginationSliderInactive,
            {
              backgroundColor:
                currentIndex === item.id ? Colors.blue : Colors.grey,
            },
          ]}
        ></View>
      ))}
    </View>
  );
}

export default function OnboardingScreen() {

  const navigation = useNavigation()
  const totalSlides = onBoardingSlides.length;
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  const flatListRef = useRef(null);

  indexRef.current = index;

  const handleDone = () => {
    DataStore.storeData('onBoarding', 'onBoardingDone')
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      })
    );
  }

  const handleNext = useCallback((isNext, isDone) => {
    if (isDone) {
      handleDone();
      return;
    }
  
    if (isNext) {
      const nextIndex = index + 1;
      if (nextIndex < totalSlides) {
        flatListRef.current.scrollToIndex({ index: nextIndex });
      }
    } else {
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        flatListRef.current.scrollToIndex({ index: prevIndex });
      }
    }
  }, [index, totalSlides]);

  const onScroll = useCallback((event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const scroll_index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(scroll_index);

    const distance = Math.abs(roundIndex - scroll_index);

    const isNoMansLand = distance > 0.4;

    if (roundIndex !== indexRef.current && !isNoMansLand) {
      setIndex(roundIndex);
    }
  }, []);

  const renderItem = useCallback(function renderItem({ item }) {
    return <Slide data={item} />;
  }, []);

  return (
    <View style={OnBoradingStyles.onboardContainer}>
      <FlatList
        ref={flatListRef}
        data={onBoardingSlides}
        style={OnBoradingStyles.carousel}
        renderItem={renderItem}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        initialNumToRender={3}
        maxToRenderPerBatch={1}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        windowSize={1}
        keyExtractor={useCallback((s) => String(s.id), [])}
        getItemLayout={useCallback(
          (_, ind) => ({
            ind,
            length: WIDTH,
            offset: ind * WIDTH,
          }),
          []
        )}
      />
      <View style={OnBoradingStyles.bottomView}>
        <TouchableOpacity style={OnBoradingStyles.bottomViewSkipBtn}
        onPress={() => handleNext(false, index === 0)}>
          {index === 0 ? (
            <Text style={OnBoradingStyles.bottomViewSkip}>Skip</Text>
          ) : (
            <EvilIcons name={"chevron-left"} color={Colors.black} size={24} />
          )}
        </TouchableOpacity>
        <Pagination index={index} length={onBoardingSlides.length} />
        <TouchableOpacity
          style={OnBoradingStyles.bottomViewSkipBtn}
          onPress={() => handleNext(true, index === onBoardingSlides.length - 1)}
        >
          {index === onBoardingSlides.length - 1 ? (
            <Text style={OnBoradingStyles.bottomViewSkip}>Get Started</Text>
          ) : (
            <EvilIcons name={"chevron-right"} color={Colors.black} size={24} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
