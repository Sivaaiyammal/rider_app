import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useStackScreenStore } from '../../common/store/useStackScreenStore'
import FullScreenLoader from '../../common/loaders/FullScreenLoader'
import usePublicDriverStore from '../store/usePublicDriverStore'
import useUserStore from '../../common/store/useUserStore'
import APIRequest from '../../common/APIRequest'
import { showNotification } from '../../common/components/Alerts/showNotification'
import { Colors, Fonts } from '../../common/constants/constants'
import { moderateScale, scale, verticalScale } from '../../common/utils/scalingutils'
import { useTranslation } from 'react-i18next'

const VehicleDetails = () => {
    const {t} = useTranslation()
    const { vehicleInfo, setVehicleInfo } = usePublicDriverStore()
    const { userInfo } = useUserStore()
    const {setStackScreen} = useStackScreenStore()
    const [loading, setLoading] = useState(false)
    
    const handleLogout = async () => {
        setLoading(true)
        const url = `/publicrides/driver/logoutFromVehicle`
        const api = new APIRequest()

        try {
            const response = await api.request(
                url,
                'POST',
                {},
                userInfo?.token,
            )
            if (response.success) {
                showNotification(
                    response?.message || 'Logged out from vehicle',
                    t('pls_try_later'),
                    'success',
                )
                // todo : remove from local storage userInfo
                setVehicleInfo(null)
                setStackScreen('DriverAskVehicle')
            } else {
                showNotification(
                    response?.message || 'Failed to logout from vehicle',
                    t('pls_try_later'),
                    'danger',
                )
            }
        } catch (error) {
            console.log(error, 'Error logging out')
            showNotification(
                error?.message || 'Network request failed',
                t('pls_try_later'),
                'danger',
            )
        }
        setLoading(false)
    }

    const vehicleDetails = [
        {
            label: 'Vehicle Type',
            value: vehicleInfo?.type || 'Not Available',
            // icon: <VehicleDetailsIcon width={20} height={20} />
        },
        {
            label: 'Make',
            value: vehicleInfo?.make || 'Not Available',
            // icon: <CarIcon width={20} height={20} />
        },
        {
            label: 'Model',
            value: vehicleInfo?.model || 'Not Available',
            // icon: <CarIcon width={20} height={20} />
        },
        {
            label: 'Color',
            value: vehicleInfo?.color || 'Not Available',
            // icon: <CarIcon width={20} height={20} />
        },
        {
            label: 'Year',
            value: vehicleInfo?.year || 'Not Available',
            // icon: <CarIcon width={20} height={20} />
        },
        {
            label: 'Registration Number',
            value: vehicleInfo?.regNo || 'Not Available',
            // icon: <CarIcon width={20} height={20} />
        }
    ]

    return (
        <View style={styles.container}>
            {loading && <FullScreenLoader />}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('vehicle_information')}</Text>
                    <Text style={styles.headerSubtitle}>{t('logged_in_vehicle_details')}</Text>
                </View>

                {/* Vehicle Details Card */}
                <View style={styles.detailsCard}>
                    {vehicleDetails.map((detail, index) => (
                        <View key={index} style={styles.detailRow}>
                            <View style={styles.detailLeft}>
                                <View style={styles.iconContainer}>
                                    {/* {detail.icon} */}
                                </View>
                                <Text style={styles.detailLabel}>{detail.label}</Text>
                            </View>
                            <Text style={styles.detailValue}>{detail.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >   
                    <View style={styles.logoutContent}>
                        {/* <LogoutIcon width={20} height={20} /> */}
                        <Text style={styles.logoutText}>{t('logout_from_vehicle')}</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

export default VehicleDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    scrollContainer: {
        paddingBottom: 100,
        paddingHorizontal: scale(20),
    },
    header: {
        alignItems: 'center',
        marginTop: verticalScale(20),
        marginBottom: verticalScale(30),
    },
    headerTitle: {
        fontFamily: Fonts.bold,
        fontSize: moderateScale(24),
        color: Colors.black,
        marginBottom: verticalScale(5),
    },
    headerSubtitle: {
        fontFamily: Fonts.regular,
        fontSize: moderateScale(14),
        color: Colors.warm_grey,
    },
    detailsCard: {
        backgroundColor: Colors.white,
        borderRadius: scale(12),
        padding: scale(20),
        marginBottom: verticalScale(30),
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: Colors.pale_grey_two,
    },
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: scale(10),
        opacity: 0.7,
    },
    detailLabel: {
        fontFamily: Fonts.medium,
        fontSize: moderateScale(14),
        color: Colors.black,
        flex: 1,
    },
    detailValue: {
        fontFamily: Fonts.regular,
        fontSize: moderateScale(14),
        color: Colors.warm_grey,
        textAlign: 'right',
        flex: 1,
    },
    logoutButton: {
        backgroundColor: Colors.danger_red,
        borderRadius: scale(12),
        padding: scale(16),
        marginTop: verticalScale(20),
        shadowColor: Colors.danger_red,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logoutContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        fontFamily: Fonts.medium,
        fontSize: moderateScale(16),
        color: Colors.white,
        marginLeft: scale(10),
    },
})