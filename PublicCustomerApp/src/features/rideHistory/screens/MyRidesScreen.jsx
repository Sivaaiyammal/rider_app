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
const YourRidesScreen = ({fromBack=false}) => {
    const { t } = useTranslation();
    const [enableFetch, setEnableFetch] = useState(!fromBack);
    const { setStackScreen } = useStackScreenStore();
    const { Rides, setRides, setIsLoading, setError } = useRideHistoryStore();
    

    const [FilterTripType, setFilterTripType] = useState('');
    const [FilterStart, setFilterStart] = useState('');
    const [FilterEnd, setFilterEnd] = useState('');
    const [FilterPage, setFilterPage] = useState(1);
    const [FilterLimit] = useState(10);
    const [FilterMaxPages, setFilterMaxPages] = useState(FilterLimit);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [showLoadingToast, setShowLoadingToast] = useState(false);


    console.log("fromBack",fromBack)

    const HandleBackBtn = () => {
           setStackScreen('Home');
    }

    // Replace useQuery with normal API call
    const LoadRides = async () => {
        

        try {
            let payload = {
                tripStatus: FilterTripType || 'COMPLETED',
                page: FilterPage,
                limit: FilterLimit
            }
            
            // Only add date filters if they are provided
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
                let { trips, pagination } = data
                if (isLoadMore) {
                    setRides([...Rides, ...trips])
                } else {
                    setRides(trips)
                }
                setFilterMaxPages(pagination?.totalPages)
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
        console.log('DurationFilterCallback:', id, start, end);
        setFilterStart(start);
        setFilterEnd(end);
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
                    <Text style={yourRidesStyles.ridesContainerItemFare}>₹{ride?.fareDetails?.fare || '00'}</Text>
                </View>
                <View
                    style={yourRidesStyles.ridesContainerItemRight}
                >
                    <TripPersonVehicle 
                        usedScreen={'MyRides'}
                        driverName={ride?.driverInfo?.driverName} 
                        driverPhoto={ride?.driverInfo?.driverPhoto} 
                        vehicleType={ride?.driverInfo?.vehicleType} 
                        vehicleBrand={ride?.driverInfo?.vehicleBrand} 
                        vehicleModel={ride?.driverInfo?.vehicleModel} 
                        vehicleNumber={ride?.driverInfo?.vehicleNumber} 
                    />
                </View>
            </TouchableOpacity>
        )
    }

    const HandleRefresh = () => {
        setFilterPage(1);
        LoadRides();
    }

    const HandleLoadMore = () => {
        if (isRefreshing || FilterMaxPages < FilterPage) return;
        setIsLoadMore(true);
        setFilterPage(FilterPage + 1);
        LoadRides();
    }

    const dataProvider = React.useMemo(() => {
        return new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(Rides);
    }, [Rides]);

    const layoutProvider = React.useMemo(() => {
        return new LayoutProvider(
            index => 1,
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

    useEffect(() => {
        if(enableFetch){
            LoadRides();
        }
    }, [])

    useEffect(() => {
        // Load rides when filters change
        if(enableFetch){
            LoadRides();
        }else{
            setEnableFetch(true);
        }
    }, [FilterTripType, FilterStart, FilterEnd])

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