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
import DurationFilter from '../../../components/DurationFilter';
import NoTripsFound from '../../../components/NoTripsFound';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import TripPersonVehicle from '../components/TripPersonVehicle';
import RideItemSkeleton from '../components/RideItemSkeleton';
import LoadingToast from '../../../components/LoadingToast';
import { useRideHistoryStore } from '../store/useRideHistoryStore';
import { colors } from '../../../constants/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const YourRidesScreen = ({fromBack=false}) => {
    const { t } = useTranslation();
    const [enableFetch, setEnableFetch] = useState(!fromBack);
    const { setStackScreen } = useStackScreenStore();
    const { Rides, setRides } = useRideHistoryStore();
    

    const [FilterTripType, setFilterTripType] = useState('');
    const [FilterStart, setFilterStart] = useState('');
    const [FilterEnd, setFilterEnd] = useState('');
    const [FilterPage, setFilterPage] = useState(1);
    const [FilterLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(true);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [showLoadingToast, setShowLoadingToast] = useState(false);
    const [durationFilterSet, setDurationFilterSet] = useState(false);

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

    console.log("fromBack",fromBack)
    console.log("MyRidesScreen mounted with enableFetch:", enableFetch)

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
                
                console.log('Converted timestamps:', { startTime, endTime });
                payload.startTime = startTime;
                payload.endTime = endTime;
            }

            console.log('API Payload:', payload);
            setIsRefreshing(true);
            setShowLoadingToast(true);
            
            const data = await getCustomerTrips(payload);
            console.log('data', data);
            
            if (data.success) {
                let { trips, pagination } = data
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

    const DurationFilterCallback = (id, start, end) => {
        console.log('DurationFilterCallback called with:', { id, start, end });
        console.log('Setting duration filter and enabling fetch');
        setFilterStart(start);
        setFilterEnd(end);
        setDurationFilterSet(true);
        // Reset to first page when filter changes
        setFilterPage(1);
    }

    const HandleRideOpen = (ride) => {
        // Navigate to RideDetailScreen with ride data
       
        setStackScreen('RideDetailScreen', { TripData: ride });     
    }

    const RenderTrip = ({ ride, index }) => {
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
                    <Text style={yourRidesStyles.ridesContainerItemFare}>₹ {ride?.fareDetails?.fare?.toFixed(2)|| '00'} . </Text>
                    <Text style={[yourRidesStyles.ridesContainerItemStatus,ride?.status=="PAYMENT_COMPLETED"&&{color:'green'},ride?.status=="DIVERGED"&&{color:'yellow'},ride?.status=="CANCELLED"&&{color:'red'}]}>{utils.getShortRideStatus(ride?.status)}</Text>
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
        return <RenderTrip ride={data} index={index} />
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
        if(enableFetch && durationFilterSet){
            LoadRides();
        }
    }, [enableFetch, durationFilterSet, FilterStart, FilterEnd])

  

    useEffect(() => {
        // Load rides when filters change
        if(enableFetch && durationFilterSet){
            LoadRides();
        }else{
            setEnableFetch(true);
        }
    }, [FilterTripType])

    return (
        <View style={yourRidesStyles.mainContainer}>
            <NavBar withBg onBackPress={HandleBackBtn} title={t('your_rides')} />

            {/* <ToggleHeader
                options={Header_Options}
                callback={ToggleHeaderCallback}
            /> */}
            <DurationFilter
                callback={DurationFilterCallback}
            />
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
        </View>
    )
}

export default YourRidesScreen;