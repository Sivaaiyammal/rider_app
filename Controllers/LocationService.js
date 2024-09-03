// import Geolocation from 'react-native-geolocation-service';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

class LocationService {
    static latestLocation = null;

    static async checkLocationPermission() {
        const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

        if (result === RESULTS.GRANTED) {
            return true;
        } else {
            console.log("No permission")
            return this.requestLocationPermission();
        }
    }

    static async requestLocationPermission() {
        console.log("Requesting")
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

        if (result === RESULTS.GRANTED) {
            return true;
        } else {
            return false;
        }
    }

    static getLocation = () => {
        return new Promise(async (resolve, reject) => {
            const hasPermission = await this.checkLocationPermission();
    
            if (hasPermission) {
                Geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude:position.coords.latitude,
                            longitude:position.coords.longitude,
                        }
                        resolve(location);
                    },
                    (error) => {
                        console.log('Error while fetching location:', error);
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 30000, // Increase timeout if needed
                        maximumAge: 10,
                        distanceFilter: 1, // Minimum distance (in meters) for a location change to trigger an update
                        forceRequestLocation: true, // Force a one-time location request even if the location hasn't changed significantly
                        showLocationDialog: true, // Show a dialog prompting the user to enable location services
                    }
                );
            } else {
                console.log('No location permission');
                reject(new Error('No location permission'));
            }
        });
    };

    static watchLocation = (updateUserlocation) => {
        const options = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 1000,
            distanceFilter: 15,
        };

        if(this.latestLocation != null){
            updateUserlocation(this.latestLocation);
        }

        this.locationWatcher = Geolocation.watchPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                // You can do something with the updated location, such as updating state
                this.latestLocation = location;
                console.log("Location updated from watchLocation", location);
                updateUserlocation(location);
                this.handleLocationUpdate(location);
            },
            (error) => {
                console.log('Error while watching location:', error);
            },
            options
        );
    };

    static stopWatchingLocation = () => {
        if (this.locationWatcher) {
            // Geolocation.clearWatch(this.locationWatcher);
        }
    };

    static handleLocationUpdate = (location) => {
        // Handle the updated location, e.g., update state or trigger other actions
        console.log('Location updated:', location);
        // return location;
    };

    // static getLocation = () => {
    //     return new Promise(async (resolve, reject) => {
    //         const hasPermission = await this.checkLocationPermission();

    //         if (hasPermission) {
    //             this.watchLocation();
    //             // You can resolve the promise immediately or do other tasks here
    //             resolve();
    //         } else {
    //             console.log('No location permission');
    //             reject(new Error('No location permission'));
    //         }
    //     });
    // };
    
    
}

export default LocationService;