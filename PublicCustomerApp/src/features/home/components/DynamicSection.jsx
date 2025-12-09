import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { Fonts } from "../../../constants/constants";

/* ------------------------------------------------------------------
   ASSET MAP: Service images keyed by item key
-------------------------------------------------------------------*/
const SERVICE_IMAGES = {
    auto: require("../../../assets/vehicle/AUTO.webp"),
    electric_auto: require("../../../assets/vehicle/ELECTRIC_AUTO.webp"),
    schedule_trip: require("../../../assets/vehicle/SCHDULED.webp"),
    female_driver: require("../../../assets/vehicle/FEMALE_DRIVER.webp"),
    rental_trip: require("../../../assets/vehicle/AUTO.webp"),
    default: require("../../../assets/vehicle/AUTO.webp"),
};

const getServiceImage = (serviceKey) => SERVICE_IMAGES[serviceKey] || SERVICE_IMAGES.default;

/* ------------------------------------------------------------------
   CONFIG: Per-item colors for LIGHT THEME
-------------------------------------------------------------------*/
const SECTION_CONFIG = [
    
    {
        key: "services",
        sectionTitle: "Choose Your Ride",
        showSectionTitle: false,
        items: [
            {
                key: "auto",
                label: "Auto",
                bgColor: "#f3f3f3ff",         // light yellow
                textColor: "#858585ff",
                borderColor: "#ffffffff",
            },
            {
                key: "electric_auto",
                label: "Electric Auto",
               bgColor: "#f3f3f3ff",         // light yellow
                 textColor: "#858585ff",
                borderColor: "#ffffffff",
            },
            // {
            //     key: "schedule_trip",
            //     label: "Schedule",
            //     bgColor: "#f3f3f3ff",         // light yellow
            //     textColor: "#858585ff",
            //     borderColor: "#ffffffff",
            // },
            // {
            //     key: "rental_trip",
            //     label: "Rental Trip",
            //     bgColor: "#f3f3f3ff",         // light yellow
            //     textColor: "#333333",
            //     borderColor: "#ffffffff",
            // },
            {
                key: "female_driver",
                label: "Female Driver",
                bgColor: "#f3f3f3ff",         // light yellow
                 textColor: "#858585ff",
                borderColor: "#ffffffff",
            },
        ],
    },
    // {
    //     key:"offers_banner",
    //     sectionTitle:"Offers",
    //     showSectionTitle:true,
    //     bannerURI:'https://img.freepik.com/free-photo/abstract-smooth-dark-blue-with-black-vignette-studio-well-use-as-backgroundbusiness-reportdigitalwebsite-templatebackdrop_1258-108878.jpg?semt=ais_se_enriched&w=740&q=80',  
    //     text:{
    //         title:"Special Offer",
    //         description:"Get 20% off on your first ride!",
    //         placement:"top-right",
    //         needOverlay:true,
    //     },
    //     offerCouponCode: "FIRST20",
    // },
    // {
    //     sectionTitle:"NearBy Events",
    //     showSectionTitle:true,
    //     key:"local_events",
    //     bannerURI:'https://www.publicrides.com/wp-content/uploads/2023/08/Public-Rides-Local-Events-Banner.jpg',
    //     text:{
    //         title:"Discover Local Events",
    //         description:"Explore events happening around you with Public Rides.",
    //         placement:"bottom-left",
    //         needOverlay:true,
    //     },
    //     coords: { latitude: 37.7749, longitude: -122.4194 },
    // }
   
  
];

/* ------------------------------------------------------------------
   COMPONENT
-------------------------------------------------------------------*/
const DynamicSection = ({ title = "Dynamic Section", onSelect = () => {} }) => {
    const getPlacementStyle = (placement) => {
        switch (placement) {
        case "top-left":
            return { top: 16, left: 16, alignItems: "flex-start" };
        case "top-right":
            return { top: 16, right: 16, alignItems: "flex-end" };
        case "bottom-right":
            return { bottom: 16, right: 16, alignItems: "flex-end" };
        case "center":
            return { top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" };
        case "bottom-left":
        default:
            return { bottom: 16, left: 16, alignItems: "flex-start" };
        }
    };

    const getTextAlignmentStyle = (placement) => {
        if (!placement) {
            return null;
        }
        if (placement.includes("right")) {
            return styles.bannerTextRight;
        }
        if (placement === "center") {
            return styles.bannerTextCenter;
        }
        return null;
    };

    const renderServices = (section) => (
        <View key={section.key} style={styles.section}>
            {(section.showSectionTitle !== false) ? (
                <Text style={styles.title}>{section.sectionTitle || title}</Text>
            ) : null}
            <FlatList
                data={section.items}
                keyExtractor={(item) => item.key}
                numColumns={4}
                scrollEnabled={false}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.card,
                            
                        ]}
                        activeOpacity={0.8}
                        onPress={() => onSelect(item)}
                    >
                        <View style={[
                            {
                                backgroundColor: item.bgColor || "#fff",
                                borderColor: item.borderColor || "#eee",
                                paddingHorizontal: 5,
                                paddingTop: 5,
                                borderRadius: 8,
                            },
                        ]}>
                            <Image source={getServiceImage(item.key)} style={styles.image} resizeMode="contain" />
                        </View>
                        
                        <Text style={[styles.label, { color: item.textColor || "#353535ff" }]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const handleBannerPress = (section) => {
        if (typeof section.onPress === "function") {
            section.onPress(section);
            return;
        }
        if (section.coords) {
            onSelect({ key: section.key, coords: section.coords });
            return;
        }
        onSelect({ key: section.key });
    };

    const renderBanner = (section) => (
        section?.bannerURI ? (
            <View key={section.key} style={styles.bannerSection}>
                {(section.showSectionTitle !== false) && (section.sectionTitle || section.title) ? (
                    <Text style={styles.title}>{section.sectionTitle || section.title}</Text>
                ) : null}
                <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.85} onPress={() => handleBannerPress(section)}>
                    <Image
                        source={{ uri: section.bannerURI }}
                        style={[
                            styles.bannerImage,
                            {
                                height: section.bannerHeight || 140,
                                width: "100%",
                            },
                        ]}
                        resizeMode="cover"
                    />
                    {section.text ? (
                        <View
                            style={[
                                styles.bannerTextWrapper,
                                getPlacementStyle(section.text.placement),
                                section.text.needOverlay ? { backgroundColor: "rgba(0, 0, 0, 0.55)" } : { backgroundColor: "transparent" },
                            ]}
                        >
                            {section.text.title ? (
                                <Text style={[styles.bannerTitle, getTextAlignmentStyle(section.text.placement)]}>
                                    {section.text.title}
                                </Text>
                            ) : null}
                            {section.text.description ? (
                                <Text style={[styles.bannerDescription, getTextAlignmentStyle(section.text.placement)]}>
                                    {section.text.description}
                                </Text>
                            ) : null}
                            {section.offerCouponCode ? (
                                <Text style={[styles.bannerCoupon, getTextAlignmentStyle(section.text.placement)]}>
                                    {`Use code: ${section.offerCouponCode}`}
                                </Text>
                            ) : null}
                        </View>
                    ) : null}
                </TouchableOpacity>
            </View>
        ) : null
    );

    const renderersByKey = {
        services: renderServices,
        offers_banner: renderBanner,
        local_events: renderBanner,
    };

    return (
        <View>
            {SECTION_CONFIG.map((section) => {
                const renderer = renderersByKey[section.key];
                return renderer ? renderer(section) : null;
            })}
        </View>
    );
};

/* ------------------------------------------------------------------
   STYLES
-------------------------------------------------------------------*/
const styles = StyleSheet.create({
    section: {
       
    },
    bannerSection: {
        marginVertical: 5,
    },
    title: {
        marginBottom: 12,
        marginLeft: 10,
        fontSize: 18,
        fontFamily: Fonts.medium,
        color: "#969696ff",
    },
    columnWrapper: {
        justifyContent: "space-between",

    },
    card: {
        flex: 1,
        marginHorizontal: 4,
        paddingHorizontal: 8,
        paddingVertical: 12,
       
        alignItems: "center",
    },
    image: {
        width: 64,
        height: 64,
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        textAlign: "center",
        marginTop: 4,
    },
    bannerContainer: {
        marginVertical: 10,
        paddingHorizontal: 12,
    },
    bannerImage: {
        height: 140,
        borderRadius: 8,
    },
    bannerTextWrapper: {
        marginHorizontal: 10,
        position: "absolute",
        maxWidth: "70%",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    bannerTitle: {
        fontSize: 18,
        fontFamily: Fonts.medium,
        color: "#ffffff",
        marginBottom: 4,
    },
    bannerDescription: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: "#f4f4f4",
    },
    bannerCoupon: {
        marginTop: 6,
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: "#ffe27a",
        letterSpacing: 0.5,
    },
    bannerTextRight: {
        textAlign: "right",
    },
    bannerTextCenter: {
        textAlign: "center",
    },
});

/* ------------------------------------------------------------------
   PROP TYPES
-------------------------------------------------------------------*/
DynamicSection.propTypes = {
    title: PropTypes.string,
    onSelect: PropTypes.func,
};

export default DynamicSection;
