import React, { useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { utils } from "../../../utils/Utils";
import { colors, Fonts } from "../../../constants/constants";
import { clearAllStateVectors } from '../../../components/Native/NESearch';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const transformData = (data) => {
    console.log("transformData called with:", JSON.stringify(data, null, 2));
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log("transformData: data is empty or null");
      return [];
    }
    
    // Additional safety check for non-object data
    if (typeof data !== 'object' || data === null) {
      console.log("transformData: data is not an object");
      return [];
    }
    // Define the desired order of sections
    const sectionOrder = ["fast_match", "full_search", "state", "city", "district", "area", "street"];
    
    // If data is an array (unified search), return a single section
    if (Array.isArray(data)) {
      const transformedItems = data.map(item => {
        let transformedItem = {};
        if (item.sectionType === 'fast_match') {
          transformedItem = {
            primaryText: item.placeName?.[0],
            primaryCategory: item.category?.[0],
            secondaryText: item.address?.[0],
            secondaryCategory: item.category?.[1],
            stateVectorForMatches: item.stateVectorForMatches,
            sectionType: 'fast_match'
          };
        } else if (item.sectionType === 'state') {
          transformedItem = {
            name: item.name?.[0],
            distance: item.distance,
            longitude: item.pos?.[1],
            latitude: item.pos?.[0],
            address: item.address?.filter(addr => addr?.trim()).join(', '),
            sectionType: 'state',
            score: item.score,
            country: item.address?.filter(addr => addr?.trim()).pop() || '',
            stateName: item.name?.[0] || ''
          };
        } else if (item.sectionType === 'city') {
          transformedItem = {
            name: item.name?.[0],
            distance: item.distance,
            longitude: item.pos?.[1],
            latitude: item.pos?.[0],
            address: item.address?.filter(addr => addr?.trim()).join(', '),
            sectionType: 'city',
            score: item.score,
            country: item.address?.filter(addr => addr?.trim()).pop() || '',
            stateName: item.address?.filter(addr => addr?.trim()).slice(-2, -1)[0] || ''
          };
        } else if (item.sectionType === 'street') {
          transformedItem = {
            name: item.name?.[0],
            distance: item.distance,
            longitude: item.pos?.[1],
            latitude: item.pos?.[0],
            address: item.address?.filter(addr => addr?.trim()).join(', '),
            sectionType: 'street',
            score: item.score,
            tsrwscore: item.tsrwscore,
            nearbyStreets: item.nearbyStreets || []
          };
        } else if (item.sectionType === 'area') {
          transformedItem = {
            name: item.name?.[0],
            distance: item.distance,
            longitude: item.pos?.[1],
            latitude: item.pos?.[0],
            address: item.address?.filter(addr => addr?.trim()).join(', '),
            sectionType: 'area',
            score: item.score,
            nearbyStreets: item.nearbyStreets || []
          };
        } else if (item.sectionType === 'district') {
          transformedItem = {
            name: item.name?.[0],
            distance: item.distance,
            longitude: item.pos?.[1],
            latitude: item.pos?.[0],
            address: item.address?.filter(addr => addr?.trim()).join(', '),
            sectionType: 'district',
            score: item.score
          };
        } else {
          transformedItem = {
            name: item.placeName?.[0],
            distance: item.distance,
              longitude: item.pos?.[1],
            latitude: item.pos?.[0],
            address: item.address?.filter(addr => addr?.trim()).join(', '),
            houseNumber: item.houseNumber,
            category: item.category,
            sectionType: item.sectionType,
            score: item.score
          };
        }
        return transformedItem;
      });

      return [{
        title: "Search Results",
        data: transformedItems
      }];
    }

    // For regular search data, group by section type
    const groupedData = {};
    console.log("Processing grouped data, keys:", Object.keys(data));
    Object.entries(data)
      .filter(([key, value]) => key !== "matchedStrings" && value && Array.isArray(value) && value.length > 0)
      .forEach(([key, value]) => {
        console.log(`Processing key: ${key}, value length: ${value.length}`);
        groupedData[key] = value.map((item) => {
                     if (key === "fullSearch") {
             return {
               name: item.place_name?.[0],
               place_name: item.place_name, // Keep original for compatibility
               distance: item.distance,
               longitude: item.longitude,
               latitude: item.latitude,
               address: item.address,
               houseNumber: item.houseNumber,
               category: item.category,
               score: item.score,
               sectionType: 'full_search',
               nearbyStreets: item.nearbyStreets || []
             };
           }
          return {
            ...item,
            nearbyStreets: item.nearbyStreets || []
          };
        });
      });
    
    console.log("Grouped data keys:", Object.keys(groupedData));

    // Convert the grouped data into sections
    const sections = Object.entries(groupedData)
      .filter(([, value]) => value && Array.isArray(value) && value.length > 0)
      .map(([key, value]) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        data: value,
      }));

    console.log("Created sections:", sections.map(s => ({ title: s.title, dataLength: s.data.length })));

    // Sort the sections based on the desired order
    const sortedSections = sections.sort(
      (a, b) => sectionOrder.indexOf(a.title.toLowerCase()) - sectionOrder.indexOf(b.title.toLowerCase())
    );
    
    console.log("Final sorted sections:", sortedSections.map(s => ({ title: s.title, dataLength: s.data.length })));
    return sortedSections;
};

export const SearchResultV2 = (props) => {
    const MAX_ITEMS_TO_SHOW = 5;
    const { searchTxt, search_data, selectedCallBack, setStateVector } = props;
    
    console.log("SearchResultV2 received search_data:", JSON.stringify(search_data, null, 2));
    
    let sections = [];
    if (search_data?.unifiedSearchData?.unifiedSearchData) {
        console.log("Processing unifiedSearchData");
        sections = transformData(search_data.unifiedSearchData.unifiedSearchData);
    } else if (search_data?.searchData && typeof search_data.searchData === 'object' && Object.keys(search_data.searchData).length > 0) {
        console.log("Processing searchData:", search_data.searchData);
        if (typeof search_data.searchData === 'object' && !Array.isArray(search_data.searchData)) {
          console.log("Processing object searchData");
            sections = transformData(search_data.searchData);
        } else if (Array.isArray(search_data.searchData)) {
          console.log("Processing array searchData");
            sections = transformData(search_data.searchData);
        }
    } else if (search_data && typeof search_data === 'object' && Object.keys(search_data).length > 0) {
        // Handle case where search_data itself contains the search results
        console.log("Processing search_data directly");
        sections = transformData(search_data);
    }
    
    console.log("Final sections:", sections);
    console.log("Sections length:", sections.length);
    if (sections.length > 0) {
        console.log("First section data length:", sections[0].data?.length);
    }

    const [expandedSections, setExpandedSections] = useState({});

    const toggleSectionExpand = (sectionTitle) => {
        setExpandedSections((prev) => ({
          ...prev,
          [sectionTitle]: !prev[sectionTitle],
        }));
    };
    
    const onSelectItem = (item, title) => {
        if (title === "FastMatch" || item.sectionType === "fast_match") {
            selectedCallBack(item, 'FastMatch');
            if (search_data?.searchData?.matchedStrings) {
                setStateVector(search_data.searchData.matchedStrings);
            }
        } else {
            clearAllStateVectors();
            const newItem = {
                name: item.name,
                longitude: item.latitude,
                latitude: item.longitude,
                distance: item.distance,
                address: item.address,
            };
            selectedCallBack(newItem, title);
        }
    };

    const highlightText = (text, highlight) => {
        if (!highlight.trim()) {
          return <Text style={styles.itemText}>{text}</Text>;
        }
      
        const safeText = text ? String(text) : "";
      
        const regex = new RegExp(`(${highlight})`, "gi");
        const parts = safeText.split(regex);
      
        return (
          <Text style={styles.itemText}>
            {parts.map((part, index) =>
              part.toLowerCase() === highlight.toLowerCase() ? (
                <Text key={index} style={styles.highlightText}>
                  {part}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        );
    };

    const renderItem = ({ item, section: { title } }) => {
        console.log("Rendering item:", { name: item?.name, placeName: item?.placeName, place_name: item?.place_name, title });
        // If item is empty or missing main display fields, do not render
        if (!item || (
            !item.name && !item.placeName && !item.primaryText && !item.houseNumber && (!item.place_name || !Array.isArray(item.place_name) || item.place_name.length === 0)
        )) {
            console.log("Skipping item due to missing display fields:", item);
            return null;
        }
        const formatAddress = (address, nearbyStreets, sectionType) => {
          if (!address) return '';
          let addressParts = [];
          
          // Add first nearby street if available
          if (nearbyStreets && Array.isArray(nearbyStreets) && nearbyStreets.length > 0) {
            const firstStreet = nearbyStreets[0];
            addressParts.push(firstStreet.streetName);
          }

          // Add regular address parts
          if (Array.isArray(address)) {
            if (sectionType === 'state') {
              // For state, show only country
              const country = address.filter(addr => addr?.trim()).pop();
              if (country) {
                addressParts.push(country);
              }
            } else {
              addressParts = [...addressParts, ...address.filter(addr => addr?.trim())];
            }
          } else {
            addressParts.push(address.toString());
          }

          return addressParts.join(', ');
        };

        const getSectionTypeDisplay = (sectionType) => {
          switch(sectionType) {
            case 'street':
              return 'Street';
            case 'area':
              return 'Area';
            case 'district':
              return 'District';
            case 'state':
              return 'State';
            case 'country':
              return 'Country';
            case 'city':
              return 'City';
            default:
              return '';
          }
        };

        return (
          <TouchableOpacity
            onPress={() => onSelectItem(item, title)}
            style={styles.item}
          >
            {item.houseNumber && !item?.placeName ? (
               <View style={{ width: "80%" }}>
                 <Text style={[styles.itemText]}>
                    {highlightText(item.houseNumber || '', searchTxt)}{','}{highlightText(formatAddress(item.address, item.nearbyStreets, item.sectionType), searchTxt)}
                  </Text> 
               </View>
            ) : (
              <View style={{ width: "80%" }}>
              {title === "FastMatch" || item.sectionType === "fast_match" ? (
                item.secondaryText ? (
                  <>
                  <Text style={[styles.itemText]}>
                    {highlightText(item.primaryText || item.placeName?.[0] || '', searchTxt)}
                  </Text> 
                  <Text style={[styles.itemText]}>{item.primaryCategory || item.category?.[0] || ''}</Text>
                  <View style={styles.secondaryItemView}>
                    <MaterialIcons
                      name="subdirectory-arrow-right"
                      size={22}
                      color={colors.font_black}
                    />
                    <Text style={[styles.itemText]}>
                      {highlightText(item.secondaryText || '', searchTxt)}
                    </Text>
                  </View>
                </>
                ) : (
                  <>
                   <Text style={[styles.itemText]}>
                    {highlightText(item.primaryText || item.placeName?.[0] || '', searchTxt)}
                  </Text>
                  <View style={styles.secondaryItemView}>
                  <MaterialIcons
                      name="subdirectory-arrow-right"
                      size={22}
                      color={colors.font_black}
                    />
                  <Text style={[styles.itemText]}>{item.primaryCategory || item.category?.[0] || ''}</Text>
                  </View>
                  </>
                )
                             ) : (
                 <>
                   <Text style={[styles.itemText]}>
                     {highlightText((item.name || item.placeName?.[0] || item.place_name?.[0] || '').toString(), searchTxt)}
                   </Text>
                   {item.address ? (
                     <Text style={styles.itemSubText}>{formatAddress(item.address, item.nearbyStreets, item.sectionType)}</Text>
                   ) : null}
                 </>
               )}
            </View>
            )}
           
            <View
              style={{
                width: "20%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={styles.rightContent}>
                {item.category ? (
                  <Text style={styles.categoryText}>{item.category[0]}</Text>
                ) : item.sectionType && title !== "Full_search" && title !== "Fast_match" && (
                  <Text style={styles.categoryText}>{getSectionTypeDisplay(item.sectionType)}</Text>
                )}
                {item.distance ? (
                  <Text style={styles.itemSubText}>
                    {utils.metersToKilometers(item.distance).toFixed(2)} km
                  </Text>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        );
    };
    
    const renderSectionFooter = ({ section: { title, data } }) => {
        const isExpanded = expandedSections[title];
        return data.length < 5 ? null : (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => toggleSectionExpand(title)}
          >
            <Text style={styles.showMoreButtonText}>
              {isExpanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        );
    };

    console.log("Rendering SectionList with sections:", sections.length);
    return (
        <SectionList
        stickySectionHeadersEnabled
        keyExtractor={(item, index) => `${item?.name || item?.place_name?.[0] || 'item'}-${index}`}
        sections={sections.map((section) => {
          const isExpanded = expandedSections[section.title];
          const sectionData = isExpanded
            ? section?.data
            : section?.data?.slice(0, MAX_ITEMS_TO_SHOW);
          console.log(`Section "${section.title}" has ${sectionData?.length || 0} items`);
          return {
            ...section,
            data: sectionData,
          };
        })}
        renderItem={renderItem}
        renderSectionFooter={renderSectionFooter}
        // renderSectionHeader={({ section: { title } }) => (
          // <View style={styles.sectionHeader}>
          //   <Text style={styles.sectionHeaderText}>{title}</Text>
          // </View>
        // )}
      />
    );
};

SearchResultV2.propTypes = {
    searchTxt: PropTypes.string,
    search_data: PropTypes.shape({
        unifiedSearchData: PropTypes.shape({
            unifiedSearchData: PropTypes.oneOfType([
                PropTypes.array,
                PropTypes.object
            ])
        }),
        searchData: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object
        ])
    }),
    selectedCallBack: PropTypes.func.isRequired,
    setStateVector: PropTypes.func.isRequired
};

SearchResultV2.defaultProps = {
    searchTxt: '',
    search_data: {
        unifiedSearchData: {
            unifiedSearchData: []
        },
        searchData: {}
    }
};

const styles = 
    StyleSheet.create({
      sectionHeader: {
        backgroundColor: colors.grey_xlight,
        padding: 10,
        paddingHorizontal:20
      },
      sectionHeaderText: {
        fontFamily: Fonts.bold,
        fontSize: 16,
        color: colors.font_black,
      },
      item: {
        padding: 10,
        paddingHorizontal:20,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        flexDirection: "row",
        width: "100%",
      },
      itemText: {
        fontSize: 17,
        fontFamily: Fonts.light,
        color: colors.font_black,
      },
      highlightText: {
        fontFamily: Fonts.medium,
        fontSize: 18,
      },
      itemSubText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: colors.grey_dark,
      },
      showMoreButton: {
        alignItems: "center",
        paddingVertical: 15,
      },
      showMoreButtonText: {
        fontFamily: Fonts.medium,
          color: colors.font_black,
        fontSize: 18,
      },
      secondaryItemView: {
        flexDirection: "row",
        paddingVertical: 10,
        left: 10,
      },
      nearbyStreetsContainer: {
        marginTop: 5,
        paddingLeft: 5,
      },
      nearbyStreetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
      },
      nearbyStreetText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: colors.grey_dark,
        marginLeft: 5,
      },
      rightContent: {
        alignItems: 'flex-end',
        justifyContent: 'center',
      },
      categoryText: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: colors.font_black,
        marginBottom: 2,
        textTransform: 'capitalize',
      },
      firstStreetText: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: colors.font_black,
        marginTop: 2,
      },
    });
