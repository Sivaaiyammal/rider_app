/* eslint-disable camelcase */
import React, {useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {FlatList, View, Text, TouchableOpacity} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {onBoardingSlides} from '../constants/JsonData';
import {onBoardingStyles} from '../styles/SplashStyles';
import {width} from '../utils/Utils';
import {DataStore} from '../controllers/DataStore';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../constants/constants';

const Slide = ({data}) => {
  return (
    <View style={onBoardingStyles.slide}>
      <View style={[onBoardingStyles.slideImageContainer]}>{data.image}</View>
      <Text style={onBoardingStyles.slideTitle}>{data.title}</Text>
      <View style={onBoardingStyles.yellowSeperator} />
      <Text style={onBoardingStyles.slideSubtitle}>{data.description}</Text>
      <Text style={onBoardingStyles.slideSubtitle}>{data?.note}</Text>
    </View>
  );
};

Slide.propTypes = {
  data: PropTypes.object,
};

function Pagination({index, item}) {
  return (
    <View style={onBoardingStyles.pagination} pointerEvents="none">
      {item?.map((_, id) => (
        <View
          key={id}
          style={{
            backgroundColor: index === id ? colors.yellow : colors.grey,
            borderRadius: 50,
            width:index === id ? 20 : 10,
            height:10
          }}
        />
      ))}
    </View>
  );
}

Pagination.propTypes = {
  index: PropTypes.number,
  item:PropTypes.array
};

export default function OnBoardingScreen() {
  const navigation = useNavigation();
  const totalSlides = onBoardingSlides.length;
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  const flatListRef = useRef(null);

  indexRef.current = index;

  const handleDone = useCallback(() => {
    DataStore.storeData('onBoarding', 'onBoardingDone');
    navigation.navigate('ThingsToKnow');
  }, [navigation]);



  const handleNext = useCallback(() => {
    const nextIndex = index + 1;
    if (nextIndex < totalSlides) {
      flatListRef.current.scrollToIndex({index: nextIndex});
    }
    if (nextIndex === totalSlides) {
      handleDone();
    }
  }, [index, totalSlides, handleDone]);

  const onScroll = useCallback(event => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const scroll_index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(scroll_index);

    const distance = Math.abs(roundIndex - scroll_index);

    const isNoMansLand = distance > 0.4;

    if (roundIndex !== indexRef.current && !isNoMansLand) {
      setIndex(roundIndex);
    }
  }, []);

  const renderItem = useCallback(function renderItem({item}) {
    return <Slide data={item} />;
  }, []);

  return (
    <View style={onBoardingStyles.onboardContainer}>
      {/* <TouchableOpacity style={onBoardingStyles.backBtn}>
        <Ionicons name="chevron-back" size={20} color={colors.black} />
      </TouchableOpacity> */}
      <FlatList
        ref={flatListRef}
        data={onBoardingSlides}
        style={onBoardingStyles.carousel}
        contentContainerStyle={{alignItems: 'center'}}
        renderItem={renderItem}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        initialNumToRender={4}
        maxToRenderPerBatch={1}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        windowSize={1}
        keyExtractor={useCallback(s => String(s.id), [])}
        getItemLayout={useCallback(
          (_, ind) => ({
            ind,
            length: width,
            offset: ind * width,
          }),
          [],
        )}
      />
      <Pagination index={index} item={onBoardingSlides} />
      <View style={onBoardingStyles.bottomBtns}>
        <TouchableOpacity
          style={[onBoardingStyles.nextBtn, {backgroundColor: colors.white}]}
          onPress={() => handleDone()}>
          <Text style={[onBoardingStyles.nextText, {color: colors.black}]}>
            Skip
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={onBoardingStyles.nextBtn}
          onPress={() => handleNext()}>
          <Text testID="next" style={onBoardingStyles.nextText}>
            Next
          </Text>
          <AntDesign name="arrowright" color={colors.white} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
