import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SectionList } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors, Fonts } from '../../../constants/constants';
import { height, utils } from '../../../utils/Utils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const getPrimaryName = (item) => {
  if (!item) return '';
  if (item.primaryText) return item.primaryText;
  if (typeof item.placeName === 'string') return item.placeName;
  if (Array.isArray(item.placeName) && item.placeName.length > 0) return item.placeName[0];
  if (item.name) return item.name;
  if (Array.isArray(item.place_name) && item.place_name.length > 0) return item.place_name[0];
  return '';
};

const getCategory = (item) => {
  if (!item) return '';
  if (typeof item.category === 'string') return item.category;
  if (Array.isArray(item.category) && item.category.length > 0) return item.category[0];
  if (item.primaryCategory) return item.primaryCategory;
  return '';
};

const captitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};


const getFormattedAddress = (address) => {
  if (!address) return '';
  let finalAddress = "";
  address.forEach(addr => {
    if(addr.trim() !== ""){
      finalAddress += captitalizeFirstLetter(addr) + ", ";
    }
  });
  
  return finalAddress;
};

// Normalize incoming sections to the shape SectionList expects
const buildSections = (input) => {
  if (!Array.isArray(input) || input.length === 0) return [];
  const looksLikeSections = input.every(s => s && typeof s === 'object' && Object.prototype.hasOwnProperty.call(s, 'data'));
  if (looksLikeSections) {
    return input.map(s => ({
      ...s,
      data: Array.isArray(s.data) ? s.data : [],
    }));
  }
  // If it's a flat array of items, wrap into a single section
  return [{ title: 'results', data: input }];
};

const getIcon = (category, isFastMatch) => {
  switch(category){
    case 'hotel':
      return <Icon name="hotel" size={22} color={colors.dark} />;
    case 'airport':
      return <Icon name="local-airport" size={22} color={colors.dark} />;
    case 'railway_station':
      return <Icon name="railway_station" size={22} color={colors.dark} />;
    case 'bus station':
      return <FontAwesome name="bus" size={22} color={colors.dark} />;
    case 'hospital':
      return <FontAwesome name="hospital" size={22} color={colors.dark} />;
    case 'school':
      return <FontAwesome name="school" size={18} color={colors.dark} />;
    case 'university':
      return <Icon name="school" size={22} color={colors.dark} />;
    case 'college':
      return <Icon name="school" size={22} color={colors.dark} />;
    case 'government_office':
      return <FontAwesome name="building" size={22} color={colors.dark} />;
    case 'station':
        return <FontAwesome name="building" size={22} color={colors.dark} />;
    case 'police station':
        return <MaterialCommunityIcons name="police-badge" size={22} color={colors.dark} />;
    case 'fire station':
        return <MaterialCommunityIcons name="fire-station" size={22} color={colors.dark} />;
   
    case 'police':
        return <MaterialCommunityIcons name="police-badge" size={22} color={colors.dark} />;
    case 'restaurant':
      return <FontAwesome name="utensils" size={20} color={colors.dark} />;
    case 'fast food':
      return <FontAwesome name="utensils" size={20} color={colors.dark} />;
    case 'cafe':
      return <FontAwesome name="coffee" size={18} color={colors.dark} />;
    case 'hostel':
      return <FontAwesome name="building" size={22} color={colors.dark} />;
    case 'library':
      return <MaterialCommunityIcons name="library" size={22} color={colors.dark} />;
    case 'bar':
      return <FontAwesome name="beer" size={22} color={colors.dark} />;
    case 'night club':
      return <FontAwesome name="music" size={22} color={colors.dark} />;
    case 'parking':
      return <MaterialCommunityIcons name="parking" size={22} color={colors.dark} />;
    case 'bank':
        return <MaterialCommunityIcons name="bank" size={22} color={colors.dark} />;
    case 'shopping_mall':
      return <FontAwesome name="shopping-bag" size={22} color={colors.dark} />;
    case 'supermarket':
      return <FontAwesome name="shopping-bag" size={22} color={colors.dark} />;
    case 'grocery_store':
      return <FontAwesome name="shopping-bag" size={22} color={colors.dark} />;
    case 'department_store':
      return <FontAwesome name="shopping-bag" size={22} color={colors.dark} />;
    case 'mall':
      return <FontAwesome name="shopping-bag" size={18} color={colors.dark} />;
    case 'shopping_center':
      return <FontAwesome name="shopping-bag" size={22} color={colors.dark} />;
    case 'taxi':
      return <FontAwesome name="taxi" size={22} color={colors.dark} />;
    default:
      return <Icon name="location-on" size={22} color={isFastMatch ? colors.grey_dark : colors.dark} />;
  }
};

const formatDistanceKm = (meters) => {
  if (!meters && meters !== 0) return '';
  const km = utils.metersToKilometers(Number(meters));
  if (Number.isNaN(km)) return '';
  return `${km.toFixed(1)} km`;
};

const SearchResultContainer = ({ data, onItemPress, searchDataType }) => {
  const renderItem = ({ item}) => {
    const name = getPrimaryName(item);
    if (!name) return null;

    

    const category = getCategory(item);
    const distance = formatDistanceKm(item.distance);


    const isFastMatch = item?.sectionType === 'fast_match' || item?.stateVectorForMatches?true:false;
    
    const hasAddress = Array.isArray(item?.address) && item.address.some(addr => typeof addr === 'string' && addr.trim() !== "");
  
    return (
      <TouchableOpacity onPress={() => onItemPress?.(item)} style={styles.item}>
        <View style={styles.leftIconWrap}>
          <View style={styles.leftIconCircle}>
             {getIcon(category, isFastMatch)}
          </View>
        </View>

        <View style={styles.middleContent}>
          <Text numberOfLines={1} style={[styles.nameText, isFastMatch && {color: colors.grey_dark}]}> 
            {name}
          </Text>
          {isFastMatch && <Text style={styles.fastMatchText}>Suggestion</Text>}
          {hasAddress && <Text numberOfLines={1} style={styles.addressText}>{getFormattedAddress(item.address)}</Text>}
        </View>

        <View style={styles.rightContent}>
          {(!!category) && <Text numberOfLines={1} style={styles.categoryChip}>{category}</Text>}
          {!!distance && <Text style={styles.distanceText}>{distance}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => {
    if(title === 'full_search'){
      return null
    }
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  console.log("searchDataType",searchDataType);
  console.log("data",JSON.stringify(data));

  const sections = buildSections(data);

  if (searchDataType === 'fullSearchData' && sections.length === 0) {
    return null
  }
  return (
    <>
      {searchDataType === 'fullSearchData' ? (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${getPrimaryName(item)}-${index}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          data={Array.isArray(data) ? data : []}
          keyExtractor={(item, index) => `${getPrimaryName(item)}-${index}`}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
      <View style={styles.sectionBottom} />
    </>
  )
};

SearchResultContainer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onItemPress: PropTypes.func,
  searchDataType: PropTypes.string,
};

SearchResultContainer.defaultProps = {
  data: [],
  onItemPress: undefined,
  searchDataType: 'fullSearchData',
};

const styles = StyleSheet.create({
  listContent: {
    backgroundColor: colors.white,
    paddingBottom:height*0.3
  },
  sectionHeader: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: colors.grey_xlight,
    
  },
  sectionHeaderText: {
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: colors.black,
    paddingRight: 5,
    textTransform: 'capitalize',
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  separator: {
    height: 1,
    backgroundColor: colors.grey_xlight,
  },
  leftIconWrap: {
    padding: 10,
    marginRight: 5,
  },
  leftIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: colors.grey_light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleContent: {
    flex: 1,
    paddingRight: 10,
    gap: 3,
  },
  nameText: {
    fontSize: 16,
    fontFamily: Fonts.light,
    color: colors.font_black,
    textTransform: 'capitalize',
  },
  rightContent: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 8,
    paddingRight: 10,
  },
  categoryChip: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: colors.blue,
    backgroundColor: '#ecf6ff',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    textTransform: 'capitalize',
    maxWidth: 120,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.grey_dark,
    paddingRight: 5,
  },
  fastMatchText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: colors.grey_dark,
    paddingRight: 5,
  },
  addressText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.grey_dark,
    paddingRight: 5,
  }
  

});

export default SearchResultContainer;
