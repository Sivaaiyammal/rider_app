import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const OnRideScreen = () => {
  // Dummy data
  const driver = {
    name: 'John Doe',
    photo: 'https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg',
  };
  const vehicle = {
    brand: 'Maruti Suzuki',
    model: 'Swift Dzire',
    color: 'White',
    number: 'TN 01 AB 1234',
    image: 'https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg',
  };
  const stops = [
    { label: 'Home', address: '1, Kambar Street, Alandur, Chennai...', icon: '🏠' },
    { label: 'Virtualmaze', address: '12, Kambar Street, OMR, Chennai...', icon: '📍' },
  ];
  return (
    <View style={styles.root}>
      {/* Top info bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Reach your destination in</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>28:30 Mins · 15 Km</Text>
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Vehicle and driver images */}
        <View style={styles.imagesRow}>
          <Image source={{ uri: vehicle.image }} style={styles.vehicleImg} />
          <View style={styles.driverImgWrap}>
            <Image source={{ uri: driver.photo }} style={styles.driverImg} />
          </View>
          <View style={styles.onRideBadge}><Text style={styles.onRideBadgeText}>On Ride</Text></View>
        </View>
        {/* Driver and vehicle info */}
        <Text style={styles.driverName}>{driver.name}</Text>
        <Text style={styles.vehicleDesc}>{vehicle.brand} {vehicle.model} · {vehicle.number}</Text>
        {/* Estimated amount */}
        <View style={styles.amountBox}>
          <Text style={styles.amountIcon}>🧾</Text>
          <Text style={styles.amountLabel}>Estimated Amount to be Paid</Text>
          <Text style={styles.amountValue}>₹120</Text>
        </View>
        {/* Ride info */}
        <View style={styles.rideInfoRow}>
          <View style={styles.rideInfoItem}>
            <Text style={styles.rideInfoLabel}>Arrival</Text>
            <Text style={styles.rideInfoValue}>3:20 PM</Text>
          </View>
          <View style={styles.rideInfoItem}>
            <Text style={styles.rideInfoLabel}>Duration</Text>
            <Text style={styles.rideInfoValue}>30 Min</Text>
          </View>
          <View style={styles.rideInfoItem}>
            <Text style={styles.rideInfoLabel}>Distance</Text>
            <Text style={styles.rideInfoValue}>15 Km</Text>
          </View>
        </View>
        {/* Stops */}
        <View style={styles.stopsBox}>
          {stops.map((stop, idx) => (
            <View key={idx} style={styles.stopRow}>
              <Text style={styles.stopIcon}>{stop.icon}</Text>
              <View>
                <Text style={styles.stopLabel}>{stop.label}</Text>
                <Text style={styles.stopAddress}>{stop.address}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* Payment method */}
        <TouchableOpacity style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Change Payment Method</Text>
          <View style={styles.paymentValueWrap}>
            <Text style={styles.paymentValue}>Cash</Text>
            <Text style={styles.paymentArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 0,
    alignItems: 'center',
  },
  topBar: {
    backgroundColor: '#174EA6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
  },
  topBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  timeBox: {
    backgroundColor: '#04713B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: -20,
    width: '92%',
    alignSelf: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  vehicleImg: {
    width: 60,
    height: 40,
    resizeMode: 'contain',
    marginRight: -20,
    zIndex: 1,
  },
  driverImgWrap: {
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 32,
    overflow: 'hidden',
    marginLeft: -10,
    marginRight: 8,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  driverImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onRideBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  onRideBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  driverName: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 4,
  },
  vehicleDesc: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  amountBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 8,
  },
  amountIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  amountLabel: {
    color: '#333',
    fontSize: 14,
    flex: 1,
  },
  amountValue: {
    color: '#04713B',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 8,
  },
  rideInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  rideInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  rideInfoLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  rideInfoValue: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  stopsBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stopIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 2,
  },
  stopLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  stopAddress: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
    maxWidth: 220,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
  },
  paymentLabel: {
    color: '#222',
    fontSize: 16,
    fontWeight: '500',
  },
  paymentValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentValue: {
    color: '#04713B',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
  paymentArrow: {
    color: '#888',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -2,
  },
});

export default OnRideScreen;
