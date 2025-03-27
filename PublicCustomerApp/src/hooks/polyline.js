import { useMemo } from "react";

/**
 * @typedef {[number, number]} CoordArray - [lng, lat]
 */

/**
 * Calculate the distance between two points on Earth
 * @param {Object} a - First point with lng and lat properties
 * @param {Object} b - Second point with lng and lat properties
 * @returns {number} - Distance in meters
 */
const getDistance = (
  a,
  b
) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const aVal =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));

  return R * c;
};

/**
 * Hook to filter polyline based on current coordinates and maximum distance
 * @param {Array<CoordArray>} polyline - Array of coordinate pairs
 * @param {CoordArray} currentCoord - Current coordinates [lng, lat]
 * @param {number} maxDistance - Maximum distance in meters (default: 1000)
 * @returns {Array<CoordArray>|null} - Filtered polyline or null
 */
export const useFilteredPolyline = (
  polyline,
  currentCoord,
  maxDistance = 1000
) => {
  return useMemo(() => {
    if (!polyline || polyline.length === 0) return null;

    const current = { lng: currentCoord[0], lat: currentCoord[1] };

    let closestIndex = -1;
    let minDistance = Infinity;

    polyline.forEach(([lng, lat], index) => {
      const point = { lng, lat };
      const dist = getDistance(current, point);
      if (dist < minDistance && dist <= maxDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    if (closestIndex === -1) return null;

    return polyline.slice(closestIndex + 1);
  }, [polyline, currentCoord, maxDistance]);
};
