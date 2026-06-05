import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import LinearGradient from 'react-native-linear-gradient';

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
const BottomSheetHeader = (rideDistance, estimatedDuration, setShowPreference, isFullScreenMap, toggleFullScreenMap) => {
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
             <MapIcon />
            <View style={styles.bottomSheetHeader}>
                <View style={styles.mapActionContainer}>
                    <TouchableOpacity style={styles.currentLocationIconContainer} onPress={toggleFullScreenMap}>
                        <Ionicons name={isFullScreenMap ? "contract-outline" : "expand-outline"} size={22} color={colors.black} />
                    </TouchableOpacity>
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

    const bottomSheetRef = useRef(null);
    const [isFullScreenMap, setIsFullScreenMap] = useState(false);

    const toggleFullScreenMap = useCallback(() => {
        if (isFullScreenMap) {
            setIsFullScreenMap(false);
            bottomSheetRef.current?.snapToIndex(0); // 75%
        } else {
            setIsFullScreenMap(true);
            setTimeout(() => {
                bottomSheetRef.current?.snapToIndex(0); // 14%
            }, 100);
        }
    }, [isFullScreenMap]);

    const snapPoints = useMemo(() => isFullScreenMap ? ['14%', '75%', '90%'] : ['75%', '90%'], [isFullScreenMap]);

    const handleSheetChange = useCallback((index) => {
        if (isFullScreenMap && index > 0) {
            setIsFullScreenMap(false);
        }
    }, [isFullScreenMap]);



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
        actingDriverAccommodation,
        actingDriverFood,
        actingDriverKidsOnBoard,
        actingDriverMaxSpeed,
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
        <View style={{ flex: 1 }}>
            <View>
                <NavBar elevation onBackPress={handleBackPress} />
            </View>
            
            

            <BottomSheetWrapper
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={0}
                enablePanDownToClose={false}
                enableOverDrag={true}
                enableScroll={true}
                onChange={handleSheetChange}
                handleComponent={() => BottomSheetHeader(rideDistance, estimatedDuration, setShowPreference, isFullScreenMap, toggleFullScreenMap)}
                handleIndicatorStyle={{ backgroundColor: '#DEDEDE', width: 50, height: 4 }}

            >
                
                    <View style={styles.sheetContent}>
                    <View style={styles.headerTitleContainer}>
                        <AdaptiveText style={styles.stepText}>{t('step_3_of_3', 'Step 3 of 3')}</AdaptiveText>
                        <AdaptiveText style={styles.titleText}>{t('review_confirm', 'Review & Confirm')}</AdaptiveText>
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
                    </View>

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

                {/* Fare Details */}
                <View style={[styles.reviewCard, styles.fareReviewCard]}>
                    <View style={styles.fareReviewRow}>
                        <View style={styles.detailLeft}>
                            <Ionicons name="car-outline" size={18} color={themeColor.primary} />
                            <AdaptiveText style={[styles.fareReviewLabel, {color: themeColor.primary}]}>{t('fare_details', 'Fare Details')}</AdaptiveText>
                        </View>
                        <AdaptiveText style={styles.fareReviewAmount}>{fareDisplay}</AdaptiveText>
                        {/* <TouchableOpacity onPress={() => {}}>
                            <AdaptiveText style={[styles.editLinkText, {color: themeColor.primary}]}>{t('edit', 'Edit')} &gt;</AdaptiveText>
                        </TouchableOpacity> */}
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

                

                {/* End of Fare Details */}
                <View style={{ height: 120 }} />
                </View>
            </BottomSheetWrapper>

            {/* Coupon row */}
            <TouchableOpacity style={[styles.couponContainer, { bottom: layoutHeight, borderColor: themeColor.primary, borderWidth: 1 }]} onPress={handleCouponPress}>
                {!couponCode ? (
                    <>
                        <FontAwesome6 name="percent" size={20} color={themeColor.primary} />
                        <AdaptiveText style={styles.couponText}>{t('offer_coupons', 'Offer & Coupons')}</AdaptiveText>
                        <Icon name="chevron-right" size={20} color={colors.grey_dark} />
                    </>
                ) : (
                    <>
                        <FontAwesome6 name="percent" size={16} color={themeColor.primary} />
                        <AdaptiveText>{t('coupon', 'Coupon')}</AdaptiveText>
                        <AdaptiveText style={[styles.couponText, { fontFamily: Fonts.semi_bold, color: themeColor.primary }]}>{couponCode}</AdaptiveText>
                        <AdaptiveText>{t('applied', 'Applied')}</AdaptiveText>
                    </>
                )}
            </TouchableOpacity>

            {/* Bottom action bar */}
            <View onLayout={layOutChange} style={styles.bottomContainer}>
                <View style={styles.bookingButtonContainer}>
                    <TouchableOpacity
                        style={styles.paymentContainer}
                        onPress={() => setIsPaymentTypeOpen(true)}
                        activeOpacity={0.8}
                    >
                        <AdaptiveText style={styles.payByLabel}>{t('pay_by')}</AdaptiveText>
                        <View style={styles.paymentMode}>
                            <AdaptiveText style={styles.paymentModeText}>{paymentType}</AdaptiveText>
                            <Icon name="arrow-drop-down" color={colors.white} style={{ fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.confirmSection}>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                { overflow: 'hidden' },
                                (!actingDriverVehicle || isBookingLoading || routeLoading?.loading) &&
                                    styles.confirmButtonDisabled,
                            ]}
                            onPress={handleConfirm}
                            disabled={!actingDriverVehicle || isBookingLoading || !!routeLoading?.loading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[themeColor.primary, themeColor.secondary || '#FF9800']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            {isBookingLoading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <AdaptiveText style={styles.confirmButtonText}>
                                        {t('confirm_and_book', 'Confirm & Book')}
                                    </AdaptiveText>
                                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <RouteStatusOverlay
                loading={!!routeLoading?.loading}
                error={routeLoading?.error}
                onBack={handleBackPress}
                onRetry={onRetryFetchRoute}
                top={height * 0.25}
            />

            {isPaymentTypeOpen && (
                <AnimatedBottomSheetWrapper
                    onClose={() => setIsPaymentTypeOpen(false)}
                    zIndex={100000}
                >
                    <PaymentType
                        onSelect={(pt) => {
                            setPaymentType(pt);
                            setIsPaymentTypeOpen(false);
                        }}
                        initialValue={paymentType}
                    />
                </AnimatedBottomSheetWrapper>
            )}

            {showCoupon && (
                <AnimatedBottomSheetWrapper onClose={() => setShowCoupon(false)} zIndex={100000}>
                    <CouponContainer />
                </AnimatedBottomSheetWrapper>
            )}





            {/* Booking Success Modal */}
            <Modal
                visible={bookingSuccess}
                animationType="fade"
                transparent={true}
                onRequestClose={() => {
                    setBookingSuccess(false);
                    useStackScreenStore.getState().reset();
                }}
            >
                <View style={styles.successModalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIconCircle}>
                            <Icon name="check-circle" size={80} color={actingDriverColors.success} />
                        </View>

                        <AdaptiveText style={styles.successModalTitle}>
                            {t('acting_driver_booked', 'Acting Driver Booked!')}
                        </AdaptiveText>

                        <AdaptiveText style={styles.successModalSubtitle}>
                            {t('booking_success_info', 'Acting driver booked. We will let you know once a driver is assigned.')}
                        </AdaptiveText>

                        <TouchableOpacity
                            style={styles.doneButton}
                            activeOpacity={0.8}
                            onPress={() => {
                                setBookingSuccess(false);
                                useStackScreenStore.getState().reset();
                            }}
                        >
                            <AdaptiveText style={styles.doneButtonText}>
                                {t('done', 'Done')}
                            </AdaptiveText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default BookActingDriverScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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
        marginTop: 16,
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 10,
        backgroundColor: actingDriverColors.secondary || '#1a3a5c',
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: 15,
        fontFamily: Fonts.bold,
        color: colors.white,
    },
    // ── Bottom sheet header ──────────────────────────────────────────────────
    bottomSheetHeaderContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    bottomSheetHeader: {
        position: 'absolute',
        width: width,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        top: -115,
        paddingHorizontal: 10,
    },
    mapActionContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 10,
        paddingBottom: 10,
    },
    currentLocationIconContainer: {
        padding: 10,
        borderRadius: 30,
        backgroundColor: 'white',
        elevation: 5,
    },
    // ── Section ──────────────────────────────────────────────────────────────
    sectionContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.semi_bold,
        color: colors.black,
        marginBottom: 10,
    },
    noVehicleText: {
        fontSize: 13,
        color: colors.grey_dark,
        fontFamily: Fonts.regular,
    },
    // ── Vehicle card ─────────────────────────────────────────────────────────
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.black,
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#FAFAFA',
        gap: 12,
    },
    vehicleIconBox: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#F0EFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vehicleInfo: {
        flex: 1,
        gap: 3,
    },
    vehicleRegNo: {
        fontSize: 15,
        fontFamily: Fonts.semi_bold,
        color: colors.black,
    },
    vehicleMeta: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: colors.grey_dark,
    },
    verifiedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    verifiedText: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: colors.green,
    },
    fareBox: {
        alignItems: 'flex-end',
        minWidth: 70,
    },
    fareLabel: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: colors.grey_dark,
    },
    fareValue: {
        fontSize: 15,
        fontFamily: Fonts.semi_bold,
        color: colors.black,
        marginTop: 2,
    },
    // ── Coupon row ───────────────────────────────────────────────────────────
    couponContainer: {
        position: 'absolute',
        bottom: height * 0.15,
        left: 0,
        right: 0,
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 10,
        zIndex: 99999,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#fffae2',
    },
    couponText: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.black,
    },
    // ── Bottom bar ───────────────────────────────────────────────────────────
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100000,
        elevation: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },
    bookingButtonContainer: {
        backgroundColor: colors.black,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'row',
        padding: 10,
        elevation: 5,
    },
    paymentContainer: {
        width: '30%',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    payByLabel: {
        fontSize: 12,
        color: colors.white,
        fontFamily: Fonts.regular,
    },
    paymentMode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    paymentModeText: {
        fontSize: 16,
        fontFamily: Fonts.regular,
        color: colors.white,
    },
    confirmSection: {
        width: '70%',
    },
    paymentBreakdownCard: {
        marginTop: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    breakdownTitle: {
        fontSize: 14,
        fontFamily: Fonts.semi_bold,
        color: colors.black,
        marginBottom: 12,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E2E8F0',
    },
    breakdownLabel: {
        fontSize: 13,
        fontFamily: Fonts.regular,
        color: colors.grey_dark,
    },
    breakdownValue: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: colors.black,
    },
    breakdownNote: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: colors.grey_dark,
        marginTop: 12,
        lineHeight: 16,
        fontStyle: 'italic',
    },
    sheetContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom:80,
    },
    tripTabsRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    tripTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
    },
    tabLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabIcon: {
        marginRight: 6,
    },
    tripTabText: {
        fontSize: 15,
        fontFamily: Fonts.medium,
        color: '#757575',
    },
    tripTabTextActive: {
        color: colors.orange,
        fontFamily: Fonts.bold,
    },
    activeTabUnderline: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: colors.orange,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    scheduleBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        marginBottom: 18,
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleLabel: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: actingDriverColors.secondary,
        marginBottom: 2,
    },
    scheduleDateText: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: actingDriverColors.secondary,
    },
    scheduleChevronWrap: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    schedulePanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingBottom: 36,
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        marginTop: 10,
    },
    scheduleTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: actingDriverColors.secondary,
        marginBottom: 4,
    },
    scheduleSubtitle: {
        fontSize: 13,
        fontFamily: Fonts.regular,
        color: colors.grey_xxdark,
    },
    closeBtn: {
        padding: 4,
    },
    scheduleTabRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 16,
    },
    scheduleTabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    scheduleTabLabel: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: '#757575',
    },
    scheduleTabLabelActive: {
        color: actingDriverColors.secondary,
        fontFamily: Fonts.bold,
    },
    scheduleActiveBar: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: actingDriverColors.primary,
    },
    datePickerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    scheduleConfirmButton: {
        backgroundColor: colors.blue_xxdark,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    scheduleConfirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.bold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 450,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: Fonts.semi_bold,
        color: actingDriverColors.secondary,
    },
    closeButton: {
        padding: 4,
    },
    paymentSummaryCard: {
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    summaryLabel: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: '#64748B',
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        color: actingDriverColors.secondary,
    },
    methodSectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.semi_bold,
        color: actingDriverColors.secondary,
        marginBottom: 12,
    },
    methodList: {
        gap: 12,
        marginBottom: 24,
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    methodRowSelected: {
        borderColor: actingDriverColors.primary,
        backgroundColor: '#FFFBEB',
    },
    methodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    methodText: {
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: actingDriverColors.secondary,
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#94A3B8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: actingDriverColors.primary,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: actingDriverColors.primary,
    },
    payNowButton: {
        backgroundColor: actingDriverColors.success,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: actingDriverColors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    payNowText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.semi_bold,
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    successCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#DEF7EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: actingDriverColors.success,
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    /* ── Itinerary Button ── */
    itineraryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFBEB',
        borderWidth: 1.5,
        borderColor: actingDriverColors.primary,
        borderRadius: 14,
        padding: 14,
        marginTop: 16,
    },
    itineraryButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    itineraryButtonIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itineraryButtonTitle: {
        fontSize: 14,
        fontFamily: Fonts.semi_bold || Fonts.medium,
        color: actingDriverColors.secondary,
    },
    itineraryButtonSub: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: '#4B5563',
        marginTop: 2,
    },
    itineraryButtonRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    itineraryBadge: {
        backgroundColor: actingDriverColors.primary,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    itineraryBadgeText: {
        fontSize: 11,
        fontFamily: Fonts.semi_bold || Fonts.medium,
        color: actingDriverColors.secondary,
    },
    vehicleScrollCard: {
        width: 240,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
    },
    vehicleScrollCardSelected: {
        backgroundColor: '#F1F5F9',
        borderColor: '#94A3B8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    addVehicleScrollCard: {
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        gap: 8,
    },
    vehicleScrollIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vehicleScrollIconBgSelected: {
        backgroundColor: '#475569',
    },
    vehicleScrollReg: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: '#1E293B',
    },
    vehicleScrollRegSelected: {
        color: '#1E293B',
    },
    vehicleScrollMeta: {
        fontSize: 12,
        fontFamily: Fonts.medium,
        color: '#64748B',
        marginTop: 2,
    },
    vehicleScrollMetaSelected: {
        color: '#64748B',
    },
    addVehicleScrollText: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: '#1E293B',
        marginTop: 8,
    },
});
