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
            <MaterialIcons name="date-range" color={Colors.yellow} size={24} />
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
          <Feather name="arrow-right" color={Colors.yellow} size={20} />
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default UpComingTrips

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: height * 0.09,
        backgroundColor: Colors.blue_xxdark || '#0F223C',
        width: '90%',
        alignSelf: 'center',
        borderRadius: 26, // Perfect modern pill shape
        paddingVertical: 10, // Highly compact padding
        paddingHorizontal: 16,
        borderWidth: 1.2,
        borderColor: '#1E3A8A', // Deep blue neon accent border
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    upComingTrips: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16, // Matching circular design
        backgroundColor: 'rgba(255, 209, 0, 0.15)', // Premium gold glow
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        justifyContent: 'center',
    },
    subtitleTxt: {
        fontSize: 8,
        fontFamily: Fonts.bold,
        color: Colors.yellow || '#FFD100',
        letterSpacing: 1.0,
        marginBottom: 0,
    },
    upComingTripsTxt: {
        fontSize: 14, // Compact and highly readable
        fontFamily: Fonts.semi_bold,
        color: Colors.white,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badgeContainer: {
        height: 22,
        minWidth: 22,
        borderRadius: 11,
        backgroundColor: Colors.yellow || '#FFD100',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    upComingTripsLength: {
        fontSize: 11,
        fontFamily: Fonts.bold,
        color: Colors.blue_xxdark || '#0F223C',
        textAlign: 'center',
    },
})

