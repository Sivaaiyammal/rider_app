import React, { useState, useEffect } from 'react';
import APIRequest from '../../../common/APIRequest';
import useUserStore from '../../../common/store/useUserStore';
import { useStackScreenStore } from '../../../common/store/useStackScreenStore';
import { useSelectedRouteStore } from '../../store/useTripsStore';
import { useTripAcceptStore } from '../../store/useTripAcceptStore';
import { useTranslation } from 'react-i18next';
import DriverCalendarView from './DriverCalendarView';
import { useMapMarkerStore } from '../../../common/store/useMapMarkerStore';
import useCurrentScreenStore from '../../../common/store/useCurrentScreenStore';
import Marker from '../../../common/map/Marker';
import publicrideDriverApi from '../../api/publicrideDriverApi';
import useActingDriverMediaStore from '../../store/useActingDriverMediaStore';

const DriverCalendarScreen = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserStore();
  const { setStackScreen } = useStackScreenStore();
  const { setSelectedTrip } = useSelectedRouteStore();
  const { setMapLocation, setMapMarkers } = useMapMarkerStore();
  const { setCurrentScreen } = useCurrentScreenStore();
  const { setUpComingTripDetails } = useTripAcceptStore();
  const resetDriverMedia = useActingDriverMediaStore(s => s.reset);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch trips for the entire month from API
  const fetchMonthTrips = async (date) => {
    try {
      setLoading(true);
      const api = new APIRequest();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const response = await api.request(
        `/publicrides/driver/v2/getTrips?page=1&limit=100&tripStatus=ALL&startTime=${firstDay.getTime()}&endTime=${lastDay.getTime()}`,
        'POST',
        {},
        userInfo?.token
      );

      if (response && response.success) {
        setTrips(response.trips || []);
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // Get trips for a specific date
  const getTripsForDate = (date) => {
    const dateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return trips.filter(trip => {
      const tripDate = new Date(trip.bookingTime);
      return (
        tripDate.getFullYear() === dateStr.getFullYear() &&
        tripDate.getMonth() === dateStr.getMonth() &&
        tripDate.getDate() === dateStr.getDate()
      );
    }).sort((a, b) => {
      // Sort acting driver trips first
      const aIsActing = a.isActingDriverTrip ? 0 : 1;
      const bIsActing = b.isActingDriverTrip ? 0 : 1;
      if (aIsActing !== bIsActing) return aIsActing - bIsActing;
      // Then sort by time
      return new Date(b.bookingTime) - new Date(a.bookingTime);
    });
  };

  // Derived state: trips for the selected date
  const selectedTrips = getTripsForDate(selectedDate);
  const selectedActingTrips = selectedTrips.filter(trip => trip.isActingDriverTrip).length;

  // Check if a date has acting driver trips
  const hasActingTrips = (date) => {
    return getTripsForDate(date).some(trip => trip.isActingDriverTrip);
  };

  // Handle date selection — accepts a full Date object from the week strip
  const handleDateSelect = (date) => {
    const selected = new Date(date);
    setSelectedDate(selected);
    // If the selected date is in a different month, update currentDate to trigger a re-fetch
    if (selected.getMonth() !== currentDate.getMonth() || selected.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  };

  // Navigate by week — prev week
  const handlePreviousMonth = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
    if (prev.getMonth() !== currentDate.getMonth() || prev.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(prev.getFullYear(), prev.getMonth(), 1));
    }
  };

  // Navigate by week — next week
  const handleNextMonth = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
    if (next.getMonth() !== currentDate.getMonth() || next.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  // Handle trip selection
  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setStackScreen('TripDetailScreen');
  };

  const handleStartTrip = async (trip) => {
    resetDriverMedia();
    setUpComingTripDetails(trip);
    setStackScreen('DriverPreTripOverview');

    try {
      // Accept the trip — backend emits actingDriverStarted to the customer,
      // which shows the Driver Assigned banner on their home screen.
      await publicrideDriverApi.acceptTrip({ tripId: trip._id }, userInfo?.token);

      const api = new APIRequest();
      const response = await api.request(
        `/publicrides/driver/v2/getTrips?page=1&limit=1&tripId=${trip._id}`,
        'POST',
        {},
        userInfo?.token
      );
      if (response && response.success && response.trips && response.trips.length > 0) {
        setUpComingTripDetails(response.trips[0]);
      }
    } catch (error) {
      console.error('Error in handleStartTrip:', error);
    }
  };

  const handleViewLocation = (location) => {
    const { lat, lng, address } = location;

    // Create marker
    const pickupMarker = new Marker(
      'pickup_location',
      'Pickup',
      lng,
      lat,
      'marker_start',
      48,
      true
    );
    pickupMarker.setTitle('Pickup Location');
    pickupMarker.setSnippet(address);

    setMapMarkers([pickupMarker]);
    setMapLocation({ lat, lng, zoom: 16 });
    setCurrentScreen('Map');
  };

  // Fetch trips on mount and whenever month changes
  useEffect(() => {
    fetchMonthTrips(currentDate);
  }, [currentDate]);
  return (
    <DriverCalendarView
      t={t}
      currentDate={currentDate}
      loading={loading}
      selectedDate={selectedDate}
      selectedTrips={selectedTrips}
      selectedActingTrips={selectedActingTrips}
      getTripsForDate={getTripsForDate}
      hasActingTrips={hasActingTrips}
      onDateSelect={handleDateSelect}
      onPreviousMonth={handlePreviousMonth}
      onNextMonth={handleNextMonth}
      onTripSelect={handleTripSelect}
      onStartTrip={handleStartTrip}
      onViewLocation={handleViewLocation}
      onRefresh={() => fetchMonthTrips(currentDate)}
    />
  );
};

export default DriverCalendarScreen;
