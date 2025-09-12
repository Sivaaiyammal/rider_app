import processDataMobile from "../../../core/location/DataProcessorMobile";
import { mapMatch } from "../../../API/EndPoints/EndPoints";
import polyline from "@mapbox/polyline";
import client from "../../../API/apolloClient"; // your configured Apollo client
import LocationGetGraphqlQuery from "../../../core/location/LocationGetGraphqlQuery";

/**
 * Calculate distance & duration for a trip
 * @param {Object} params
 * @param {string} params.tripId
 * @param {number} params.startTime
 * @param {number} params.endTime
 * @param {string} params.token - auth token
 * @returns {Promise<{distance: number, duration: number}>}
 */
export default async function getGpsData({ tripId, startTime, endTime, token }) {
  console.log("tripId",tripId)
  console.log("startTime",startTime)
  console.log("endTime",endTime)
  console.log("token",token)
  try {
   
    const { data } = await client.query({
      query: LocationGetGraphqlQuery(tripId, false, startTime, endTime),
      context: {
        headers: { authorization: `Bearer ${token}` },
      },
      fetchPolicy: "no-cache",
    });

    const raw = data?.getRecentLocations?.raw;
    if (!Array.isArray(raw) || raw.length === 0) {
      return { distance: -1, duration: -1 };
    }

  
    const processed = processDataMobile({
      data: data.getRecentLocations,
      options: {
        range: { start: startTime, end: endTime },
        mergeLngLats: true,
      },
    });

    const lngLats = processed?.data?.lngLats;
    if (!Array.isArray(lngLats) || lngLats.length < 2) {
      return { distance: -1, duration: -1 };
      
    }

    const latLngs = lngLats.map(([lng, lat]) => [lat, lng]);
    const encoded = polyline.encode(latLngs);


    // const encoded = "c}`aTgdi}qCwEXzCvl@ei@jDhHvzBw\fCuAdEnDjyAz@d^xQ`AvH`@lBBlUPh_@Vrp@f@f^^pWR|KHpbAdAlEPnIJpABdKhCjEZpg@fChP`AnFQbIe@hBAdQOtGG|H_@zCnEbLtRfJlM`S`ZxKtOpFxGzVd^xEbFl]h`@vY~[da@rg@tE`FlXp]zXn^lEnG"

    // 4. Call Valhalla map_match
    const resp = await mapMatch({
      encoded_polyline: encoded,
      shape_match: "map_snap",
      costing: "auto",
    });

    const lengthMeters = resp?.trip?.summary?.length;
    const timeSeconds = resp?.trip?.summary?.time;

    if (typeof lengthMeters === "number" && typeof timeSeconds === "number") {
      return {
        distance: lengthMeters,         // meters
        duration: timeSeconds / 60,     // minutes
      };
    }

    return { distance: -1, duration: -1 };
  } catch (err) {
    console.error("calculateDistance error:", err);
    return { distance: -1, duration: -1 };
  }
}
