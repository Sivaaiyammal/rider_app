import { create } from 'zustand';
import { WINDOW_HEIGHT } from '../Constants/utils';

const useMapStore = create((set) => ({
    key: 1,

    mapShown: false,
    setMapShown: mapShown => set({ mapShown }),

    mapMarkers: [],
    setMapMarkers: markers => set({ mapMarkers: markers }),

    startNavigation: false,
    setStartNavigation: (startNavigation) => set({ startNavigation }),

    devices: [],
    setDevices: devices => set({ devices: [...devices] }),

    geometriesType: '',
    setGeometriesType: geometriesType => set({ geometriesType }),
    
    directionReadyCallback : null,
    setDirectionReadyCallback : (directionReadyCallback) => set({ directionReadyCallback }),

    directionPoints: null,
    setDirectionPoints: (directionPoints) => set({ directionPoints }),

    geoFenceMeters: 100,
    setGeoFenceMeters: geoFenceMeters => set({ geoFenceMeters }),

    geometries: [],
    setGeometries: geometries => set({ geometries }),

    mapReady: false,
    setMapReady: mapReady => set({ mapReady }),

    markerClickCallback: null,
    setMarkerClickCallback: callback => set({ markerClickCallback: callback }),

    mapClickCallback: null,
    setMapClickCallback: callback => set({ mapClickCallback: callback }),

    mapDblclickCallback: null,
    setMapDblclickCallback: callback => set({ mapDblclickCallback: callback }),

    mode: 'light',
    setMode: mode => set({ mode }),

    removeMarker: (id) => {
        set(state => {
            const newMarkers = state.mapMarkers.filter(marker => marker.id !== id)
            return { mapMarkers: newMarkers }
        })
    },
    addMarker: (marker) => {
        set(state => {
            return { mapMarkers: [...state.mapMarkers, marker] }
        })
    },
    mapLocation: {
        lat: 13.067439,
        lng: 80.237617,
        zoom: 15
    },
    setMapLocation: mapLocation => {
        set(state => {
            const newKey = state.key + 1;
            return {
                mapLocation: { ...mapLocation, key: newKey },
                key: newKey
            };
        });
    },


    reset: () => {
        set({
            mapMarkers: [],
            key: 1,
            mapLocation: { lat: 13.067439, lng: 80.237617, zoom: 15 }
        });
    }
}));

export default useMapStore;
