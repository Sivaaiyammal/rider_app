import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import useMapStore from "../../Store/useMapStore";
import Marker from '../../Constants/NEMap/Marker';

import DirectionIcon from '../../Assets/Icons/directionIcon.svg';
import { useStackScreenStore } from '../../Store/useStackScreen';

const TargetLocation = ({ data }) => {
    const [locationDetails, setLocationDetails] = useState([]);
    const { setMapMarkers, setMapLocation } = useMapStore();
    const { setStackScreen } = useStackScreenStore();
    const { address, name, coordinates } = data;

    const closeBottomSheet = () => {
        setMapMarkers([]);
        setStackScreen('Home')
    }

    useEffect(() => {

        let locationDetails = [{
            name: 'Open Now',
            icon: 'clock-o',
            value: '12:00',
        }, {
            name: 'Star Rating',
            icon: 'star',
            value: '4.5',
        }, {
            name: 'Distance',
            icon: 'map-marker',
            value: '1234',
        }];

        if (coordinates) {
            const marker = new Marker(
                String(new Date().getTime() + Math.random()),
                'Location',
                coordinates[0],
                coordinates[1],
                'marker_start',
                36
            )

            setMapMarkers([marker]);
            setMapLocation({
                lat: coordinates[1],
                lng: coordinates[0],
                zoom: 15
            });
        }

        setLocationDetails(locationDetails);

    }, [data]);

    const shareLocation = () => {

        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`);
    }

    const saveLocation = () => {

    }



    return (
        <View style={styles.selectLocationContainer}>
            <View style={styles.locationContainer}>
                <Text style={styles.locationName}>{name}</Text>
                <Icon name='close' size={20} color='#212121' onPress={closeBottomSheet} />
            </View>
            <Text style={styles.subName}>{address}</Text>
            <View style={styles.locationDetailsContainer}>
                {locationDetails.map((item, index) => (
                    <View key={index} style={[
                        styles.locationDetailsContainer, {
                            flexDirection: 'column',
                            borderRightWidth: index === locationDetails.length - 1 ? 0 : 1,
                            borderRightColor: '#e0e0e0',
                            paddingHorizontal: 10
                        }]}>
                        <Icon name={item.icon} size={20} color='#e0e0e0' />
                        <Text style={styles.locationDetailsName}>{item.name}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.locationActions}>
                <TouchableOpacity 
                    style={[styles.locationAction, { backgroundColor: '#3087eb' }]}
                    onPress={() => setStackScreen('Directions', data)}
                >
                    <DirectionIcon />
                    <Text style={{ color: '#fff' }}>Direction</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.locationAction, { borderColor: '#3087eb' }]}>
                    <Icon name='bookmark-o' size={20} color='#3087eb' />
                    <Text style={{ color: '#3087eb' }}>Saved</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.locationAction, { borderColor: '#3087eb' }]}
                    onPress={shareLocation}
                >
                    <Icon name='share' size={20} color='#3087eb' />
                    <Text style={{ color: '#3087eb' }}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    selectLocationContainer: {
        padding: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 10,
        color: '#212121',
    },
    subName: {
        fontSize: 12,
        marginLeft: 10,
        color: 'gray',
        fontStyle: 'italic',
    },
    locationDetailsContainer: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    locationDetailsName: {
        // marginLeft: 10,
        fontSize: 12,
        color: '#212121',
    },
    locationActions: {
        flexDirection: 'row',
        margin: 5,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    locationAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 25,
    },
});

export default TargetLocation;