export const DistanceFormate = {
  km: {
    value: "kilometer",
    sUnit: "km/h",
    dUnit: "km",
    conversion: 1, // No conversion needed for km
  },
  mi: {
    value: "miles",
    sUnit: "mph",
    dUnit: "mi",
    conversion: 0.621371, // Conversion factor from km to miles
  },
};

export const convertDistance = (
  distanceKm,
  config,
  type,
  roundToZero = false
) => {
  const distance = distanceKm ? distanceKm : 0;
  const disCal = distance * config.conversion;
  if (type === "speed") {
    roundToZero = true;
  }
  const roundOff = disCal.toFixed(roundToZero ? 0 : 2);
  const value =
    `${roundOff}` +
    `${" "}` +
    `${type === "speed" ? config.sUnit : config.dUnit}`;
  return value;
};

export const metersToKilometers = (meters) => {
  return meters / 1000;
};
