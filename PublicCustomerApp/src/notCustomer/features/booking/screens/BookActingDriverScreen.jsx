import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    FlatList,
    Text,
    Image,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import NavBar from '../../../components/NavBar';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import { BottomSheetScrollView, BottomSheetFlatList } from '@gorhom/bottom-sheet';

import MapIcon from '../../../components/Map/MapIcon';
import CurrentLocationIcon from '../../../assets/icons/CurrentLocationIcon.svg';
import AddStopIcon from '../../../assets/icons/AddStopIcon.svg';
import { height, width } from '../../../utils/Utils';
import { utils } from '../../../utils/Utils';
import { colors, Fonts, actingDriverColors, ACTING_DRIVER_THEMES } from '../../../constants/constants';
import AdaptiveText from '../../../components/Common/AdaptiveText';
import RouteStatusOverlay from '../../../components/Loaders/RouteStatusOverlay';
import RideInfo from '../components/bookRide/RideInfo';

import useRideBookingInfo from '../store/useRideBookingInfo';
import useRideBookingLocationStore from '../store/useRideBookingLocationStore';
import useDirectionLoad from '../hooks/useDirectionLoad';
import LocationTypes from '../types/LocationTypes.json';
import useMapStore from '../../map/store/useMapStore';
import useActingDriverBookTrip from '../hooks/useActingDriverBookTrip';
import { getFareEngineRange, getRideEstimation, getPassangerVehicles } from '../../../API/EndPoints/EndPoints';
import { useDebouncedAPICall } from '../../../hooks/useDebounce';
import { showNotification } from '../../../components/NotificationManger';
import AnimatedBottomSheetWrapper from '../../shared/component/AnimatedBottomSheetWrapper';
// import ActingDriverPreferences from '../components/bookRide/ActingDriverPreferences';
import PaymentType from '../components/bookRide/PaymentType';
import CouponContainer from '../components/bookRide/CouponConatiner';

import {
    VEHICLE_TYPE_OPTIONS,
    VEHICLE_TYPE_ICON,
    getStockImage,
} from '../../myVehicles/constants/vehicleData';
import {
    buildKey as buildEstimationCacheKey,
    getFromCache as getEstimationFromCache,
    setInCache as setEstimationInCache,
    prune as pruneEstimationCache,
} from '../store/useEstimationCacheStore';

const VEHICLE_TYPE_TO_FARE_ENGINE = {
    hatchback: 'HATCHBACK',
    sedan: 'SEDAN',
    suv: 'SUV',
    exsedan: 'SEDAN',
    muv: 'SUV',
    luxury: 'SUV',
};

const CURRENCY_SYMBOLS = {
    INR: '\u20B9',
    RS: '\u20B9',
};

const getFareEngineVehicleType = (type) => {
    if (!type) return 'ALL';
    return VEHICLE_TYPE_TO_FARE_ENGINE[String(type).toLowerCase()] || String(type).toUpperCase();
};

const getCurrencySymbol = (currency) => {
    if (!currency) return '\u20B9';
    const normalizedCurrency = String(currency).toUpperCase();
    return CURRENCY_SYMBOLS[normalizedCurrency] || currency;
};

const formatFareAmount = (amount) => {
    const value = Number(amount);
    if (!Number.isFinite(value)) return null;
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

const formatFareRange = (fareData, fallbackCurrency) => {
    if (!fareData) return null;

    const symbol = getCurrencySymbol(fareData.currency || fallbackCurrency);
    const minFare = formatFareAmount(fareData.minFare);
    const maxFare = formatFareAmount(fareData.maxFare);
    const fare = formatFareAmount(fareData.fare);

    if (minFare && maxFare) return `${symbol}${minFare} - ${symbol}${maxFare}`;
    if (fare) return `${symbol}${fare}`;
    if (minFare) return `${symbol}${minFare}+`;
    return null;
};

const getFareDataForVehicle = (data, vehicleTypeKey, appVehicleType) => {
    const fareEngineData = data?.data;
    if (fareEngineData?.minFare || fareEngineData?.fare) {
        return { fareData: fareEngineData, currency: fareEngineData.currency };
    }

    const fareRanges = data?.result?.data?.fareRanges || fareEngineData?.fareRanges;
    const fallbackCurrency = data?.result?.data?.currency || fareEngineData?.currency;
    const appVehicleTypeKey = appVehicleType ? String(appVehicleType) : null;
    const selectedFareData =
        fareRanges?.[appVehicleTypeKey] ||
        fareRanges?.[appVehicleTypeKey?.toLowerCase?.()] ||
        fareRanges?.[appVehicleTypeKey?.toUpperCase?.()] ||
        fareRanges?.[vehicleTypeKey] ||
        fareRanges?.[vehicleTypeKey?.toLowerCase?.()] ||
        fareRanges?.[vehicleTypeKey?.toUpperCase?.()];

    if (selectedFareData) {
        return { fareData: selectedFareData, currency: selectedFareData.currency || fallbackCurrency };
    }

    const firstKey = fareRanges ? Object.keys(fareRanges)[0] : null;
    return { fareData: firstKey ? fareRanges[firstKey] : null, currency: fallbackCurrency };
};

// ─── Bottom sheet header (map + current location button) ─────────────────────
const BottomSheetHeader = (rideDistance, estimatedDuration, setShowPreference) => {
    const { setStackScreen } = useStackScreenStore();
    const { rideBookMode, passangerDetails, actingDriverItinerary, updateBookingInfo, showItineraryModal, setShowItineraryModal } = useRideBookingInfo();
    const { rideStartLocation, rideEndLocation, rideWayPoints } = useRideBookingLocationStore();
    const { setMapBounds } = useMapStore();

    const handleAddStop = () => {
        setStackScreen('WaypointScreen', {});
    };

    const handleCurrentLocation = () => {
        const coords = [
            [rideStartLocation.longitude, rideStartLocation.latitude],
            [rideEndLocation.longitude, rideEndLocation.latitude],
            ...rideWayPoints.map((wp) => [wp.longitude, wp.latitude]),
        ];
        const bounds = utils.getBoundingBox(coords);
        const margin = [50, 100, 50, height * 0.65];
        setMapBounds([bounds, margin]);
    };

    return (
        <View style={styles.bottomSheetHeaderContainer}>
            <View style={styles.bottomSheetHeader}>
                <MapIcon />
                <View style={styles.mapActionContainer}>
                    <TouchableOpacity style={styles.currentLocationIconContainer} onPress={handleCurrentLocation}>
                        <CurrentLocationIcon width={25} height={25} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.currentLocationIconContainer} onPress={handleAddStop}>
                        <AddStopIcon width={25} height={25} />
                    </TouchableOpacity>
                </View>
            </View>
            <RideInfo distance={rideDistance} duration={estimatedDuration} showPreference={setShowPreference} hidePreference={true} />
        </View>
    );
};



// ─── Main screen ──────────────────────────────────────────────────────────────
const BookActingDriverScreen = () => {
    const { t } = useTranslation();
    const { goBack, setStackScreen } = useStackScreenStore();

    // States for simulated payment
    const [isSimulatedPaymentOpen, setIsSimulatedPaymentOpen] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('UPI');
    const [bookingSuccess, setBookingSuccess] = useState(false);



    const [vehiclesList, setVehiclesList] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);

    useEffect(() => {
        const fetchUserVehicles = async () => {
            setLoadingVehicles(true);
            try {
                const response = await getPassangerVehicles();
                if (response.success) {
                    const list = response.vehicles || [];
                    setVehiclesList(list);
                    if (list.length > 0 && !actingDriverVehicle) {
                        setActingDriverVehicle(list[0]);
                        if (list[0].maxSpeed) {
                            setActingDriverMaxSpeed(String(list[0].maxSpeed));
                        }
                    }
                }
            } catch (err) {
                console.log('Failed to fetch user vehicles', err);
            } finally {
                setLoadingVehicles(false);
            }
        };

        fetchUserVehicles();
    }, []);



    const onAddWaypoint = () => {
        setStackScreen('WaypointScreen', { fromPlanScreen: true });
    };

    const {
        rideStartLocation,
        rideEndLocation,
        rideWayPoints,
        setRideStartLocation,
        setRideEndLocation,
        addRideWayPoint,
    } = useRideBookingLocationStore();

    const handleLocationClick = (type) => {
        const onPickLocationResultCallback = (item, locType) => {
            if (locType === LocationTypes.START_LOCATION) {
                setRideStartLocation(item);
            } else if (locType === LocationTypes.DESTINATION_LOCATION) {
                setRideEndLocation(item);
            } else if (locType === LocationTypes.WAYPOINT_LOCATION) {
                addRideWayPoint(item);
            }
        };

        const props = {
            onPickLocationResultCallback: onPickLocationResultCallback,
            locationType: type || LocationTypes.DESTINATION_LOCATION,
            label: type === LocationTypes.DESTINATION_LOCATION ? t('locate_drop_location') : type === LocationTypes.WAYPOINT_LOCATION ? t('locate_stop') : t('locate_pickup_location'),
            buttonLabel: type === LocationTypes.DESTINATION_LOCATION ? t('button_locate_drop_location') : type === LocationTypes.WAYPOINT_LOCATION ? t('button_locate_stop') : t('button_locate_pickup_location'),
            isFromRidePointsSelection: true,
            searchBar: true,
            focusSearchOnMount: true,
        };

        if (type === LocationTypes.START_LOCATION && rideStartLocation) {
            props.defaultLocation = rideStartLocation;
        }
        if (type === LocationTypes.DESTINATION_LOCATION && rideEndLocation) {
            props.defaultLocation = rideEndLocation;
        }

        setStackScreen('PickLocationScreen', props);
    };

    const currentScreen = useStackScreenStore(state => state.stackScreen[state.stackScreen.length - 1]);
    const params = currentScreen?.params;

    useEffect(() => {
        if (params?.RideMatchDriverNotFound) {
            showNotification(
                t('driver_not_found', 'Driver Not Found'),
                t('no_available_drivers_acting', 'No available drivers found at the moment. Your booking has been closed.'),
                'danger'
            );
        }
    }, [params]);

    const {
        paymentType,
        setPaymentType,
        rideDistance,
        estimatedDuration,
        updateBookingInfo,
        actingDriverVehicle,
        setActingDriverVehicle,
        setRegionOfficeId,
        setRegionOfficeCode,
        regionOfficeCode,
        couponCode,
        actingDriverItinerary,
        setActingDriverItinerary,
        setActingDriverMaxSpeed,
        bookingTab,
        durationRangeStart,
        durationRangeEnd,
        actingDriverHours,
        customStartTime,
        tomorrowStartTime,
        tripType,
        setTripType,
        showItineraryModal,
        setShowItineraryModal,
        actingDriverAccommodation,
        actingDriverFood,
        actingDriverKidsOnBoard,
        actingDriverElderlyOnBoard,
        actingDriverMaxSpeed,
    } = useRideBookingInfo();

    const itineraryDates = (() => {
        if (bookingTab !== 'CUSTOM' || !durationRangeStart || !durationRangeEnd) {
            return [];
        }
        
        const dates = [];
        let current = new Date(durationRangeStart);
        const end = new Date(durationRangeEnd);
        
        current.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        
        while (current <= end) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    })();

    const shouldShowItinerary = itineraryDates.length > 1;

    const {
        transformRideLocationsToDirectionPoints,
    } = useDirectionLoad();

    const { setDirectionPoints, routeLoading } = useMapStore();

    const {
        bookTrip,
        isLoading: isBookingLoading,
        isBookingReady,
        getBookingValidationErrors,
    } = useActingDriverBookTrip();

    const [isPaymentTypeOpen, setIsPaymentTypeOpen] = useState(false);
    const [, setShowPreference] = useState(false);
    const [showCoupon, setShowCoupon] = useState(false);
    const [isEstimationLoading, setIsEstimationLoading] = useState(false);
    const [fareDisplay, setFareDisplay] = useState(null);
    const estimationInFlightRef = useRef(false);
    const longLoadTimerRef = useRef(null);

    const [layoutHeight, setLayoutHeight] = useState(0);

      const layOutChange = (event) => {
        const { height } = event.nativeEvent.layout;
        setLayoutHeight(height);
    }

    // ── Route ──────────────────────────────────────────────────────────────────
    const loadRoute = async () => {
        const result = await transformRideLocationsToDirectionPoints({
            clearMarkers: true,
            vehicleType: 'car',
            padding: [50, 50, 50, height * 0.5],
            tripType,
        });
        if (result.success) {
            const distanceKm = Number(result.distance);
            const durationMin = Number(result.duration) / 60;
            updateBookingInfo({
                rideDistance: Number.isFinite(distanceKm) ? distanceKm.toFixed(1) : null,
                estimatedDuration: Number.isFinite(durationMin) ? Math.max(1, Math.round(durationMin)) : 1,
            });
        }
    };

    useEffect(() => {
        loadRoute();
        return () => {
            setDirectionPoints(null);
            updateBookingInfo({ rideDistance: null, estimatedDuration: null });
        };
    }, [tripType]);

    // ── Fare estimation ────────────────────────────────────────────────────────
    const onEstimationSuccess = useCallback(
        (data) => {
            if (data?.result?.success || data?.success) {
                if (data?.regionCode) setRegionOfficeCode(data.regionCode);
                if (data?.regionOfficeId) setRegionOfficeId(data.regionOfficeId);

                const appVehicleType = actingDriverVehicle?.type;
                const vehicleTypeKey = getFareEngineVehicleType(appVehicleType);
                const { fareData, currency } = getFareDataForVehicle(data, vehicleTypeKey, appVehicleType);
                const nextFareDisplay = formatFareRange(fareData, currency);
                if (nextFareDisplay) {
                    setFareDisplay(nextFareDisplay);
                    return;
                }

                const fareRanges = data?.result?.data?.fareRanges;
                const vehicleT = actingDriverVehicle?.type;
                if (fareRanges && vehicleT && fareRanges[vehicleT]) {
                    const { minFare, maxFare, currency } = fareRanges[vehicleT];
                    const symbol = currency || '₹';
                    if (minFare && maxFare) {
                        setFareDisplay(`${symbol}${minFare} – ${symbol}${maxFare}`);
                    } else if (minFare) {
                        setFareDisplay(`${symbol}${minFare}+`);
                    }
                } else {
                    // fallback: pick any first entry
                    const firstKey = fareRanges ? Object.keys(fareRanges)[0] : null;
                    if (firstKey) {
                        const { minFare, maxFare, currency } = fareRanges[firstKey];
                        const symbol = currency || '₹';
                        setFareDisplay(`${symbol}${minFare} – ${symbol}${maxFare}`);
                    }
                }
            } else {
                showNotification(
                    t('ride_estimation_title'),
                    data?.message || t('failed_to_get_fare_estimation'),
                    'danger',
                );
            }
        },
        [actingDriverVehicle],
    );

    const estimationCaller = useCallback(
        async (payload, cacheKey) => {
            if (estimationInFlightRef.current) return;
            estimationInFlightRef.current = true;
            try {
                setIsEstimationLoading(true);
                if (longLoadTimerRef.current) clearTimeout(longLoadTimerRef.current);
                let data = null;
                try {
                    data = await getFareEngineRange(payload);
                } catch (fareEngineError) {
                    console.warn('Fare engine range failed, falling back to ride estimation:', fareEngineError);
                    data = await getRideEstimation(payload);
                }
                if (cacheKey && (data?.result?.success || data?.success)) setEstimationInCache(cacheKey, data);
                onEstimationSuccess(data);
            } catch (_) {
                showNotification(t('ride_estimation_title'), t('request_failed'), 'danger');
            } finally {
                estimationInFlightRef.current = false;
                setIsEstimationLoading(false);
                if (longLoadTimerRef.current) {
                    clearTimeout(longLoadTimerRef.current);
                    longLoadTimerRef.current = null;
                }
            }
        },
        [onEstimationSuccess],
    );

    const debouncedGetRideEstimation = useDebouncedAPICall(estimationCaller, 500);

    useEffect(() => {
        return () => {
            if (debouncedGetRideEstimation?.cancel) debouncedGetRideEstimation.cancel();
        };
    }, []);

    const getEstimatedFare = useCallback(() => {
        const cacheKey = buildEstimationCacheKey({
            start: rideStartLocation,
            end: rideEndLocation,
            waypoints: rideWayPoints,
            tripType,
        });
        pruneEstimationCache();
        const cached = getEstimationFromCache(cacheKey);
        if (cached) {
            onEstimationSuccess(cached);
            return;
        }
        const payload = {
            distance: rideDistance || 0,
            duration: estimatedDuration || (actingDriverHours ? actingDriverHours * 60 : 0),
            zone: 'all',
            regionCode: regionOfficeCode || 'default',
            coordinates: [rideStartLocation?.longitude, rideStartLocation?.latitude],
        };
        debouncedGetRideEstimation(payload, cacheKey);
    }, [rideDistance, estimatedDuration, actingDriverHours, regionOfficeCode, rideStartLocation, rideEndLocation, rideWayPoints, tripType]);

    useEffect(() => {
        if (rideDistance || estimatedDuration || actingDriverHours) {
            getEstimatedFare();
        }
    }, [rideDistance, estimatedDuration, actingDriverHours, tripType, getEstimatedFare]);

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleBackPress = () => {
        updateBookingInfo({ rideDistance: null, estimatedDuration: null });
        goBack();
    };

    const handleConfirm = async () => {
        if (!isBookingReady()) {
            const errors = getBookingValidationErrors();
            console.log('Acting driver booking validation errors:', errors);
            return;
        }
        proceedWithBooking();
    };

    const proceedWithBooking = async () => {
        try {
            const res = await bookTrip();
            if (res?.success) {
                setBookingSuccess(true);
            }
        } catch (error) {
            console.error('Acting driver booking failed:', error);
        }
    };

    const onRetryFetchRoute = () => loadRoute();

    const handleCouponPress = () => setShowCoupon(true);

    const vehicleType = actingDriverVehicle?.type?.toLowerCase() || 'sedan';
    const themeColor = ACTING_DRIVER_THEMES[vehicleType] || actingDriverColors;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.white_dirt }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.black} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <AdaptiveText style={styles.stepText}>{t('step_4_of_4', 'Step 4 of 4')}</AdaptiveText>
                    <AdaptiveText style={styles.titleText}>{t('review_confirm', 'Review & Confirm')}</AdaptiveText>
                </View>
            </View>

            <View style={styles.progressBar}>
                <View style={[styles.progressDot, { backgroundColor: themeColor.primary }]} />
                <View style={styles.progressLine}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: themeColor.primary }} />
                </View>
                <View style={[styles.progressDot, { backgroundColor: themeColor.primary }]} />
                <View style={styles.progressLine}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: themeColor.primary }} />
                </View>
                <View style={[styles.progressDot, { backgroundColor: themeColor.primary }]} />
                <View style={styles.progressLine}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: themeColor.primary }} />
                </View>
                <View style={[styles.progressDot, { backgroundColor: themeColor.primary }]} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Vehicle Card */}
                <View style={styles.reviewCard}>
                    <View style={styles.vehicleReviewHeader}>
                        {actingDriverVehicle?.photo || getStockImage(actingDriverVehicle?.type) ? (
                            <Image
                                source={actingDriverVehicle?.photo ? { uri: actingDriverVehicle.photo } : getStockImage(actingDriverVehicle?.type)}
                                style={styles.vehicleReviewImage}
                            />
                        ) : (
                            <Ionicons name="car-sport" size={40} color={colors.black} />
                        )}
                        <View style={styles.vehicleReviewInfo}>
                            <AdaptiveText style={[styles.vehicleReviewLabel, {color: themeColor.primary}]}>{t('vehicle', 'Vehicle')}</AdaptiveText>
                            <AdaptiveText style={styles.vehicleReviewName}>
                                {actingDriverVehicle?.regNo || 'TN09CR3540'} • {actingDriverVehicle?.model || 'Audi Q2'}
                            </AdaptiveText>
                        </View>
                        <TouchableOpacity onPress={() => setStackScreen('ActingDriverVehicleSelectScreen', {})}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Details Card */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="arrow-forward-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('trip_type', 'Trip Type')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue}>
                            {tripType === 'ONE_WAY' ? 'One Way (Drop Off)' : 'Round Trip'}
                        </AdaptiveText>
                        <TouchableOpacity onPress={() => useStackScreenStore.getState().goBack()}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="calendar-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('date_time', 'Date & Time')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue}>
                            {utils.formatDate(bookingTab === 'TODAY' ? customStartTime : tomorrowStartTime, 'ddd, D MMM YYYY, hh:mm A')}
                        </AdaptiveText>
                        <TouchableOpacity onPress={() => useStackScreenStore.getState().goBack()}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="time-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('duration', 'Duration')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue}>{actingDriverHours} Hours (Hourly)</AdaptiveText>
                        <TouchableOpacity onPress={() => useStackScreenStore.getState().goBack()}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="location-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('pickup_location', 'Pickup Location')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue} numberOfLines={1}>
                            {rideStartLocation ? utils.formatAddressName(rideStartLocation) : ''}
                        </AdaptiveText>
                        <TouchableOpacity onPress={() => useStackScreenStore.getState().goBack()}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="location-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('drop_location', 'Drop Location')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue} numberOfLines={1}>
                            {rideEndLocation ? utils.formatAddressName(rideEndLocation) : ''}
                        </AdaptiveText>
                        <TouchableOpacity onPress={() => useStackScreenStore.getState().goBack()}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="reader-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('itinerary', 'Itinerary')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue}>
                            {actingDriverItinerary ? `${Object.keys(actingDriverItinerary).length} Days` : '0 Days'}
                        </AdaptiveText>
                        <TouchableOpacity onPress={() => {}}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="bed-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('driver_arrangements', 'Driver Arrangements')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue}>
                            {[actingDriverAccommodation ? 'Accommodation' : null, actingDriverFood ? 'Food Allowance' : null].filter(Boolean).join(' • ') || 'None'}
                        </AdaptiveText>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="build-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('special_requirements', 'Special Requirements')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue}>
                            {[actingDriverKidsOnBoard ? 'Children On Board' : null, actingDriverMaxSpeed ? `Comfort ${actingDriverMaxSpeed} km/h` : null].filter(Boolean).join(' • ') || 'None'}
                        </AdaptiveText>
                        <TouchableOpacity onPress={() => {}}>
                            <Ionicons name="chevron-forward" size={16} color="#4B5563" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="create-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('custom_notes', 'Custom Notes')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.detailValue}>Driver familiar with hill roads</AdaptiveText>
                    </View>
                </View>

                {/* Fare Details */}
                <View style={[styles.reviewCard, styles.fareReviewCard]}>
                    <View style={styles.fareReviewRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="car-outline" size={18} color={themeColor.primary} />
                            <AdaptiveText style={[styles.fareReviewLabel, {color: themeColor.primary}]}>{t('fare_details', 'Fare Details')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.fareReviewAmount}>{fareDisplay}</AdaptiveText>
                        <TouchableOpacity onPress={() => {}}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Apply Coupon */}
                <TouchableOpacity style={styles.reviewCard} onPress={handleCouponPress} activeOpacity={0.8}>
                    <View style={styles.fareReviewRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="pricetag-outline" size={18} color={themeColor.primary} />
                            <AdaptiveText style={[styles.couponReviewLabel, {color: themeColor.primary}]}>{t('apply_coupon', 'Apply Coupon')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.viewOffersText}>{t('view_offers', 'View offers')} &gt;</AdaptiveText>
                    </View>
                </TouchableOpacity>

                {/* Payment Method */}
                <TouchableOpacity style={styles.reviewCard} onPress={() => {}} activeOpacity={0.8}>
                    <View style={styles.fareReviewRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="card-outline" size={18} color="#4B5563" />
                            <AdaptiveText style={styles.detailLabel}>{t('payment_method', 'Payment Method')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.paymentMethodText}>UPI • Google Pay &gt;</AdaptiveText>
                    </View>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.stickyFooter}>
                <TouchableOpacity
                    style={[styles.confirmButton, {backgroundColor: themeColor.primary}, (isBookingLoading || !!routeLoading?.loading) && styles.confirmButtonDisabled]}
                    onPress={proceedWithBooking}
                    disabled={isBookingLoading || !!routeLoading?.loading}
                    activeOpacity={0.85}
                >
                    {isBookingLoading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <AdaptiveText style={styles.confirmButtonText}>{t('confirm_and_book', 'Confirm & Book')}</AdaptiveText>
                            <Ionicons name="arrow-forward" size={20} color={colors.white} />
                        </>
                    )}
                </TouchableOpacity>
                <View style={styles.secureFooter}>
                    <Ionicons name="lock-closed-outline" size={14} color="#6B7280" />
                    <AdaptiveText style={styles.secureFooterText}>{t('secure_safe_booking', 'Secure & Safe Booking')}</AdaptiveText>
                </View>
            </View>

            {showCoupon && (
                <AnimatedBottomSheetWrapper onClose={() => setShowCoupon(false)} zIndex={100000}>
                    <CouponContainer />
                </AnimatedBottomSheetWrapper>
            )}

            <Modal visible={bookingSuccess} animationType="fade" transparent={true}>
                <View style={styles.successModalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconCircle}>
                            <Icon name="check-circle" size={80} color={actingDriverColors.success} />
                        </View>
                        <AdaptiveText style={styles.successModalTitle}>{t('acting_driver_booked', 'Acting Driver Booked!')}</AdaptiveText>
                        <AdaptiveText style={styles.successModalSubtitle}>{t('booking_success_info', 'Acting driver booked. We will let you know once driver approved.')}</AdaptiveText>
                        <TouchableOpacity
                            style={[styles.doneButton, {backgroundColor: themeColor.primary}]}
                            onPress={() => {
                                setBookingSuccess(false);
                                useStackScreenStore.getState().reset();
                            }}
                        >
                            <AdaptiveText style={styles.doneButtonText}>{t('done', 'Done')}</AdaptiveText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <RouteStatusOverlay
                loading={!!routeLoading?.loading}
                error={routeLoading?.error}
                onBack={handleBackPress}
                onRetry={onRetryFetchRoute}
                top={height * 0.25}
            />
        </SafeAreaView>
    );

};

export default BookActingDriverScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white_dirt,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        padding: 4,
        zIndex: 1,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    stepText: {
        fontFamily: Fonts.semi_bold,
        fontSize: 14,
        color: colors.black,
    },
    titleText: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: colors.black,
    },
    progressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.grey_xdark,
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.grey_xdark,
        marginHorizontal: 4,
        borderRadius: 1,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    reviewCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.grey_xdark,
    },
    vehicleReviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vehicleReviewImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    vehicleReviewInfo: {
        flex: 1,
        marginLeft: 12,
    },
    vehicleReviewLabel: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        marginBottom: 2,
    },
    vehicleReviewName: {
        fontSize: 15,
        fontFamily: Fonts.bold,
        color: colors.blue_xxdark,
    },
    editLinkText: {
        fontSize: 13,
        fontFamily: Fonts.semi_bold,
    },
    detailsContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.grey_xdark,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 130,
    },
    detailLabel: {
        fontSize: 13,
        fontFamily: Fonts.semi_bold,
        color: colors.grey_xxdark,
        marginLeft: 8,
    },
    detailValue: {
        flex: 1,
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: colors.blue_xxdark,
        textAlign: 'left',
        marginHorizontal: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 44,
        marginRight: 16,
    },
    fareReviewCard: {
        backgroundColor: colors.yellow_xxlight,
        borderColor: colors.yellow_light,
    },
    fareReviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fareReviewLabel: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        marginLeft: 8,
    },
    fareReviewAmount: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: colors.blue_xxdark,
        textAlign: 'right',
        marginRight: 12,
    },
    couponReviewLabel: {
        fontSize: 14,
        fontFamily: Fonts.semi_bold,
        marginLeft: 8,
    },
    viewOffersText: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: colors.grey_xxdark,
    },
    paymentMethodText: {
        fontSize: 13,
        fontFamily: Fonts.semi_bold,
        color: colors.blue_xxdark,
    },
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.grey_xdark,
        paddingBottom: 24,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: colors.white,
        marginRight: 8,
    },
    secureFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secureFooterText: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: colors.grey_xxdark,
        marginLeft: 6,
    },
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successModalContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '85%',
    },
    successIconCircle: {
        marginBottom: 16,
    },
    successModalTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: colors.blue_xxdark,
        marginBottom: 8,
        textAlign: 'center',
    },
    successModalSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.grey_xxdark,
        marginBottom: 24,
        textAlign: 'center',
    },
    doneButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    doneButtonText: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: colors.white,
    },
});
