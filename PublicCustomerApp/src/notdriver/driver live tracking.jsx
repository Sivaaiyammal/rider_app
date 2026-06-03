import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const DriverLiveTracking = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
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
          <Text style={styles.headerSubtitle}>Trip ID: NT45892 • Acting Driver</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Icon name="help-circle-outline" size={16} color="#333" />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapOverlay}>
            <View style={styles.mapInfoBox}>
              <Text style={styles.mapNextStop}>Next stop</Text>
              <Text style={styles.mapTimeText}>18 min <Text style={styles.mapDistance}>• 12.4 km</Text></Text>
            </View>
            <View style={styles.mapProgressCircle}>
              <Text style={styles.mapProgressText}>42%</Text>
            </View>
          </View>
          {/* Speed & Alerts on Map */}
          <View style={styles.mapBottomControls}>
             <View style={styles.speedControl}>
                <View style={styles.speedRow}>
                   <Icon name="speedometer" size={16} color="#00C853" />
                   <Text style={styles.speedLabel}>Your Speed</Text>
                </View>
                <Text style={styles.speedValue}>62 km/h</Text>
             </View>
             <View style={styles.alertControl}>
                <Icon name="alert-triangle" size={16} color="#D32F2F" />
                <Text style={styles.alertText}>2</Text>
             </View>
             <TouchableOpacity style={styles.locationControl}>
                <Icon name="crosshairs-gps" size={20} color="#333" />
             </TouchableOpacity>
          </View>
        </View>

        {/* Driver Profile */}
        <View style={styles.driverProfileCard}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitials}>AS</Text>
          </View>
          <View style={styles.driverInfo}>
            <View style={styles.driverNameRow}>
              <Text style={styles.driverName}>Arjun Sharma</Text>
              <Icon name="star" size={14} color="#5E35B1" />
              <Text style={styles.driverRating}>4.8</Text>
            </View>
            <Text style={styles.driverPickup}>Pickup • Race Course</Text>
          </View>
          <TouchableOpacity style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callDriverBtn}>
            <Icon name="phone" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Trip Itinerary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon name="format-list-bulleted" size={20} color="#5E35B1" />
              <Text style={styles.cardTitle}>Trip Itinerary</Text>
            </View>
            <View style={styles.stopsBadge}>
              <Text style={styles.stopsBadgeText}>5 stops</Text>
            </View>
            <Icon name="chevron-up" size={20} color="#666" />
          </View>

          <View style={styles.itineraryDriving}>
            <Icon name="bus" size={20} color="#5E35B1" />
            <View style={styles.itineraryDrivingInfo}>
              <Text style={styles.itineraryDrivingTitle}>Driving to next stop</Text>
              <Text style={styles.itineraryDrivingSub}>Avinashi Road Shopping • ETA 18 min</Text>
            </View>
          </View>

          <View style={styles.completedStops}>
            <Icon name="check-circle" size={20} color="#00C853" />
            <View style={styles.completedStopsInfo}>
              <Text style={styles.completedStopsTitle}>2 stops completed</Text>
              <Text style={styles.completedStopsSub}>Nehru Park, Race Course</Text>
            </View>
            <Icon name="chevron-down" size={20} color="#666" />
          </View>

          {/* Stop 3 */}
          <View style={styles.stopItem}>
            <View style={styles.stopIconContainer}>
               <View style={styles.stopNumberActive}><Text style={styles.stopNumberTextWhite}>3</Text></View>
               <View style={styles.stopLine} />
            </View>
            <View style={styles.stopDetails}>
               <View style={styles.stopTitleRow}>
                  <Text style={styles.stopName}>Avinashi Road Shopping</Text>
                  <View style={styles.visitBadge}><Text style={styles.visitText}>VISIT</Text></View>
                  <View style={styles.navigatingBadge}><Icon name="navigation-variant" size={10} color="#00C853"/><Text style={styles.navigatingText}> NAVIGATING</Text></View>
               </View>
               <Text style={styles.stopTime}>05:00 PM - 05:30 PM</Text>
               <Text style={styles.stopAddress}>Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004</Text>
               <View style={styles.stopActions}>
                  <TouchableOpacity style={styles.navigatingBtn}>
                     <Icon name="navigation-variant" size={16} color="#FFF" />
                     <Text style={styles.navigatingBtnText}> Navigating</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editBtn}>
                     <Icon name="pencil" size={16} color="#5E35B1" />
                     <Text style={styles.editBtnText}> Edit</Text>
                  </TouchableOpacity>
               </View>
            </View>
          </View>

          {/* Stop 4 */}
          <View style={styles.stopItem}>
            <View style={styles.stopIconContainer}>
               <View style={styles.stopNumberUpcoming}><Text style={styles.stopNumberTextWhite}>4</Text></View>
            </View>
            <View style={styles.stopDetails}>
               <View style={styles.stopTitleRow}>
                  <Text style={styles.stopName}>Brookfields Mall</Text>
                  <View style={styles.visitBadge}><Text style={styles.visitText}>VISIT</Text></View>
               </View>
               <Text style={styles.stopTime}>05:45 PM - 06:00 PM</Text>
               <Text style={styles.stopAddress}>Brookfields, Coimbatore, Tamil Nadu 641001</Text>
               <View style={styles.stopActions}>
                  <TouchableOpacity style={styles.navigateBtn}>
                     <Icon name="navigation-variant" size={16} color="#FFF" />
                     <Text style={styles.navigateBtnText}> Navigate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editBtnOutline}>
                     <Icon name="pencil" size={16} color="#5E35B1" />
                     <Text style={styles.editBtnText}> Edit</Text>
                  </TouchableOpacity>
               </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.showMoreStops}>
            <Text style={styles.showMoreText}>Show 2 more stops</Text>
            <Icon name="chevron-down" size={16} color="#5E35B1" />
          </TouchableOpacity>
        </View>

        {/* Trip Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <View style={styles.cardTitleRow}>
                <Icon name="shield-check-outline" size={20} color="#5E35B1" />
                <Text style={styles.cardTitle}>Trip Summary</Text>
             </View>
          </View>
          <View style={styles.summaryGrid}>
             <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Distance Covered</Text>
                <Text style={styles.summaryValue}>48.3 km</Text>
             </View>
             <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={styles.summaryValue}>62.9 km</Text>
             </View>
             <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Duration</Text>
                <Text style={styles.summaryValue}>1h 14m</Text>
             </View>
          </View>
          <View style={styles.summaryFooter}>
             <Text style={styles.summaryFooterText}><Icon name="check" size={14} color="#00C853"/> Following planned route</Text>
             <Text style={styles.summaryFooterTime}>• Updated just now</Text>
          </View>
        </View>

        {/* Trip Earnings */}
        <View style={styles.card}>
           <View style={styles.cardHeader}>
             <View style={styles.cardTitleRow}>
                <Icon name="currency-rupee" size={20} color="#F57C00" />
                <Text style={styles.cardTitle}>Trip Earnings</Text>
             </View>
             <TouchableOpacity><Text style={styles.breakupText}>Breakup <Icon name="arrow-right" size={12} color="#F57C00"/></Text></TouchableOpacity>
           </View>
           <View style={styles.earningsGrid}>
              <View style={[styles.earningBox, {backgroundColor: '#F3E5F5'}]}>
                 <Text style={styles.earningLabel}>Your Earnings</Text>
                 <Text style={[styles.earningValue, {color: '#5E35B1'}]}>₹1,540</Text>
              </View>
              <View style={[styles.earningBox, {backgroundColor: '#F5F5F5'}]}>
                 <Text style={styles.earningLabel}>Trip Fare</Text>
                 <Text style={styles.earningValue}>₹1,810</Text>
              </View>
              <View style={[styles.earningBox, {backgroundColor: '#F5F5F5'}]}>
                 <Text style={styles.earningLabel}>Total Expenses</Text>
                 <Text style={styles.earningValue}>₹250</Text>
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
                 <Text style={styles.speedCircleValue}>62</Text>
                 <Text style={styles.speedCircleUnit}>km/h</Text>
              </View>
              <View style={styles.speedDetails}>
                 <Text style={styles.speedDetailsTitle}>Driving within safe limits</Text>
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
           
           <View style={styles.safetyStatsGrid}>
              <View style={styles.safetyStatBox}>
                 <Text style={styles.safetyStatLabel}>Alerts</Text>
                 <Text style={[styles.safetyStatValue, {color: '#F57C00'}]}><Icon name="alert-triangle" size={14}/> 3 times</Text>
              </View>
              <View style={styles.safetyStatBox}>
                 <Text style={styles.safetyStatLabel}>Trip Started</Text>
                 <Text style={styles.safetyStatValue}>03:15 PM</Text>
              </View>
              <View style={styles.safetyStatBox}>
                 <Text style={styles.safetyStatLabel}>Avg Speed</Text>
                 <Text style={styles.safetyStatValue}>54 km/h</Text>
              </View>
           </View>
        </View>

        {/* Trip Bills */}
        <View style={styles.card}>
           <View style={styles.cardHeader}>
             <View style={styles.cardTitleRow}>
                <Icon name="receipt" size={20} color="#00C853" />
                <Text style={styles.cardTitle}>Trip Bills</Text>
             </View>
             <TouchableOpacity style={styles.addBillBtnSmall}>
                <Text style={styles.addBillBtnText}>+ Add Bill</Text>
             </TouchableOpacity>
             <Icon name="chevron-up" size={20} color="#666" />
           </View>

           <View style={styles.billItem}>
              <View style={styles.billIcon}><Icon name="boom-gate" size={20} color="#666"/></View>
              <View style={styles.billDetails}>
                 <Text style={styles.billTitle}>Toll Fee</Text>
                 <Text style={styles.billSub}>Today, 03:40 PM • Krishnagiri Toll Plaza</Text>
              </View>
              <View style={styles.billRight}>
                 <Icon name="receipt" size={20} color="#E0E0E0" />
                 <Text style={styles.billAmount}>₹120</Text>
              </View>
           </View>

           <View style={styles.billItem}>
              <View style={styles.billIcon}><Icon name="parking" size={20} color="#666"/></View>
              <View style={styles.billDetails}>
                 <Text style={styles.billTitle}>Parking</Text>
                 <Text style={styles.billSub}>Today, 04:10 PM • Brookfields Mall Parking</Text>
              </View>
              <View style={styles.billRight}>
                 <Icon name="receipt" size={20} color="#E0E0E0" />
                 <Text style={styles.billAmount}>₹50</Text>
              </View>
           </View>

           <View style={styles.billItem}>
              <View style={styles.billIcon}><Icon name="bank-transfer" size={20} color="#666"/></View>
              <View style={styles.billDetails}>
                 <Text style={styles.billTitle}>Interstate Tax</Text>
                 <Text style={styles.billSub}>Today, 04:35 PM • Tamil Nadu Check Post</Text>
              </View>
              <View style={styles.billRight}>
                 <Icon name="receipt" size={20} color="#E0E0E0" />
                 <Text style={styles.billAmount}>₹80</Text>
              </View>
           </View>
           
           <TouchableOpacity style={styles.addBillLink}>
              <Text style={styles.addBillLinkText}>+ Add Bill / Receipt</Text>
           </TouchableOpacity>
        </View>

        {/* Vehicle Photos */}
        <View style={[styles.card, {marginBottom: 100}]}>
           <View style={styles.cardHeader}>
             <View style={styles.cardTitleRow}>
                <Icon name="camera" size={20} color="#5E35B1" />
                <Text style={styles.cardTitle}>Vehicle Photos</Text>
             </View>
             <View style={styles.photosBadge}>
                <Text style={styles.photosBadgeText}>3 / 4 added</Text>
             </View>
           </View>
           <View style={styles.photosGrid}>
              <View style={styles.photoBox}>
                 <Icon name="car" size={24} color="#E0E0E0" />
                 <Text style={styles.photoLabel}>Exterior</Text>
              </View>
              <View style={styles.photoBox}>
                 <Icon name="car-seat" size={24} color="#E0E0E0" />
                 <Text style={styles.photoLabel}>Interior</Text>
              </View>
              <View style={styles.photoBox}>
                 <Icon name="speedometer" size={24} color="#E0E0E0" />
                 <Text style={styles.photoLabel}>Odometer</Text>
              </View>
              <View style={styles.photoBoxActive}>
                 <Icon name="plus" size={24} color="#5E35B1" />
                 <Text style={[styles.photoLabel, {color: '#5E35B1'}]}>Add Photo</Text>
              </View>
           </View>
           <Text style={styles.photoFooterText}>Tap a tile to capture or upload • helps verify vehicle condition</Text>
        </View>

      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
         <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#F3E5F5'}]}>
            <Icon name="phone" size={20} color="#5E35B1" />
            <Text style={[styles.actionBtnText, {color: '#5E35B1'}]}>Call Rider</Text>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#E8F5E9'}]}>
            <Icon name="message-text" size={20} color="#00C853" />
            <Text style={[styles.actionBtnText, {color: '#00C853'}]}>Chat</Text>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#FFF3E0'}]}>
            <Icon name="navigation-variant" size={20} color="#F57C00" />
            <Text style={[styles.actionBtnText, {color: '#F57C00'}]}>Navigate</Text>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#FFEBEE'}]}>
            <Icon name="alert-octagon" size={20} color="#D32F2F" />
            <Text style={[styles.actionBtnText, {color: '#D32F2F'}]}>SOS</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#E0E0E0', // Placeholder for map
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapInfoBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 12,
  },
  mapNextStop: {
    fontSize: 12,
    color: '#666',
  },
  mapTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  mapDistance: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
  },
  mapProgressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#5E35B1',
  },
  mapProgressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E35B1',
  },
  mapBottomControls: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedControl: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedLabel: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  speedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  alertControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  alertText: {
    color: '#D32F2F',
    fontWeight: '700',
    marginLeft: 4,
  },
  locationControl: {
    backgroundColor: '#FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5E35B1',
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
    color: '#333',
    marginRight: 8,
  },
  driverRating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E35B1',
    marginLeft: 4,
  },
  driverPickup: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  viewDetailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    marginRight: 12,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5E35B1',
  },
  callDriverBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5E35B1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  stopsBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stopsBadgeText: {
    color: '#5E35B1',
    fontSize: 12,
    fontWeight: '600',
  },
  itineraryDriving: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  itineraryDrivingInfo: {
    marginLeft: 12,
  },
  itineraryDrivingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5E35B1',
  },
  itineraryDrivingSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  completedStops: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  completedStopsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  completedStopsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  completedStopsSub: {
    fontSize: 12,
    color: '#666',
  },
  stopItem: {
    flexDirection: 'row',
    marginTop: 16,
  },
  stopIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stopNumberActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberUpcoming: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5E35B1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberTextWhite: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stopLine: {
    width: 2,
    height: '100%',
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
    flexWrap: 'wrap',
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  visitBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  visitText: {
    color: '#00C853',
    fontSize: 10,
    fontWeight: '700',
  },
  navigatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  navigatingText: {
    color: '#00C853',
    fontSize: 10,
    fontWeight: '700',
  },
  stopTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5E35B1',
    marginTop: 4,
  },
  stopAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  stopActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  navigatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C853',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5E35B1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  navigatingBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  navigateBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
  },
  editBtnText: {
    color: '#5E35B1',
    fontSize: 14,
    fontWeight: '600',
  },
  showMoreStops: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    marginTop: 16,
  },
  showMoreText: {
    color: '#5E35B1',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    padding: 12,
    borderRadius: 8,
  },
  summaryFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C853',
    marginRight: 8,
  },
  summaryFooterTime: {
    fontSize: 12,
    color: '#666',
  },
  breakupText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  earningLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  earningValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#00C853',
  },
  speedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  speedCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  },
  speedDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  speedDetailsDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },
  speedLimitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    backgroundColor: '#F8F9FE',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  safetyStatBox: {
    alignItems: 'center',
  },
  safetyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  safetyStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  addBillBtnSmall: {
    marginRight: 'auto',
    marginLeft: 16,
  },
  addBillBtnText: {
    color: '#5E35B1',
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
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billDetails: {
    flex: 1,
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
    marginTop: 4,
  },
  addBillLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  addBillLinkText: {
    color: '#00C853',
    fontSize: 14,
    fontWeight: '600',
  },
  photosBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photosBadgeText: {
    color: '#5E35B1',
    fontSize: 12,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoBox: {
    width: '23%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBoxActive: {
    width: '23%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#5E35B1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FE',
  },
  photoLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
  },
  photoFooterText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default DriverLiveTracking;
