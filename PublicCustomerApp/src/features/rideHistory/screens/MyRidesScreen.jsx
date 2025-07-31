import { Dimensions, Text, Image, TextInput, TouchableOpacity, View, ActivityIndicator, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
const { width: windowWidth } = Dimensions.get('window');

import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import { yourRidesStyles } from '../../../styles/YourRidesStyles';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { showNotification } from '../../../components/NotificationManger';
// Remove useQuery import
// import { useGetQuery } from '../../../hooks/useQuery';
import useUserInfoStore from '../../../store/useUserInfoStore';
import { utils } from '../../../utils/Utils';
// Add the API endpoint import
import { getCustomerTrips } from '../../../API/EndPoints/EndPoints';

import NavBar from '../../../components/NavBar';
import ToggleHeader from '../../../components/ToggleHeader';
import DurationFilter from '../../../components/DurationFilter';

import NoTripsFound from '../../../components/NoTripsFound';

import ProfileImage from '../../../assets/image/account/Profile.webp';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import TripPersonVehicle from '../components/TripPersonVehicle';
const YourRidesScreen = () => {
    const navigation = useNavigation();
    const { setStackScreen } = useStackScreenStore();

    const { userdetails , setUserdetails} = useUserInfoStore();

    const [UserId, setUserId] = useState('');

    const [Rides, setRides] = useState([
        {
            bookingTime: 1726120926843,
            _id: 123,
            fare: 100,
            distance: 10,
            duration: 20,
            trip_type: 'pickup',
            driver_profile: '',
            driver_name: 'John Doe',
            vehicleType: 'bike',
            startLocation: {
                address: 'Kolkata'
            },
            endLocation: {
                address: 'Kolkata'
            },
        },
    ]);

    const [FilterTripType, setFilterTripType] = useState('');
    const [FilterStart, setFilterStart] = useState('');
    const [FilterEnd, setFilterEnd] = useState('');
    const [FilterPage, setFilterPage] = useState(1);
    const [FilterLimit, setFilterLimit] = useState(10);
    const [FilterMaxPages, setFilterMaxPages] = useState(FilterLimit);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadMore, setIsLoadMore] = useState(false);

    const [Header_Options, setHeader_Options] = useState([
        {
            id: 'completed',
            title: 'Trip History',
        },
        {
            id: 'upcoming',
            title: 'Upcoming Rides',
        }
    ])

    const HandleBackBtn = () => {
           setStackScreen('Home');
    }

    // Replace useQuery with normal API call
    const LoadRides = async () => {
        console.log('LoadRides');

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
                showNotification('Failed to get rides', data.message, 'danger');
            }
        } catch (error) {
            console.error('Error loading rides:', error);
            showNotification('Failed to get rides', 'Network error occurred', 'danger');
        } finally {
            setIsRefreshing(false);
            setIsLoadMore(false);
        }
    }

    const ToggleHeaderCallback = (id) => {
        setFilterTripType(id);
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
                    <Text style={yourRidesStyles.ridesContainerItemTitle}>{utils.formateDateLabel(ride.bookingTime)}</Text>
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
        LoadRides();
    }, [])

    useEffect(() => {
        // Load rides when filters change
        LoadRides();
    }, [FilterTripType, FilterStart, FilterEnd])

    return (
        <View style={yourRidesStyles.mainContainer}>
            <NavBar withBg onBackPress={HandleBackBtn} title={'Your Rides'} />

            <ToggleHeader
                options={Header_Options}
                callback={ToggleHeaderCallback}
            />
            <DurationFilter
                callback={DurationFilterCallback}
            />
            <View
                style={yourRidesStyles.ridesContainerItems}
            >
                {
                    isRefreshing ? (
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            flex: 1
                        }}>
                            <ActivityIndicator size="large" color="#2785ff" />
                        </View>
                    ) :

                        !Rides || Rides.length == 0 ?
                            <NoTripsFound text="No Trips Found" /> :

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
        </View>
    )
}

export default YourRidesScreen;