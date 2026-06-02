import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import useRideBookingInfo from '../../store/useRideBookingInfo';
import AdaptiveText from '../../../../components/Common/AdaptiveText';
import { Fonts, colors, actingDriverColors } from '../../../../constants/constants';

const ActingDriverPreferences = () => {
    const { t } = useTranslation();
    const {
        actingDriverAccommodation,
        actingDriverFood,
        actingDriverKidsOnBoard,
        actingDriverElderlyOnBoard,
        actingDriverMaxSpeed,
        actingDriverNotifyEvents,
        actingDriverOtherRequests,
        updateBookingInfo,
    } = useRideBookingInfo();

    const togglePref = (key, value) => {
        updateBookingInfo({ [key]: !value });
    };

    const RequirementPill = ({ title, icon, active, onPress, isMaterial }) => {
        return (
            <TouchableOpacity
                style={[styles.pill, active && styles.pillActive]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {isMaterial ? (
                    <MaterialCommunityIcons 
                        name={icon} 
                        size={24} 
                        color={active ? '#EAB308' : '#64748B'} 
                        style={styles.pillIcon} 
                    />
                ) : (
                    <Ionicons 
                        name={icon} 
                        size={24} 
                        color={active ? '#EAB308' : '#64748B'} 
                        style={styles.pillIcon} 
                    />
                )}
                <AdaptiveText style={[styles.pillText, active && styles.pillTextActive]} numberOfLines={2}>
                    {title}
                </AdaptiveText>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Driver Arrangements Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <AdaptiveText style={styles.cardTitle}>Driver Arrangements</AdaptiveText>
                        <AdaptiveText style={styles.cardSubtitle}>For driver during the trip</AdaptiveText>
                    </View>
                    <Ionicons name="information-circle-outline" size={22} color="#888" />
                </View>

                {/* Accommodation Row */}
                <TouchableOpacity
                    style={styles.arrangementRow}
                    activeOpacity={0.8}
                    onPress={() => togglePref('actingDriverAccommodation', actingDriverAccommodation)}
                >
                    <View style={styles.checkboxContainer}>
                        {actingDriverAccommodation ? (
                            <View style={styles.checkboxChecked}>
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            </View>
                        ) : (
                            <View style={styles.checkboxUnchecked} />
                        )}
                    </View>
                    
                    <View style={styles.iconCircle}>
                        <Ionicons name="bed-outline" size={24} color="#333" />
                    </View>
                    
                    <View style={styles.arrangementText}>
                        <AdaptiveText style={styles.arrangementTitle}>Driver Accommodation</AdaptiveText>
                        <AdaptiveText style={styles.arrangementDesc}>Provide stay for driver during overnight stay</AdaptiveText>
                    </View>
                </TouchableOpacity>

                {/* Food Row */}
                <TouchableOpacity
                    style={styles.arrangementRow}
                    activeOpacity={0.8}
                    onPress={() => togglePref('actingDriverFood', actingDriverFood)}
                >
                    <View style={styles.checkboxContainer}>
                        {actingDriverFood ? (
                            <View style={styles.checkboxChecked}>
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            </View>
                        ) : (
                            <View style={styles.checkboxUnchecked} />
                        )}
                    </View>
                    
                    <View style={styles.iconCircle}>
                        <Ionicons name="restaurant-outline" size={24} color="#333" />
                    </View>
                    
                    <View style={styles.arrangementText}>
                        <AdaptiveText style={styles.arrangementTitle}>Driver Food Allowance</AdaptiveText>
                        <AdaptiveText style={styles.arrangementDesc}>Provide food/allowance for driver during the trip</AdaptiveText>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Special Requirements Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <AdaptiveText style={styles.cardTitle}>Special Requirements</AdaptiveText>
                        <AdaptiveText style={styles.cardSubtitle}>Select if applicable</AdaptiveText>
                    </View>
                </View>

                <View style={styles.pillsContainer}>
                    <RequirementPill 
                        title="Children on Board" 
                        icon="baby-carriage" 
                        isMaterial
                        active={actingDriverKidsOnBoard}
                        onPress={() => togglePref('actingDriverKidsOnBoard', actingDriverKidsOnBoard)}
                    />
                    <RequirementPill 
                        title="Elderly Passengers" 
                        icon="heart-outline" 
                        active={actingDriverElderlyOnBoard}
                        onPress={() => togglePref('actingDriverElderlyOnBoard', actingDriverElderlyOnBoard)}
                    />
                    <View style={[styles.pill, actingDriverMaxSpeed && styles.pillActive]}>
                        <Ionicons 
                            name="speedometer-outline" 
                            size={24} 
                            color={actingDriverMaxSpeed ? '#EAB308' : '#64748B'} 
                            style={styles.pillIcon} 
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <TextInput
                                style={[styles.pillText, actingDriverMaxSpeed && styles.pillTextActive, { padding: 0, margin: 0, minWidth: 20, textAlign: 'center', fontSize: 14 }]}
                                value={actingDriverMaxSpeed ? String(actingDriverMaxSpeed) : ''}
                                onChangeText={(text) => updateBookingInfo({ actingDriverMaxSpeed: text.replace(/[^0-9]/g, '') })}
                                placeholder="80"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                maxLength={3}
                            />
                            <AdaptiveText style={[styles.pillText, actingDriverMaxSpeed && styles.pillTextActive, { marginLeft: 2 }]}>km/h</AdaptiveText>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingBottom: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginTop: 8,
    },
    card: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: '#1E293B',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: '#64748B',
    },
    arrangementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkboxContainer: {
        marginRight: 12,
    },
    checkboxUnchecked: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        borderRadius: 6,
    },
    checkboxChecked: {
        width: 22,
        height: 22,
        backgroundColor: '#EAB308',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    arrangementText: {
        flex: 1,
    },
    arrangementTitle: {
        fontSize: 14,
        fontFamily: Fonts.semi_bold,
        color: '#1E293B',
        marginBottom: 2,
    },
    arrangementDesc: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: '#64748B',
        lineHeight: 16,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    pill: {
        width: '31%',
        aspectRatio: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 8,
        backgroundColor: '#FFFFFF',
    },
    pillActive: {
        borderColor: '#FEF08A',
        backgroundColor: '#FEF9C3',
    },
    pillIcon: {
        marginBottom: 8,
    },
    pillText: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: '#64748B',
        textAlign: 'center',
    },
    pillTextActive: {
        color: '#1E293B',
        fontFamily: Fonts.bold,
    },
});

export default ActingDriverPreferences;
