import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useQuery } from "@apollo/client";
import useUserInfoStore from '../../../store/useUserInfoStore';
import LocationGetGraphqlQuery from '../../../core/location/LocationGetGraphqlQuery';
import NavBar from '../../../components/NavBar';
import { useStackScreenStore } from '../../../store/useStackScreenStore';
import { colors, Fonts } from '../../../constants/constants';
import processDataMobile from "../../../core/location/DataProcessorMobile";
import polyline from '@mapbox/polyline';

const TestScreen = ({ tripId, startTime, endTime, token, enabled = true }) => {
  const { userdetails } = useUserInfoStore();
  const [gpsDistance, setGpsDistance] = useState(0);
  const [gpsDuration, setGpsDuration] = useState(0);
  const [gpsMinutes, setGpsMinutes] = useState(0);
  const query = useMemo(() => 
    LocationGetGraphqlQuery(tripId, false, startTime, endTime), 
    [tripId, startTime, endTime]
  );


 
  const { data, loading, error } = useQuery(query, {
    skip: !enabled,
    context: {
      headers: {
        authorization: ("Bearer " + userdetails?.token) || "",
      },
    },
    cacheTime: 5000 //180000, // 3 minutes in milliseconds
  });

  useEffect(() => {
    if (data) {
      // console.log('GraphQL Data received:', data);
      const processedData = processDataMobile({ data: data.getRecentLocations, options: { range: { start: startTime, end: endTime }, mergeLngLats: true } });
      if(processedData?.data?.lngLats){
        console.log('Processed data:', processedData.data.lngLats);
        const ppolyline = polyline.encode(processedData.data.lngLats);
        console.log('Polyline:', ppolyline);
    }
    const totalDistance = processedData?.data?.sessions!=0 ? processedData?.data?.sessions?.reduce((acc, session) => acc + (session[5] || 0), 0) : [];
    const times = processedData?.data?.times || [];
    const totalDuration = times.length > 1 ? times[times.length - 1] - times[0] : 0;
    const minutes = Math.floor(totalDuration / 60000);
    setTotalDistance(totalDistance);
    setTotalDuration(totalDuration);
    setTotalMinutes(minutes);
    
    }
  }, [data]);

  return {
    totalDistance,
    totalDuration,
    totalMinutes, 
    loading,
    error,
    data,
  }
};

export default TestScreen;    