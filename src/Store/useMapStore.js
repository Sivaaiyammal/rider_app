import { create } from 'zustand';
import { WINDOW_HEIGHT } from '../Constants/utils';

const useMapStore = create((set) => ({
    mapHeight: WINDOW_HEIGHT,
    setMapHeight: (mapHeight) => set({ mapHeight }),
    showMap: true,
    setShowMap: (showMap) => set({ showMap }),
    directionPoints: null,
    setDirectionPoints: (directionPoints) => set({ directionPoints }),
    startNavigation: false,
    setStartNavigation: (startNavigation) => {
        console.log("SET START NAV CALLED")
        set({ startNavigation })
    },
    tripView: false,
    setTripView: (tripView) => set({ tripView }),
    mapReady: false,
    setMapReady: (mapReady) => set({ mapReady}),
    directionReady: false,
    setDirectionReady: (directionReady) => set({ directionReady }),
    markers: [],
    setMarkers: (markers) => set({ markers }),
    addMarker: (marker) => {
        set(state => {
            let markers = [...state.markers];
            const existingMarkerIndex = markers.findIndex(m => m.id === marker.id);

            if (existingMarkerIndex !== -1) {
                markers[existingMarkerIndex] = marker;
            } else {
                markers.push(marker);
            }

            return { markers };
        });
    },
    clickedLocation: null,
    setClickedLocation: (clickedLocation) => set({ clickedLocation }),
}));

export default useMapStore;
