import { useEffect } from "react";
import NEMap from "../Components/Native/NEMap";
import useMapStore from "../Store/useMapStore";
import { View } from "react-native";
// import useUserStore from "../store/userStore";
import { DataStore } from "../Constants/DataStore";
import FullScreenLoader from "../Components/Loaders/FullScreenLoader";


export default function Map() {
    const { showMap, mapHeight, directionPoints, startNavigation, setMapReady, mapReady, setDirectionReady, markers,setClickedLocation } = useMapStore()
    // const { setCurrentLocation } = useUserStore()


    useEffect(() => {
        DataStore.loadData('currentLocation').then(res => {
            if (res.status) setCurrentLocation(res.data)
        }).catch(() => { })
    }, [])

    const onUserLocationChange = async (data) => {
        const location = [data.latitude, data.longitude]
        // setCurrentLocation(location)
        DataStore.storeData('currentLocation', location)
    }

    const onMapReady = async () => {
        setMapReady(true)
    }

    const mapStyle = {
        ...{
            width: "100%",
            height: showMap ? mapHeight : 1,
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1
        },
    }

    const onMapClick = (data) =>{
        console.log('onmapclick')
        setClickedLocation(data)
    }

    return <View style={{ position: 'relative' }}>
        {
            !mapReady && <FullScreenLoader showBG={false} message="Setting Up Map" />
        }

        <NEMap
            mapStyle={mapStyle}
            findRoute={directionPoints}
            navigation={startNavigation}
            onUserLocationChange={onUserLocationChange}
            onDirectionReady={() => setDirectionReady(true)}
            onMapReady={onMapReady}
            markers={markers}
            onMapClick={onMapClick}
        />
    </View>
}