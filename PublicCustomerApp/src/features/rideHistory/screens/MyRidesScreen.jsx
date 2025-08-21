import { Dimensions, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
const { width: windowWidth } = Dimensions.get('window');

import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import { yourRidesStyles } from '../../../styles/YourRidesStyles';
import { showNotification } from '../../../components/NotificationManger';
import { utils } from '../../../utils/Utils';
import { getCustomerTrips } from '../../../API/EndPoints/EndPoints';

import NavBar from '../../../components/NavBar';
import NoTripsFound from '../../../components/NoTripsFound';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import TripPersonVehicle from '../components/TripPersonVehicle';
import RideItemSkeleton from '../components/RideItemSkeleton';
import LoadingToast from '../../../components/LoadingToast';
import { useRideHistoryStore } from '../store/useRideHistoryStore';
import { colors, Fonts } from '../../../constants/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DateTimeFormatter } from '../../../utils/DateTimeFormatter';
import PropTypes from 'prop-types';
import CalenderIcon from '../../../assets/image/calender.svg';
import DatePicker from 'react-native-date-picker';

const YourRidesScreen = () => {
    const { t } = useTranslation();
    const { setStackScreen } = useStackScreenStore();
    const { Rides, setRides } = useRideHistoryStore();
    

    const [FilterStart, setFilterStart] = useState('');
    const [FilterEnd, setFilterEnd] = useState('');
    const [FilterPage] = useState(1);
    const [FilterLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(true);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [showLoadingToast, setShowLoadingToast] = useState(false);
    const [durationFilterSet, setDurationFilterSet] = useState(false);
    // Custom date range state
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('start');
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('today');

    // Function to get today's date range
    const getTodayDateRange = () => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        
        return {
            start: startOfDay.getTime(),
            end: endOfDay.getTime()
        };
    };


    const HandleBackBtn = () => {
           setStackScreen('Home');
    }

    // Replace useQuery with normal API call
    const LoadRides = async () => {
        

        try {
            let payload = {
               
                page: FilterPage,
                limit: FilterLimit
            }
            
            // Only add date filters if they are provided
            console.log('Filter values in LoadRides:', { FilterStart, FilterEnd });
            if (FilterStart && FilterEnd) {
                // Convert ISO strings to milliseconds if they're not already timestamps
                let startTime, endTime;
                
                if (typeof FilterStart === 'string') {
                    // If it's an ISO string, convert to milliseconds
                    startTime = new Date(FilterStart).getTime();
                } else {
                    // If it's already a timestamp, use as is
                    startTime = FilterStart;
                }
                
                if (typeof FilterEnd === 'string') {
                    // If it's an ISO string, convert to milliseconds
                    endTime = new Date(FilterEnd).getTime();
                } else {
                    // If it's already a timestamp, use as is
                    endTime = FilterEnd;
                }
                
                
                payload.startTime = startTime;
                payload.endTime = endTime;
            }

            console.log('API Payload:', payload);
            setIsRefreshing(true);
            setShowLoadingToast(true);
            
            const data = await getCustomerTrips(payload);
            console.log('data', data);
            
            if (data.success) {
                let { trips } = data
                if (isLoadMore) {
                    setRides([...Rides, ...trips])
                } else {
                    setRides(trips)
                }
            } else {
                showNotification(t('failed_to_get_rides'), data.message, 'danger');
            }
        } catch (error) {
            console.error('Error loading rides:', error);
            showNotification(t('failed_to_get_rides'), t('network_error_occurred'), 'danger');
        } finally {
            setIsRefreshing(false);
            setIsLoadMore(false);
            setShowLoadingToast(false);
        }
    }


    const HandleRideOpen = (ride) => {
        // Navigate to RideDetailScreen with ride data
       
        setStackScreen('RideDetailScreen', { TripData: ride });     
    }

    const RenderTrip = ({ ride,Fare, index }) => {
        
        return (
            <TouchableOpacity
                key={`your-ride-${index}`}
                style={yourRidesStyles.ridesContainerItem}
                onPress={() => HandleRideOpen(ride)}
            >
                <View
                    style={yourRidesStyles.ridesContainerItemLeft}
                >
                    <View>
                    <Text style={yourRidesStyles.ridesContainerItemTitle}>{utils.formateDateLabel(ride.bookingTime, 'local')}</Text>
                    <Text style={yourRidesStyles.ridesContainerItemDesc}>
                        {Array.isArray(ride?.stops) && ride.stops.length > 0
                            ? ride.stops[ride.stops.length - 1]?.address || '--'
                            : '--'}
                    </Text>
                    </View>
                    <View style={yourRidesStyles.ridesContainerItemFareContainer}>
                    <Text style={yourRidesStyles.ridesContainerItemFare}>₹ {Fare?.toFixed(2)|| '00'} . </Text>
                    <Text style={[yourRidesStyles.ridesContainerItemStatus,ride?.status=="PAYMENT_COMPLETED"&&{color:'green'},ride?.status=="DIVERGED"&&{color:'orange'},ride?.status=="CANCELLED"&&{color:'red'}]}>{utils.getShortRideStatus(ride?.status)}</Text>
                    </View>
                </View>
                <View
                    style={yourRidesStyles.ridesContainerItemRight}
                >
                    <TripPersonVehicle 
                        usedScreen={'MyRides'}
                        driverName={ride?.driverInfo?.driverName} 
                        driverPhoto={ride?.driverInfo?.driverPhoto} 
                        vehicleType={ride?.vehicleType} 
                        vehicleBrand={ride?.driverInfo?.vehicleBrand} 
                        vehicleModel={ride?.driverInfo?.vehicleModel} 
                        vehicleNumber={ride?.driverInfo?.vehicleNumber} 
                    />
                </View>
              
                <Icon name="chevron-right" size={20} color={colors.dark} />
            </TouchableOpacity>
        )
    }

    RenderTrip.propTypes = {
		ride: PropTypes.shape({
			bookingTime: PropTypes.any,
			stops: PropTypes.array,
			status: PropTypes.string,
			driverInfo: PropTypes.object,
			vehicleType: PropTypes.string,
		}),
		Fare: PropTypes.number,
		index: PropTypes.number,
	};

  

    const dataProvider = React.useMemo(() => {
        return new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(Rides);
    }, [Rides]);

    const layoutProvider = React.useMemo(() => {
        return new LayoutProvider(
            () => 1,
            (type, dim) => {
                dim.width = windowWidth;
                dim.height = 180;
            }
        );
    }, []);

    const rowRenderer = React.useCallback((type, data, index) => {
        console.log("data",data)
        return <RenderTrip ride={data} Fare={data?.fareDetails?.fare} index={index} />
    }, []);

    const renderFooter = React.useMemo(() => {
        if (!isRefreshing) return null;
        return <ActivityIndicator size="large" color="#0000ff" />;
    }, [isRefreshing]);

    // Set default date filters to today when component mounts
    useEffect(() => {
        const todayRange = getTodayDateRange();
        setFilterStart(todayRange.start);
        setFilterEnd(todayRange.end);
        setDurationFilterSet(true);
    }, []);

    useEffect(() => {
        if(durationFilterSet){
            LoadRides();
        }
    }, [durationFilterSet, FilterStart, FilterEnd])

  


    // Handlers for custom date range
    const openDatePicker = (mode) => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    const handleDateChange = (date) => {
        if (datePickerMode === 'start') {
            setCustomStartDate(date);
        } else {
            setCustomEndDate(date);
        }
        setShowDatePicker(false);
    };

    const handleDatePickerCancel = () => {
        setShowDatePicker(false);
    };

    const handleCustomDateConfirm = () => {
        setShowCustomDatePicker(false);
        const startTimestamp = customStartDate.getTime();
        const endOfDay = new Date(customEndDate);
        endOfDay.setHours(23, 59, 59, 999);
        const endTimestampWithTime = endOfDay.getTime();
        setFilterStart(startTimestamp);
        setFilterEnd(endTimestampWithTime);
        setDurationFilterSet(true);
    };

    const handleCustomDateCancel = () => {
        setShowCustomDatePicker(false);
    };

    return (
        <View style={yourRidesStyles.mainContainer}>
            <NavBar withBg onBackPress={HandleBackBtn} title={t('your_rides')} />

            {/* <ToggleHeader
                options={Header_Options}
                callback={ToggleHeaderCallback}
            /> */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16,  gap: 12 }}>
                {[
                    { id: 'today', label: t('today'), getRange: DateTimeFormatter.getTodaysStartEndTime },
                    { id: 'week', label: t('week'), getRange: DateTimeFormatter.getThisWeekStartEndTime },
                    // { id: 'last_week', label: 'Last Week', getRange: DateTimeFormatter.getLastWeekStartEndTime },
                    { id: 'all', label: t('all'), getRange: null },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => {
                            if (tab.getRange) {
                                const [start, end] = tab.getRange();
                                setFilterStart(start);
                                setFilterEnd(end);
                            } else {
                                setFilterStart(null);
                                setFilterEnd(null);
                            }
                            setDurationFilterSet(true);
                            setActiveTab(tab.id);
                        }}
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: colors.grey_light,
                            borderRadius: 16,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            backgroundColor: activeTab === tab.id ? colors.black : colors.white,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ fontFamily: Fonts.medium, color: activeTab === tab.id ? colors.white : colors.black }}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
                {/* Calendar icon for custom date range */}
                <TouchableOpacity
                    onPress={() => setShowCustomDatePicker(true)}
                    style={{
                        borderWidth: 1,
                        borderColor: colors.grey_light,
                        borderRadius: 16,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: colors.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CalenderIcon width={20} height={20} />
                </TouchableOpacity>
            </View>
            <View
                style={yourRidesStyles.ridesContainerItems}
            >
                {
                    isRefreshing ? (
                        <View style={{
                            backgroundColor: 'white',
                            flex: 1
                        }}>
                            {Array.from({ length: 5 }, (_, index) => (
                                <RideItemSkeleton key={index} />
                            ))}
                        </View>
                    ) :

                        !Rides || Rides.length == 0 ?
                            <NoTripsFound text={t('no_trips_found')} /> :

                            <RecyclerListView
                                contentContainerStyle={{ paddingBottom: 150 }}
                                dataProvider={dataProvider}
                                layoutProvider={layoutProvider}
                                rowRenderer={rowRenderer}
                                renderFooter={renderFooter}
                                canChangeSize={true}
                                forceNonDeterministicRendering={true}
                                scrollViewProps={{
                                    showsHorizontalScrollIndicator: false,
                                    showsVerticalScrollIndicator: false
                                }}
                            />
                }
            </View>
            <LoadingToast 
                visible={showLoadingToast}
                onHide={() => setShowLoadingToast(false)}
            />
            {/* Custom Date Picker Modal */}
            {showCustomDatePicker && (
                <View style={{ position: 'absolute', zIndex: 1000, left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 24, width: '85%', maxWidth: 350 }}>
                        <Text style={{ fontSize: 18, fontFamily: Fonts.medium, color: colors.black, textAlign: 'center', marginBottom: 16 }}>{t('select_date_range')}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: colors.black, marginBottom: 8 }}>{t('from')}</Text>
                                <TouchableOpacity onPress={() => openDatePicker('start')} style={{ borderWidth: 1, borderColor: colors.grey_light, borderRadius: 8, padding: 12, backgroundColor: colors.white }}>
                                    <Text style={{ fontSize: 16, fontFamily: Fonts.regular, color: colors.black }}>{new Date(customStartDate).toDateString()}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={{ fontSize: 16, fontFamily: Fonts.medium, color: colors.black }}>{t('to')}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: colors.black, marginBottom: 8 }}>{t('to')}</Text>
                                <TouchableOpacity onPress={() => openDatePicker('end')} style={{ borderWidth: 1, borderColor: colors.grey_light, borderRadius: 8, padding: 12, backgroundColor: colors.white }}>
                                    <Text style={{ fontSize: 16, fontFamily: Fonts.regular, color: colors.black }}>{new Date(customEndDate).toDateString()}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity onPress={handleCustomDateCancel} style={{ flex: 1, backgroundColor: colors.grey_light, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, fontFamily: Fonts.medium, color: colors.black }}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCustomDateConfirm} style={{ flex: 1, backgroundColor: colors.black, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, fontFamily: Fonts.medium, color: colors.white }}>{t('confirm')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            <DatePicker
                modal
                open={showDatePicker}
                date={datePickerMode === 'start' ? customStartDate : customEndDate}
                mode="date"
                onConfirm={handleDateChange}
                onCancel={handleDatePickerCancel}
                maximumDate={new Date()}
            />
        </View>
    )
}

export default YourRidesScreen;