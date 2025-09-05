import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Dimensions, useColorScheme, Appearance } from "react-native";

import BackArrow from '../../assets/image/backArrow.svg';
import ProfileImage from '../../assets/image/account/Profile.webp';

import { Colors } from 'react-native/Libraries/NewAppScreen'
import { styles } from '../../styles/Account/account'
import { lightThemeStyles, darkThemeStyles } from '../../styles/ColorSet'
import { Fonts } from '../../constants/constants';

const MyAccountProfileImage = (props) => {

    const { id, name, ratingData } = props

    const ColorSet = Appearance.getColorScheme() === 'light' ? lightThemeStyles : lightThemeStyles;


    return (
        <>
            <View style={[styles.container, { zIndex: 100 }]}>
                <View style={styles.profileImgContainer}>
                    <Image style={styles.profileImg} source={ProfileImage} />
                </View>
            </View>
            <View style={[styles.container, { borderTopLeftRadius: 10, borderTopRightRadius: 10 ,paddingBottom:20}]}>

                <Text style={{ fontSize: 24, fontFamily:Fonts.semi_bold, color: ColorSet.black, marginTop: 60 }}>{name}</Text>
                {/* <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6c63ff' }}>{id}</Text> */}
                
                {/* Rating Display */}
                {ratingData && (
                    <View style={styles.ratingContainer}>
                        <View style={styles.starContainer}>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const rating = ratingData.currentrating;
                                const filledStars = Math.floor(rating);
                                const hasPartialStar = rating % 1 !== 0;
                                const partialStarIndex = filledStars + 1;
                                
                                if (star <= filledStars) {
                                    // Fully filled star
                                    return (
                                        <Text 
                                            key={star} 
                                            style={[styles.star, { color: '#FFD700' }]}
                                        >
                                            ★
                                        </Text>
                                    );
                                } else if (star === partialStarIndex && hasPartialStar) {
                                    // Partially filled star
                                    const partialFill = rating % 1;
                                    return (
                                        <View key={star} style={styles.partialStarContainer}>
                                            <Text style={[styles.star, { color: '#E0E0E0' }]}>★</Text>
                                            <View style={[
                                                styles.partialStarFill, 
                                                { width: `${partialFill * 100}%` }
                                            ]}>
                                                <Text style={[styles.star, { color: '#FFD700' }]}>★</Text>
                                            </View>
                                        </View>
                                    );
                                } else {
                                    // Empty star
                                    return (
                                        <Text 
                                            key={star} 
                                            style={[styles.star, { color: '#E0E0E0' }]}
                                        >
                                            ★
                                        </Text>
                                    );
                                }
                            })}
                        </View>
                        <Text style={styles.ratingText}>
                            {ratingData.currentrating.toFixed(1)} ({ratingData.count} reviews)
                        </Text>
                    </View>
                )}
            </View>
        </>
    )
}

export default MyAccountProfileImage;