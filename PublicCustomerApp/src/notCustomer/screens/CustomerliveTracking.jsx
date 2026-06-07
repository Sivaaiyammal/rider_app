import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import { useStackScreenStore } from '../store/useStackScreenStore';
import locationTask from '../controllers/GetCurrentLocation';
import useMapStore from '../features/map/store/useMapStore';
import useLocationStore from '../store/useLocationStore';
import Marker from '../controllers/NEMap/Marker';
import useCurrentRideInfoStore from '../features/rideStatus/store/useCurrentRideInfoStore';
import useAssignedDriverInfoStore from '../features/rideStatus/store/useAssignedDriverInfoStore';

const CustomerLiveTracking = () => {
  const { goBack } = useStackScreenStore();
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(true);
  const [isCompletedStopsExpanded, setIsCompletedStopsExpanded] = useState(true);
  const [isUpcomingStopsExpanded, setIsUpcomingStopsExpanded] = useState(false);

  const {
    tripId,
    stops,
    estimatedFare,
    totalDistance,
    duration,
    finalDistance,
    finalDuration,
    otp,
    bills,
    finalFare
  } = useCurrentRideInfoStore();

  const {
    driverName,
    driverPhoto,
    rating: driverRating,
    phone,
    vehicleNumber,
    model: vehicleModel,
    brand: vehicleBrand,
    color: vehicleColor,
    driverMaxSpeed
  } = useAssignedDriverInfoStore();

  const getInitials = (name) => {
    if (!name) return 'D';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleCallDriver = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(err => console.warn('Could not place call', err));
    }
  };

  const totalStops = stops?.length || 0;
  const completedStops = stops?.filter(s => s.isReached || s.status === 'COMPLETED' || s.status === 'REACHED' || s.reachedTime) || [];
  const pendingStops = stops?.filter(s => !s.isReached && s.status !== 'COMPLETED' && s.status !== 'REACHED' && !s.reachedTime) || [];
  const completedPercent = totalStops > 0 ? Math.round((completedStops.length / totalStops) * 100) : 0;
  const completedStopsText = completedStops.map(s => s.name || s.address).slice(0, 3).join(', ');

  const nextStop = pendingStops[0];

  const billsArray = Array.isArray(bills) ? bills : [];
  const totalBillsAmount = billsArray.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Trip in Progress</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Ride ID: {tripId || 'N/A'}</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Icon name="help-circle-outline" size={16} color="#333" />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      {/* Map Overlays (Floats over the global map and Bottom Sheet) */}
      <View style={styles.mapOverlayTop} pointerEvents="box-none">
        <View style={styles.compactOverlayPill}>
          <Icon name="clock-outline" size={18} color="#4b48ab" />
          <View style={styles.compactOverlayTextGroup}>
            <Text style={styles.compactOverlayValue}>{duration ? `${duration} min` : 'N/A'}</Text>
            <Text style={styles.compactOverlayLabel}>est. duration</Text>
          </View>
        </View>
        <View style={styles.compactOverlayPill}>
          <Icon name="map-marker-distance" size={18} color="#00C853" />
          <View style={styles.compactOverlayTextGroup}>
            <Text style={styles.compactOverlayValue}>{completedPercent}%</Text>
            <Text style={styles.compactOverlayLabel}>completed</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.mapRightControls} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.locationControl}
          onPress={() => {
            locationTask.getCurrentLocation();
            const location = useLocationStore.getState().location;
            if (location) {
              // Extract lat/lng from location (assuming [lng, lat] format from useLocationStore)
              const lng = Array.isArray(location) ? location[0] : location.longitude;
              const lat = Array.isArray(location) ? location[1] : location.latitude;
              useMapStore.getState().setMapLocation({ lat, lng, zoom: 16 });
              
              // Ensure the user location pointer is visible
              const homeMarker = new Marker(
                'home-marker',
                'home-marker',
                lng,
                lat,
                'pin_inactive',
                36,
                true,
                0
              );
              homeMarker.setAnimate(true);
              homeMarker.setFocus(false);
              homeMarker.setDoRotation(false);
              
              const currentMarkers = useMapStore.getState().mapMarkers || [];
              const filteredMarkers = currentMarkers.filter(m => m.id !== 'home-marker');
              useMapStore.getState().setMapMarkers([...filteredMarkers, homeMarker]);
            }
          }}
        >
           <Icon name="crosshairs-gps" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.locationControl, {marginTop: 8}]}>
           <Icon name="layers-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapLeftControls} pointerEvents="box-none">
        <View style={styles.speedControlMap}>
           <Icon name="speedometer" size={16} color="#00C853" />
           <View style={{marginLeft: 6}}>
              <Text style={styles.speedLabel}>Live Speed</Text>
              <Text style={styles.speedValueMap}>{driverMaxSpeed != null ? `${Math.round(driverMaxSpeed)} km/h` : '0 km/h'}</Text>
           </View>
        </View>
      </View>

      {/* Bottom Sheet containing all scrollable details */}
      <BottomSheetWrapper
        snapPoints={['35%', '60%', '90%']}
        index={1}
        enablePanDownToClose={false}
        enableScroll={true}
      >
        <View style={styles.sheetContent}>
          
          {/* Driver Info Card */}
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.driverAvatar}>
                {driverPhoto ? (
                  <Image source={{ uri: driverPhoto }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                ) : (
                  <Text style={styles.driverInitials}>{getInitials(driverName)}</Text>
                )}
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName} numberOfLines={1}>{driverName || 'Your Driver'}</Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:4, marginTop: 4}}>
                  <Icon name="star" size={14} color="#FFD100" />
                  <Text style={styles.driverRatingText}>{driverRating || '4.8'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callDriverBtn} onPress={handleCallDriver}>
                <Icon name="phone" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Vehicle Info Card */}
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f0fa', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name="car-side" size={24} color="#4b48ab" />
              </View>
              <View style={{marginLeft: 12, flex: 1}}>
                <Text style={styles.vehiclePlateText}>{vehicleNumber || 'N/A'}</Text>
                <Text style={{fontSize: 14, color: '#666', marginTop: 2, fontWeight: '500'}}>{vehicleBrand ? `${vehicleBrand} ${vehicleModel || ''}` : vehicleModel || 'Vehicle'}</Text>
              </View>
            </View>
          </View>

          {/* Trip Itinerary */}
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => setIsItineraryExpanded(!isItineraryExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleRow}>
                <View style={styles.itineraryTitleIconWrapper}>
                   <Icon name="format-list-bulleted" size={16} color="#4b48ab" />
                </View>
                <Text style={styles.cardTitle}>Trip Itinerary</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.stopsBadge}>
                  <Text style={styles.stopsBadgeText}>{stops?.length || 0} stops</Text>
                </View>
                <Icon name={isItineraryExpanded ? "chevron-up" : "chevron-down"} size={24} color="#333" style={{marginLeft: 8}}/>
              </View>
            </TouchableOpacity>

            {isItineraryExpanded && (
              <View>
                {nextStop ? (
                  <View style={styles.itineraryDriving}>
                    <Icon name="bus" size={20} color="#4b48ab" />
                    <View style={styles.itineraryDrivingInfo}>
                      <Text style={styles.itineraryDrivingTitle}>Driving to next stop</Text>
                      <Text style={styles.itineraryDrivingSub}>{nextStop.name || nextStop.address || 'Next Stop'}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.itineraryDriving}>
                    <Icon name="check-circle-outline" size={20} color="#00C853" />
                    <View style={styles.itineraryDrivingInfo}>
                      <Text style={[styles.itineraryDrivingTitle, { color: '#00C853' }]}>All stops reached</Text>
                      <Text style={styles.itineraryDrivingSub}>Trip completed</Text>
                    </View>
                  </View>
                )}

                {completedStops.length > 0 && (
                  <TouchableOpacity 
                    style={styles.completedStops}
                    onPress={() => setIsCompletedStopsExpanded(!isCompletedStopsExpanded)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.completedCheckIcon}>
                       <Icon name="check" size={14} color="#00C853" />
                    </View>
                    <View style={styles.completedStopsInfo}>
                      <Text style={styles.completedStopsTitle}>
                        {completedStops.length} {completedStops.length === 1 ? 'stop' : 'stops'} completed{' '}
                        {completedStopsText ? <Text style={styles.completedStopsSub}>• {completedStopsText}</Text> : null}
                      </Text>
                    </View>
                    <Icon name={isCompletedStopsExpanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                  </TouchableOpacity>
                )}

                {isCompletedStopsExpanded && completedStops.length > 0 && (
                  <View style={styles.completedStopsList}>
                    {completedStops.map((stop, idx) => (
                      <View key={`completed-${idx}`} style={styles.stopItem}>
                        <View style={styles.stopIconContainer}>
                           <View style={styles.stopNumberCompleted}>
                             <Icon name="check" size={16} color="#00C853" />
                           </View>
                           <View style={styles.stopLineCompleted} />
                        </View>
                        <View style={styles.stopDetailsCompleted}>
                           <View style={styles.stopTitleRow}>
                              <Text style={styles.stopNameCompleted}>{stop.name || 'Stop'}</Text>
                              <View style={styles.visitBadge}><Text style={styles.visitText}>VISIT</Text></View>
                           </View>
                           {stop.arrivalTime ? <Text style={styles.stopTimeCompleted}>{stop.arrivalTime}</Text> : null}
                           <Text style={styles.stopAddressCompleted}>{stop.address || ''}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {pendingStops.map((stop, idx) => {
                  const stopNumber = completedStops.length + idx + 1;
                  const isFirstPending = idx === 0;
                  const isLastPending = idx === pendingStops.length - 1;
                  return (
                    <View key={`pending-${idx}`} style={styles.stopItem}>
                      <View style={styles.stopIconContainer}>
                         <View style={isFirstPending ? styles.stopNumberActive : styles.stopNumberUpcoming}>
                           <Text style={styles.stopNumberTextWhite}>{stopNumber}</Text>
                         </View>
                         {!isLastPending && <View style={styles.stopLine} />}
                      </View>
                      <View style={styles.stopDetails}>
                         <View style={styles.stopTitleRow}>
                            <Text style={styles.stopName}>{stop.name || 'Stop'}</Text>
                            <View style={styles.visitBadge}><Text style={styles.visitText}>VISIT</Text></View>
                         </View>
                         {stop.waitingTime ? <Text style={styles.stopTime}>Waiting: {stop.waitingTime} mins</Text> : null}
                         <Text style={styles.stopAddress}>{stop.address || ''}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Trip Summary */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <View style={styles.cardTitleRow}>
                  <View style={[styles.itineraryTitleIconWrapper, {backgroundColor: '#E3F2FD'}]}>
                     <Icon name="shield-check-outline" size={16} color="#1565C0" />
                  </View>
                  <Text style={styles.cardTitle}>Trip Summary</Text>
               </View>
            </View>
            <View style={styles.summaryGrid}>
               <View style={[styles.summaryItem, {backgroundColor: '#F5F9FF', flex: 1}]}>
                  <Text style={styles.summaryLabel}>Total Distance</Text>
                  <Text style={[styles.summaryValue, {color: '#1565C0'}]}>{totalDistance ? `${totalDistance} km` : 'N/A'}</Text>
               </View>
               <View style={[styles.summaryItem, {backgroundColor: '#F9F9F9', flex: 1}]}>
                  <Text style={styles.summaryLabel}>Total Duration</Text>
                  <Text style={styles.summaryValue}>{duration ? `${duration} mins` : 'N/A'}</Text>
               </View>
            </View>
            <View style={styles.summaryFooter}>
               <View style={styles.summaryFooterBadge}>
                 <View style={styles.completedCheckIconSmall}>
                    <Icon name="check" size={12} color="#FFF"/>
                 </View>
                 <Text style={styles.summaryFooterText}>Following planned route</Text>
               </View>
               <Text style={styles.summaryFooterTime}>• Updated just now</Text>
            </View>
          </View>

          {/* Fare Summary */}
          <View style={styles.card}>
             <View style={styles.cardHeader}>
               <View style={styles.cardTitleRow}>
                  <View style={[styles.itineraryTitleIconWrapper, {backgroundColor: '#FFF3E0'}]}>
                     <Icon name="cash-multiple" size={16} color="#F57C00" />
                  </View>
                  <Text style={styles.cardTitle}>Fare Summary</Text>
               </View>
             </View>
             <View style={styles.earningsGrid}>
                <View style={[styles.earningBox, {backgroundColor: '#FFF8E1', flex: 1}]}>
                   <Text style={styles.earningLabel}>Current Fare</Text>
                   <Text style={[styles.earningValue, {color: '#F57C00'}]}>₹{finalFare || estimatedFare || 'N/A'}</Text>
                </View>
             </View>
          </View>

          {/* Speed & Safety */}
          <View style={styles.card}>
             <View style={styles.cardHeader}>
               <View style={styles.cardTitleRow}>
                  <Icon name="speedometer" size={20} color="#00C853" />
                  <Text style={styles.cardTitle}>Speed & Safety</Text>
               </View>
               <View style={styles.monitoringBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.monitoringText}>Monitoring</Text>
               </View>
             </View>
             
             <View style={styles.speedInfoRow}>
                <View style={styles.speedCircleLarge}>
                   <Text style={styles.speedCircleValue}>{driverMaxSpeed != null ? Math.round(driverMaxSpeed) : '0'}</Text>
                   <Text style={styles.speedCircleUnit}>km/h</Text>
                </View>
                <View style={styles.speedDetails}>
                   <Text style={styles.speedDetailsTitle}>
                     {driverMaxSpeed > 60 ? 'Exceeding Speed Limit' : 'Driving within safe limits'}
                   </Text>
                   <Text style={styles.speedDetailsDesc}>Live speed is being monitored against road limits in real-time.</Text>
                   <View style={styles.speedLimitBox}>
                      <Icon name="alert-octagon" size={16} color="#D32F2F" />
                      <View style={{marginLeft: 8}}>
                         <Text style={styles.speedLimitLabel}>Speed Limit</Text>
                         <Text style={styles.speedLimitValue}>60 km/h</Text>
                      </View>
                   </View>
                </View>
             </View>
          </View>

          {/* Added Bills */}
          {billsArray.length > 0 && (
            <View style={styles.card}>
               <View style={styles.cardHeader}>
                 <View style={styles.cardTitleRow}>
                    <Icon name="receipt" size={20} color="#00C853" />
                    <Text style={styles.cardTitle}>Added Bills</Text>
                 </View>
                 <View style={styles.totalBillsBadge}>
                    <Text style={styles.totalBillsText}>Total ₹{totalBillsAmount}</Text>
                 </View>
               </View>

               {billsArray.map((bill, idx) => (
                 <View key={`bill-${idx}`} style={styles.billItem}>
                    <View style={styles.billIcon}><Icon name="receipt" size={20} color="#666"/></View>
                    <View style={styles.billDetails}>
                       <Text style={styles.billTitle}>{bill.name || 'Expense'}</Text>
                       {bill.remarks ? <Text style={styles.billSub}>{bill.remarks}</Text> : null}
                    </View>
                    <View style={styles.billRight}>
                       <Text style={styles.billAmount}>₹{bill.amount}</Text>
                    </View>
                 </View>
               ))}
            </View>
          )}

        </View>
      </BottomSheetWrapper>

      {/* Floating Bottom Bar */}
      <View style={styles.floatingBottomBar}>
        <TouchableOpacity 
          style={[styles.floatingActionBtn, {backgroundColor: '#e8e8f8', borderColor: '#c0c0e8'}]}
          onPress={handleCallDriver}
        >
          <Icon name="phone-outline" size={20} color="#4b48ab" />
          <Text style={[styles.floatingActionBtnText, {color: '#4b48ab'}]}>Call Driver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.floatingActionBtn, {backgroundColor: '#f5f5f5', borderColor: '#e0e0e0'}]}>
          <Icon name="message-outline" size={20} color="#333" />
          <Text style={[styles.floatingActionBtnText, {color: '#333'}]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.floatingActionBtn, {backgroundColor: '#f5f5f5', borderColor: '#e0e0e0'}]}>
          <Icon name="headset" size={20} color="#333" />
          <Text style={[styles.floatingActionBtnText, {color: '#333'}]}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.floatingActionBtn, {backgroundColor: '#FFEBEE', borderColor: '#FFCDD2'}]}>
          <Icon name="alert-circle-outline" size={20} color="#D32F2F" />
          <Text style={[styles.floatingActionBtnText, {color: '#D32F2F'}]}>SOS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C853',
    marginRight: 4,
  },
  liveText: {
    color: '#00C853',
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  helpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  mapOverlayTop: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactOverlayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingVertical: 10,
    borderRadius: 24,
  },
  compactOverlayTextGroup: {
    marginLeft: 8,
  },
  compactOverlayValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  compactOverlayLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  mapRightControls: {
    position: 'absolute',
    right: 16,
    top: 180,
    alignItems: 'flex-end',
  },
  locationControl: {
    backgroundColor: '#FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLeftControls: {
    position: 'absolute',
    left: 16,
    top: 150,
  },
  speedControlMap: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingVertical: 8,
    borderRadius: 20,
  },
  speedValueMap: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  sheetContent: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#F8F9FE',
  },
  speedLabel: {
    fontSize: 10,
    color: '#666',
  },
  combinedInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  driverProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  vehicleInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  vehicleImage: {
    width: 64,
    height: 36,
    marginRight: 12,
  },
  vehiclePlateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  vehicleModelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4b48ab',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitials: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    marginRight: 6,
  },
  driverRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F1F1F',
    marginLeft: 2,
  },
  driverCarInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  viewDetailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#c0c0e8',
    borderRadius: 16,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b48ab',
  },
  callDriverBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#4b48ab',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itineraryTitleIconWrapper: {
    backgroundColor: '#e8e8f8',
    padding: 6,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    marginLeft: 12,
  },
  stopsBadge: {
    backgroundColor: '#e8e8f8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stopsBadgeText: {
    color: '#4b48ab',
    fontSize: 12,
    fontWeight: '700',
  },
  itineraryDriving: {
    flexDirection: 'row',
    backgroundColor: '#f0f0fa',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  itineraryDrivingInfo: {
    marginLeft: 12,
  },
  itineraryDrivingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b48ab',
  },
  itineraryDrivingSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  completedStops: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F9F9F9',
    marginBottom: 16,
  },
  completedCheckIcon: {
    backgroundColor: '#E8F5E9',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedStopsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  completedStopsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  completedStopsSub: {
    fontWeight: '400',
    color: '#888',
  },
  completedStopsList: {
    marginTop: -8,
    marginBottom: 16,
  },
  stopItem: {
    flexDirection: 'row',
    marginTop: 16,
  },
  stopIconContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 36,
  },
  stopNumberCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopLineCompleted: {
    width: 2,
    flex: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 4,
  },
  stopDetailsCompleted: {
    flex: 1,
    paddingBottom: 0,
  },
  stopNameCompleted: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginRight: 8,
  },
  stopTimeCompleted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginTop: 4,
  },
  stopAddressCompleted: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
    lineHeight: 18,
  },
  stopNumberActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4b48ab',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#e8e8f8',
  },
  stopNumberUpcoming: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4b48ab',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#e8e8f8',
  },
  stopNumberTextWhite: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stopLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  stopDetails: {
    flex: 1,
    paddingBottom: 16,
  },
  stopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    marginRight: 8,
  },
  visitBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  visitText: {
    color: '#00C853',
    fontSize: 10,
    fontWeight: '700',
  },
  dropBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dropText: {
    color: '#D32F2F',
    fontSize: 10,
    fontWeight: '700',
  },
  editIconBtn: {
    backgroundColor: '#f0f0fa',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b48ab',
    marginTop: 4,
  },
  stopAddress: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    lineHeight: 18,
  },
  showMoreStops: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#c0c0e8',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 16,
  },
  showMoreText: {
    color: '#4b48ab',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F1F1F',
    textAlign: 'center',
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  summaryFooterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedCheckIconSmall: {
    backgroundColor: '#00C853',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  summaryFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  summaryFooterTime: {
    fontSize: 12,
    color: '#888',
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  earningBox: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  earningLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  earningValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  viewDetailsLinkBtn: {},
  viewDetailsLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  monitoringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  monitoringText: {
    color: '#00C853',
    fontSize: 10,
    fontWeight: '600',
  },
  speedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  speedCircleLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedCircleValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  speedCircleUnit: {
    fontSize: 10,
    color: '#666',
  },
  speedDetails: {
    flex: 1,
    marginLeft: 16,
  },
  speedDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  speedDetailsDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    marginBottom: 8,
  },
  speedLimitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  speedLimitLabel: {
    fontSize: 10,
    color: '#D32F2F',
  },
  speedLimitValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D32F2F',
  },
  safetyStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FE',
    padding: 12,
    borderRadius: 12,
  },
  safetyStatBox: {
    flex: 1,
  },
  safetyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  safetyStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalBillsBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalBillsText: {
    color: '#F57C00',
    fontSize: 12,
    fontWeight: '600',
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  billDetails: {
    flex: 1,
    marginLeft: 12,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  billSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  billRight: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  addBillLink: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  addBillLinkText: {
    color: '#4b48ab',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  floatingActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  floatingActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default CustomerLiveTracking;
