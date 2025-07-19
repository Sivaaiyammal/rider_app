import useCurrentRideInfoStore from '../store/useCurrentRideInfoStore';
import { updateTripStops } from '../../../API/EndPoints/EndPoints';
import  LocationTypes  from '../../booking/types/LocationTypes.json';

/**
 * Calls the API to update trip stops for the current ride.
 * @param {Object} stopData - The new stop data to update.
 * @returns {Promise<Object>} - The API response.
 */
export const changeStopLocation = async (updatedStop) => {
  // Get current ride info (e.g., tripId)
  const { tripId,stops } = useCurrentRideInfoStore.getState();
  

  const upadtedstops = [...stops]
  if (updatedStop?.type == LocationTypes.START_LOCATION) {
    upadtedstops[0].address = updatedStop?.address;
    upadtedstops[0].location[1] = updatedStop?.latitude;
    upadtedstops[0].location[0] = updatedStop?.longitude;
    
  } else if (updatedStop?.type == LocationTypes.END_LOCATION) {
    upadtedstops[stops.length - 1].address = updatedStop?.address;
    upadtedstops[stops.length - 1].location[1] = updatedStop?.latitude;
    upadtedstops[stops.length - 1].location[0] = updatedStop?.longitude;

  }

  // Prepare payload for API
  const payload = {
    tripId,
    stops:upadtedstops,
  };

  console.log('payload',payload);

  // Call the API to update trip stops
  const response = await updateTripStops(payload);
  if (response.success) {
    
    useCurrentRideInfoStore.setState({ stops: upadtedstops });
    useCurrentRideInfoStore.setState({ rideStartLocation: upadtedstops[0]?.location });
    useCurrentRideInfoStore.setState({ rideEndLocation: upadtedstops[stops.length - 1]?.location });
  }
  return response;

};
