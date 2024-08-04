import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { FloatingAction } from "react-native-floating-action";
import Icon from 'react-native-vector-icons/FontAwesome';
import useMapStore from '../Store/useMapStore';

// Define the geographical bounds of your static view
const GEO_BOUNDS = {
    latTop: 85,      // Top latitude of your area
    latBottom: -85,  // Bottom latitude of your area
    lngLeft: -180,   // Left longitude of your area
    lngRight: 180,   // Right longitude of your area
};

// Convert latitude and longitude to x and y coordinates
const latLngToXY = (lat, lng, width, height) => {
    const x = ((lng - GEO_BOUNDS.lngLeft) / (GEO_BOUNDS.lngRight - GEO_BOUNDS.lngLeft)) * width;
    const y = ((GEO_BOUNDS.latTop - lat) / (GEO_BOUNDS.latTop - GEO_BOUNDS.latBottom)) * height;
    return { x, y };
};

const PositionBasedView = ({ latLng, setPositioningView }) => {
    const [coords, setCoords] = useState(latLng); // Example coordinates
    const { width, height } = Dimensions.get('window'); // Dimensions of the view
    const [floatingView, setFloatingView] = useState(false);
    const { mapMoving } = useMapStore();

    // Calculate position based on latitude and longitude
    const position = latLngToXY(coords.lat, coords.lng, width - 130, height + 130);

    console.log(position, width, height, "lknclkdns");

    const iconConfigs = [
        { name: "save", delay: 0 },
        { name: "map-marker", delay: 400 },
        { name: "direction", delay: 600 },
        { name: "3d", delay: 800 },
        { name: "close", delay: 1000 }
    ];

    const animatedValues = useRef(iconConfigs.map(() => ({
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0)
    }))).current;

    useEffect(() => {
        animatedValues.forEach((value, index) => {
            Animated.parallel([
                Animated.timing(value.opacity, {
                    toValue: 1,
                    duration: 1000,
                    delay: iconConfigs[index].delay,
                    useNativeDriver: true
                }),
                Animated.spring(value.scale, {
                    toValue: 1,
                    friction: 4,
                    delay: iconConfigs[index].delay,
                    useNativeDriver: true
                })
            ]).start();
        });

        setTimeout(() => {
            setFloatingView(true);
        }, 1000);

    }, []);

    console.log(mapMoving, "mapMoving");

    return (
        <>
            {floatingView && <View style={{
                position: 'absolute',
                left: position.x - 10,
                top: position.y - 210,
                zIndex: 1000,
            }}>
                {iconConfigs.map((icon, index) => (
                    <Animated.View
                        key={index}
                        style={{
                            opacity: animatedValues[index].opacity,
                            transform: [{ scale: animatedValues[index].scale }]
                        }}

                    >
                        <TouchableOpacity
                            style={styles.iconView}
                            onPress={() => {
                                if (icon.name === 'close') {
                                    setFloatingView(false);
                                    setPositioningView(false);
                                }
                            }}
                        >

                            <Icon
                                name={icon.name}
                                style={styles.icon}
                                size={18}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>}
            <TouchableOpacity
                style={[{
                    position: 'absolute',
                    left: position.x - 10,
                    top: position.y - 10,
                }]}
                onPress={() => alert('Marker Pressed!')}
            >
                <Text style={styles.markerText}>📍</Text>
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    markerText: {
        color: 'white',
        fontSize: 32,
    },
    iconView: {
        margin: 5,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00b0ff',
        borderRadius: 50,
    },
    icon: {
    },
});

export default PositionBasedView;
