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
import { colors, Fonts, actingDriverColors } from '../../../constants/constants';
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

    return (
        <>
            <View>
                <NavBar elevation onBackPress={handleBackPress} />
            </View>
            

            <BottomSheetWrapper
                snapPoints={['75%', '90%']}
                index={0}
                enablePanDownToClose={false}
                enableOverDrag={true}
                enableScroll={false}
                handleComponent={() => BottomSheetHeader(rideDistance, estimatedDuration, setShowPreference)}
                handleIndicatorStyle={{ backgroundColor: '#DEDEDE', width: 50, height: 4 }}

            >
                {/* One Way / Round Trip Tabs */}
                <View style={styles.tripTabsRow}>
                    <TouchableOpacity
                        style={[styles.tripTab, tripType === 'ONE_WAY' && styles.tripTabActive]}
                        onPress={() => setTripType('ONE_WAY')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.tabLabelContainer}>
                            <Icon
                                name="call-made"
                                size={18}
                                color={tripType === 'ONE_WAY' ? actingDriverColors.primary : '#757575'}
                                style={styles.tabIcon}
                            />
                            <AdaptiveText style={[styles.tripTabText, tripType === 'ONE_WAY' && styles.tripTabTextActive]}>
                                {t('one_way', 'One Way')}
                            </AdaptiveText>
                        </View>
                        {tripType === 'ONE_WAY' && <View style={styles.activeTabUnderline} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tripTab, tripType === 'ROUND_TRIP' && styles.tripTabActive]}
                        onPress={() => setTripType('ROUND_TRIP')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.tabLabelContainer}>
                            <Ionicons
                                name="sync"
                                size={16}
                                color={tripType === 'ROUND_TRIP' ? actingDriverColors.primary : '#757575'}
                                style={styles.tabIcon}
                            />
                            <AdaptiveText style={[styles.tripTabText, tripType === 'ROUND_TRIP' && styles.tripTabTextActive]}>
                                {t('round_trip', 'Round Trip')}
                            </AdaptiveText>
                        </View>
                        {tripType === 'ROUND_TRIP' && <View style={styles.activeTabUnderline} />}
                    </TouchableOpacity>
                </View>

                <BottomSheetScrollView style={styles.sheetContent} contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
                    
                    {/* Schedule Date Banner */}
                    <View style={styles.scheduleBanner}>
                        <View style={styles.scheduleInfo}>
                            <AdaptiveText style={styles.scheduleLabel}>
                                {tripType === 'ONE_WAY' ? t('booking_one_way_for', 'Booking one-way for') : t('booking_round_trip_for', 'Booking round trip for')}
                            </AdaptiveText>
                            <AdaptiveText style={styles.scheduleDateText}>
                                {(() => {
                                    if (bookingTab === 'TODAY') {
                                        return `${t('today', 'Today')} · ${actingDriverHours} ${t('hour_s', 'Hour(s)')}`;
                                    } else if (bookingTab === 'TOMORROW') {
                                        return `${t('tomorrow', 'Tomorrow')} · ${actingDriverHours} ${t('hour_s', 'Hour(s)')} (Start: ${utils.timestampTo12HourFormat(tomorrowStartTime || new Date())})`;
                                    } else if (bookingTab === 'SCHEDULE') {
                                        return `${utils.formatDate(customStartTime || new Date(), 'DD MMM YYYY, hh:mm A')} · ${actingDriverHours} ${t('hour_s', 'Hour(s)')}`;
                                    } else if (bookingTab === 'CUSTOM') {
                                        return `${utils.formatDate(durationRangeStart, 'DD MMM YYYY')} - ${utils.formatDate(durationRangeEnd, 'DD MMM YYYY')} (Start: ${utils.timestampTo12HourFormat(customStartTime || new Date())})`;
                                    }
                                    return t('schedule_not_set', 'Schedule not set');
                                })()}
                            </AdaptiveText>
                        </View>
                    </View>

                    {/* Plan Daily Itinerary Button */}
                    {shouldShowItinerary && (
                        <TouchableOpacity
                            style={styles.itineraryButton}
                            onPress={() => {
                                setStackScreen('ItineraryPlanScreen', {
                                    itineraryDates: itineraryDates,
                                    themeColor: actingDriverColors,
                                    onAddItineraryLocation: (dateStr) => {
                                        setStackScreen('PickLocationScreen', {
                                            locationType: LocationTypes.WAYPOINT_LOCATION,
                                            label: t('select_location', 'Select Location'),
                                            buttonLabel: t('add_location', 'Add Location'),
                                            isFromRidePointsSelection: true,
                                            searchBar: true,
                                            focusSearchOnMount: true,
                                            onPickLocationResultCallback: (item) => {
                                                try {
                                                    const state = useRideBookingInfo.getState();
                                                    const currentItin = state.actingDriverItinerary || {};
                                                    const newItin = JSON.parse(JSON.stringify(currentItin));
                                                    const dayItin = newItin[dateStr] || { locations: [] };
                                                    
                                                    dayItin.locations = [...(dayItin.locations || []), item];
                                                    newItin[dateStr] = dayItin;
                                                    
                                                    state.updateBookingInfo({
                                                        actingDriverItinerary: newItin
                                                    });
                                                    
                                                    useStackScreenStore.getState().goBack();
                                                } catch (e) {
                                                    console.error("Error adding location to itinerary", e);
                                                    useStackScreenStore.getState().goBack();
                                                }
                                            }
                                        });
                                    },
                                    onRemoveItineraryLocation: (dateStr, index) => {
                                        const state = useRideBookingInfo.getState();
                                        const currentItin = state.actingDriverItinerary || {};
                                        const newItin = JSON.parse(JSON.stringify(currentItin));
                                        if (newItin[dateStr] && newItin[dateStr].locations) {
                                            newItin[dateStr].locations.splice(index, 1);
                                            state.updateBookingInfo({
                                                actingDriverItinerary: newItin
                                            });
                                        }
                                    }
                                });
                            }}
                            activeOpacity={0.85}
                        >
                            <View style={styles.itineraryButtonLeft}>
                                <View style={styles.itineraryButtonIconWrap}>
                                    <Ionicons name="map-outline" size={18} color={actingDriverColors.primary} />
                                </View>
                                <View>
                                    <AdaptiveText style={styles.itineraryButtonTitle}>{t('plan_daily_itinerary', 'Plan Daily Itinerary')}</AdaptiveText>
                                    <AdaptiveText style={styles.itineraryButtonSub}>
                                        {Object.keys(actingDriverItinerary || {}).length > 0
                                            ? t('itinerary_configured', `${Object.keys(actingDriverItinerary || {}).length} day(s) configured`)
                                            : t('itinerary_optional', 'Optional · Tap to plan each day')}
                                    </AdaptiveText>
                                </View>
                            </View>
                            <View style={styles.itineraryButtonRight}>
                                {Object.keys(actingDriverItinerary || {}).length > 0 && (
                                    <View style={styles.itineraryBadge}>
                                        <AdaptiveText style={styles.itineraryBadgeText}>{Object.keys(actingDriverItinerary || {}).length}</AdaptiveText>
                                    </View>
                                )}
                                <Ionicons name="chevron-forward" size={16} color="#757575" />
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Selected vehicle */}
                    <View style={styles.sectionContainer}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
                            <AdaptiveText style={styles.sectionTitle}>
                                {t('your_vehicle', 'Your Vehicle')}
                            </AdaptiveText>
                            {(vehiclesList?.length > 1) && (
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                                    <Text style={{fontSize: 12, fontFamily: Fonts.medium, color: '#94A3B8'}}>{t('swipe', 'Swipe')}</Text>
                                    <Ionicons name="ellipsis-horizontal" size={16} color="#94A3B8" />
                                </View>
                            )}
                        </View>
                        {loadingVehicles ? (
                            <View style={{padding: 20, alignItems: 'center'}}>
                                <ActivityIndicator size="small" color={colors.black} />
                            </View>
                        ) : (
                            <BottomSheetFlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 8 }}
                                data={[...(vehiclesList || []), { isAddBtn: true }]}
                                keyExtractor={(item, idx) => item.isAddBtn ? 'add-btn' : (item._id?.toString() || String(idx))}
                                renderItem={({ item }) => {
                                    if (item.isAddBtn) {
                                        return (
                                            <TouchableOpacity
                                                style={[styles.vehicleScrollCard, styles.addVehicleScrollCard]}
                                                onPress={() => { setStackScreen('MyVehiclesScreen', { returnTo: 'BookActingDriverScreen' }); }}
                                                activeOpacity={0.8}
                                            >
                                                <Ionicons name="add-circle-outline" size={24} color={colors.black} />
                                                <Text style={[styles.addVehicleScrollText, { marginTop: 0 }]}>{t('add_vehicle', 'Add Vehicle')}</Text>
                                            </TouchableOpacity>
                                        );
                                    }

                                    const isSelected = actingDriverVehicle?._id === item._id;
                                    
                                    return (
                                        <TouchableOpacity
                                            style={[styles.vehicleScrollCard, isSelected && styles.vehicleScrollCardSelected]}
                                            onPress={() => {
                                                setActingDriverVehicle(item);
                                                if (item.maxSpeed) {
                                                    setActingDriverMaxSpeed(String(item.maxSpeed));
                                                }
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={[styles.vehicleScrollIconBg, isSelected && styles.vehicleScrollIconBgSelected]}>
                                                    <Ionicons
                                                        name={VEHICLE_TYPE_ICON[item.type] || 'car-outline'}
                                                        size={22}
                                                        color={isSelected ? colors.white : '#64748B'}
                                                    />
                                                </View>
                                                <View style={{ marginLeft: 12, flex: 1 }}>
                                                    <Text style={[styles.vehicleScrollReg, isSelected && styles.vehicleScrollRegSelected]} numberOfLines={1}>
                                                        {item.regNo}
                                                    </Text>
                                                    <Text style={[styles.vehicleScrollMeta, isSelected && styles.vehicleScrollMetaSelected]} numberOfLines={1}>
                                                        {item.make} {item.model}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}

                        {/* Fare breakdown details */}
                        {actingDriverVehicle && (
                            <View style={styles.paymentBreakdownCard}>
                                <AdaptiveText style={styles.breakdownTitle}>
                                    {t('fare_details', 'Fare Details')}
                                </AdaptiveText>
                                <View style={[styles.breakdownRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                                    <AdaptiveText style={styles.breakdownLabel}>
                                        {t('total_estimated_fare', 'Total Estimated Fare')}
                                    </AdaptiveText>
                                    <View style={{alignItems: 'flex-end'}}>
                                        {isEstimationLoading ? (
                                            <ActivityIndicator size="small" color={actingDriverColors.secondary} />
                                        ) : (
                                            <AdaptiveText style={[styles.breakdownValue, { fontSize: 16, fontFamily: Fonts.bold, color: actingDriverColors.primary }]}>
                                                {fareDisplay || `₹${(() => {
                                                    const dist = Number(rideDistance) || 0;
                                                    const dur = Number(estimatedDuration) || 0;
                                                    const type = actingDriverVehicle?.type || 'CAR';
                                                    const basePerKm = type === 'CAR' ? 15 : type === 'AUTO' ? 12 : type === 'BIKE' ? 6 : type === 'ELECTRIC_AUTO' ? 10 : type === 'SUV' ? 22 : 13;
                                                    const basePerMin = type === 'CAR' ? 1.2 : type === 'AUTO' ? 1.0 : type === 'BIKE' ? 0.5 : type === 'ELECTRIC_AUTO' ? 1.0 : type === 'SUV' ? 1.5 : 1.0;
                                                    const minFare = Math.max(15, Math.round(((dist * basePerKm) + (dur * basePerMin)) * 0.9));
                                                    const maxFare = Math.max(20, Math.round(((dist * basePerKm) + (dur * basePerMin)) * 1.1));
                                                    return `${minFare} - ₹${maxFare}`;
                                                })()}`}
                                            </AdaptiveText>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}
                        
                        {/* Driver Arrangement & Special Requirements */}
                        {/* <ActingDriverPreferences /> */}
                    </View>

                    <View style={{ height: 120 }} />
                </BottomSheetScrollView>
            </BottomSheetWrapper>

            {/* Coupon row */}
            <TouchableOpacity style={[styles.couponContainer, { bottom: layoutHeight }]} onPress={handleCouponPress}>
                {!couponCode ? (
                    <>
                        <FontAwesome6 name="percent" size={20} color={colors.black} />
                        <AdaptiveText style={styles.couponText}>{t('offer_coupons', 'Offer & Coupons')}</AdaptiveText>
                        <Icon name="chevron-right" size={20} color="#888" />
                    </>
                ) : (
                    <>
                        <FontAwesome6 name="percent" size={16} color={colors.grey_dark} />
                        <AdaptiveText>{t('coupon', 'Coupon')}</AdaptiveText>
                        <AdaptiveText style={[styles.couponText, { fontFamily: Fonts.semi_bold }]}>{couponCode}</AdaptiveText>
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
                                (!actingDriverVehicle || isBookingLoading || routeLoading?.loading) &&
                                    styles.confirmButtonDisabled,
                                isBookingLoading && { backgroundColor: actingDriverColors.primary },
                            ]}
                            onPress={handleConfirm}
                            disabled={!actingDriverVehicle || isBookingLoading || !!routeLoading?.loading}
                            activeOpacity={0.85}
                        >
                            <AdaptiveText style={styles.confirmButtonText}>
                                {isBookingLoading
                                    ? t('booking')
                                    : t('confirm_and_book', 'Confirm & Book')}
                            </AdaptiveText>
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
                            {t('booking_success_info', 'Acting driver booked. We will let you know once driver approved.')}
                        </AdaptiveText>

                        <TouchableOpacity
                            style={styles.doneButton}
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
        </>
    );
};

export default BookActingDriverScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // ── Bottom sheet header ──────────────────────────────────────────────────
    bottomSheetHeaderContainer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    bottomSheetHeader: {
        position: 'absolute',
        width: width,
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    confirmButton: {
        width: '100%',
        padding: 15,
        backgroundColor: actingDriverColors.success,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'white',
    },
    confirmButtonDisabled: {
        backgroundColor: colors.grey_light,
        opacity: 0.7,
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 14,
        fontFamily: Fonts.medium,
        textAlign: 'center',
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
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
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
    successModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconCircle: {
        marginBottom: 20,
    },
    successModalTitle: {
        fontSize: 22,
        fontFamily: Fonts.bold,
        color: actingDriverColors.secondary,
        marginBottom: 12,
        textAlign: 'center',
    },
    successModalSubtitle: {
        fontSize: 15,
        fontFamily: Fonts.regular,
        color: colors.grey_dark,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
        paddingHorizontal: 10,
    },
    doneButton: {
        backgroundColor: actingDriverColors.secondary,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.semi_bold,
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
