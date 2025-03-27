// Utility to calculate distance between two coordinates
function haversineDistance([lon1, lat1], [lon2, lat2]) {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
  
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }
  
  // Returns the remaining part of the polyline from the closest point to the end
  function getRemainingPolyline(polylineCoords = [], currentLocation) {
    if (!Array.isArray(polylineCoords) || polylineCoords.length === 0) return [];
  
    let minDist = Infinity;
    let closestIndex = 0;
  
    polylineCoords.forEach((point, index) => {
      const dist = haversineDistance(currentLocation, point);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = index;
      }
    });
  
    // Include current location as starting point
    return [currentLocation, ...polylineCoords.slice(closestIndex + 1)];
  }
  
  export { getRemainingPolyline, haversineDistance };
  