import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useDriverStatusStore from '../../store/useDriverStatusStore';
import { useStackScreenStore } from '../../../common/store/useStackScreenStore';
import { Colors, colors, Fonts } from '../../../common/constants/constants';
import { height } from '../../../common/utils/scalingutils';

const UpComingTrips = (props) => {
    const {onLayout} = props;
    const {upComingTrips} = useDriverStatusStore()
    const {setStackScreen} = useStackScreenStore();

    const layOutChange = (event) => {
        const {width, height} = event.nativeEvent.layout;
        onLayout(width, height);
    }

    if (!upComingTrips || upComingTrips.length === 0){
        return <></>
    }

  return (
    <View style={styles.container} onLayout={layOutChange}>
      <TouchableOpacity style={styles.upComingTrips} onPress={()=>setStackScreen('UpComingTripsList')}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="date-range" color={Colors.blue_xxdark || '#0F223C'} size={20} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.subtitleTxt}>SCHEDULED BOOKINGS</Text>
            <Text style={styles.upComingTripsTxt}>Upcoming Trips</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.badgeContainer}>
            <Text style={styles.upComingTripsLength}>{upComingTrips?.length}</Text>
          </View>
          <Feather name="arrow-right" color={Colors.blue_xxdark || '#0F223C'} size={20} />
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default UpComingTrips

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: height * 0.11,
        backgroundColor: Colors.white || '#FFFFFF',
        width: '94%',
        alignSelf: 'center',
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 0,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    upComingTrips: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.yellow_xlight || '#FFF7E5',
        borderWidth: 1,
        borderColor: Colors.grey_light || '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        justifyContent: 'center',
    },
    subtitleTxt: {
        fontSize: 9,
        fontFamily: Fonts.bold,
        color: Colors.grey_dark || '#9E9E9E',
        letterSpacing: 1.0,
        marginBottom: 2,
    },
    upComingTripsTxt: {
        fontSize: 16,
        fontFamily: Fonts.semi_bold,
        color: Colors.dark || '#0A0A0A',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    badgeContainer: {
        height: 24,
        minWidth: 24,
        borderRadius: 12,
        backgroundColor: Colors.yellow || '#FFD100',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    upComingTripsLength: {
        fontSize: 12,
        fontFamily: Fonts.bold,
        color: Colors.blue_xxdark || '#0F223C',
        textAlign: 'center',
    },
})

