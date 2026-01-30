import io from 'socket.io-client';
import Config from 'react-native-config';
import { NativeModules } from 'react-native';
import { useStackScreenStore } from '../../store/useStackScreenStore';
import { useTripAcceptStore } from '../../../notdriver/store/useTripAcceptStore';
import useHotSpotStore from '../../../notdriver/store/useHotSpotStore';
import { useMapMarkerStore } from '../../store/useMapMarkerStore';
import useTripsStore from '../../../notdriver/store/useTripsStore';
import { DataStore } from '../DataStore';
import { showNotification } from '../../../common/components/NotificationManger';
import tripAlert from '../TripAlert';
import { cancelTrip } from '../../../notdriver/components/CancelTripUpdate';
import APIRequest from '../APIRequest';
import useUserStore from '../../store/useUserStore';
import { firebaselog_tripBooking } from '../../utils/FirebaseAnalytics';

const SOCKET_URL = Config.DRIVER_SOCKET_URL;
const {NeNativeModule} = NativeModules;
class RideMatchWSService {
  constructor() {
    this.socket = null;
    this.fastSocket = null;
    this.sockeData = [];
    this.socketLiveData = {};
    this.socketInterval = null;

    // Internal flags to avoid duplicate connects and duplicate listener attachment
    this._isConnecting = false;
    this._listenersAttached = false;
    this._driverId = null;

    // Bind ALL handlers once so their identity is stable
    this.initDriverRoomSocket = this.initDriverRoomSocket.bind(this);
    this.onTripRequest = this.onTripRequest.bind(this);
    this.onHotSpotRegionUpdate = this.onHotSpotRegionUpdate.bind(this);
    this.onDriverReponseReceived = this.onDriverReponseReceived.bind(this);
    this._onConnect = this._onConnect.bind(this);
    this._onConnectError = this._onConnectError.bind(this);
    this._onDisconnect = this._onDisconnect.bind(this);
    this._attachListeners = this._attachListeners.bind(this);
    this._detachListeners = this._detachListeners.bind(this);
  }

  async _acceptTripWithRetry(tripId, maxRetries = 3, token) {
    let attempt = 0;
    let lastResponse = null;
    while (attempt < maxRetries) {
      const attemptNum = attempt + 1;
      console.log(`[DriverWSService] Attempt ${attemptNum}/${maxRetries} - accepting trip ${tripId}`);
      try {
        const api = new APIRequest();
        const res =  await api.request(`/publicrides/driver/acceptRide`, 'POST', { tripId }, token)
        if (res?.success) {
          console.log(`[DriverWSService] ✅ Accept succeeded on attempt ${attemptNum}`);
          return res;
        }
        lastResponse = res;
        // const msg = res?.message || 'Unknown error from server';
      } catch (e) {
        const errMsg = e?.message || String(e);
        lastResponse = { success: false, message: errMsg };
      }
      attempt += 1;
      if (attempt < maxRetries) {
        const delay = 500 * Math.pow(2, attempt - 1);
        console.log(`[DriverWSService] 🔁 Retrying in ${delay}ms (next attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    // console.log(`[DriverWSService] 🚫 Exhausted retries for trip ${tripId}`);
    return lastResponse;
  }

  /**
   * ===== Event handlers =====
   */
  async onTripRequest(data) {
    const {setStackScreen} = useStackScreenStore.getState();
    if (data?.type === 'trip_request') {
      useTripAcceptStore.setState({tripDetails: data.data});
      useTripAcceptStore.setState({tripId: data.data?.trip_id});
      useTripAcceptStore.setState({currentFare: data.data?.fare});
      useTripAcceptStore.setState({requestId: data.data?.request_id});
      useTripAcceptStore.setState({timeOutSeconds: data.data?.timeout_seconds});
      useTripAcceptStore.setState({alertedAt: data?.data?.alerted_at});
      useTripAcceptStore.setState({
        escalationDetails: data?.data?.escalation_details,
      });
      setStackScreen('TripAccept');
      firebaselog_tripBooking('TB_Driver_Allocation(TB_DA)', 'TB_DA:trip_request_received');
      tripAlert.playAlertSound();
    }
  }

  onHotSpotRegionUpdate(data) {
    if (data?.hotspots) {
      useHotSpotStore.setState({hotSportMarkers: data.hotspots});
    }
  }

  async onDriverReponseReceived(data) {
    const {setStackScreen} = useStackScreenStore.getState();
    const {
      tripCancelReason,
      setFetchLocationDate,
      setIsGetFare,
      setLoading,
      reset,
      tripDetails,
      setTripDetails
    } = useTripAcceptStore.getState();
    const {setDirectionPoints} = useMapMarkerStore.getState();
    const {activeTripData, setActiveTripData} = useTripsStore.getState();
    const {userInfo} = useUserStore.getState();
    try {
      if (data?.status === 'success') {
        setLoading(true);
        if (data?.response === 'accept') {
          const response = await this._acceptTripWithRetry(data?.trip_id, 3, userInfo?.token);
          if (response?.success) {
            DataStore.storeData('activeTripId', data?.trip_id);
            const tripData = response?.currentTrip;
            tripData.status = 'ACCEPTED';
            useTripsStore.setState({activeTripData: [tripData]});
            firebaselog_tripBooking('TB_Driver_Allocation(TB_DA)', 'TB_DA:trip_accepted_inapp');
            tripDetails.pickUpRoute.response = tripDetails?.pickUpRoute?.response
              .replace(/'/g, '"')
              .replace(/\bTrue\b/g, 'true')
              .replace(/\bFalse\b/g, 'false');
            setTripDetails(tripDetails)
            setStackScreen('PublicDriverTrackingScreen');

            // Clear trip accept store to prevent loop
            reset();
          } else {
            showNotification(
              `Failed to ${data?.response?.toLowerCase().replace('_', ' ')} Trip after 3 retries`,
              response?.message,
              'danger',
            );
            // Attempt to cancel the trip after repeated accept failures
            try {
              const cancelReason = 'Trip accept failed by tracking engine attempted three times';
              const api = new APIRequest();
              const cancelResp = await api.request(`/publicrides/driver/cancelTrip`, 'POST', {tripId:data?.trip_id, reason: cancelReason, isBeforePickup: true}, userInfo?.token);
              if (cancelResp?.success) {
                firebaselog_tripBooking('TB_Driver_Allocation(TB_DA)', 'TB_DA:trip_cancelled_after_accept_retry');
                showNotification('Trip Cancelled', cancelResp?.message, 'success');
              } else {
                showNotification('Failed to Cancel Trip', cancelResp?.message, 'danger');
              }
            } catch (cancelErr) {
              showNotification('Failed to Cancel Trip', cancelErr?.message || String(cancelErr), 'danger');
            }
            // Reset store on failure too
            reset();
          }
        } else {
          // Handle reject response
          if (tripCancelReason) {
            if (activeTripData?.[0]?.status === 'PICKEDUP') {
              setIsGetFare(false);
              setFetchLocationDate(true);
            }
          } else {
            tripAlert.stopAlertSound();
            // Clear all trip-related data to prevent loop
            setDirectionPoints(null);
            setStackScreen('Home');
            setActiveTripData([]);
            DataStore.storeData('activeTripId', null);
            NeNativeModule.clearDirectionPoints();
            firebaselog_tripBooking('TB_Driver_Allocation(TB_DA)', 'TB_DA:trip_reject_inapp');
          }
          reset();
        }
      } else {
        reset();
      }
      tripAlert.stopAlertSound();
    } catch (err) {
      reset();
      tripAlert.stopAlertSound();
    } finally {
      useTripAcceptStore.getState().setLoading(false);
      tripAlert.stopAlertSound();
    }
  }

  onRideMatchCancel(data) {
    if (data.status === "CANCELLED") {
     cancelTrip(data)
     tripAlert.stopAlertSound();
    }
  }

  /**
   * ===== Socket lifecycle helpers =====
   */
  _onConnect() {
    if (!this.socket) return;
    console.log('Driver Socket connected:', SOCKET_URL, this.socket.id);
    this._attachListeners(); // ensure listeners attached once
    this._isConnecting = false;
    // Re-join driver room on (re)connect if we have an id
    if (this._driverId) {
      try {
        this.emit('join_driver_room', { driver_id: this._driverId });
      } catch (e) {}
    }
  }

  _onConnectError(error) {
    console.error('Socket error: Failed to connect to socket server', error);
    this._isConnecting = false;
  }

  _attachListeners() {
    if (!this.socket || this._listenersAttached) return;

    // Attach with stable function refs (bound in constructor)
    this.socket.on('trip_request', this.onTripRequest);
    this.socket.on('hotspot_update', this.onHotSpotRegionUpdate);
    this.socket.on('driver_response_received', this.onDriverReponseReceived);
    this.socket.on('cancel_ride_match', this.onRideMatchCancel);
    // If you want only one driver_response per session, swap to:
    // this.socket.once('driver_response_received', this.onDriverReponseReceived);

    this._listenersAttached = true;
  }

  _detachListeners() {
    if (!this.socket || !this._listenersAttached) return;

    this.socket.off('trip_request', this.onTripRequest);
    this.socket.off('hotspot_update', this.onHotSpotRegionUpdate);
    this.socket.off('driver_response_received', this.onDriverReponseReceived);
    this.socket.off('cancel_ride_match', this.onRideMatchCancel);
    this._listenersAttached = false;
  }

  _onDisconnect(reason) {
    // Detach all event listeners so they don't accumulate
    try {
      this._detachListeners();
    } catch (e) {}
    this._isConnecting = false;
  }

  /**
   * ===== Public API =====
   */
  async initDriverRoomSocket(userId) {
    console.log('RideMatchWSService - initDriverRoomSocket called with userId:', userId);
    return new Promise((resolve, reject) => {
      try {
        // Persist driver id for room rejoin on reconnect
        this._driverId = userId;
        // Already connected? Just ensure listeners are attached (idempotent)
        if (this.socket?.connected) {
          this._attachListeners();
          return resolve(true);
        }
        // Prevent racing multiple connects
        if (this._isConnecting) {
          return resolve(false);
        }
        this._isConnecting = true;

        // Build URL and path for custom namespaces/deploys
        const urlParts = String(SOCKET_URL).split('/');
        const protocolAndHost = urlParts.slice(0, 3).join('/');
        const path = '/' + urlParts.slice(3).join('/');
        const nsUrl = `${protocolAndHost}${path}`; // namespace URL (may be '/')
        console.log('[RideMatchWS] Connecting to', nsUrl, 'engine path', '/socket.io');

        // Create the socket
        this.socket = io(nsUrl, {
          path: '/socket.io',
          query: { driver_id: userId },
          auth: { driver_id: userId },
          transports: ['websocket'],
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 5000,
          timeout: 10000,
        });

        // Core lifecycle
        this.socket.on('connect', this._onConnect);
        this.socket.on('disconnect', this._onDisconnect);
        this.socket.on('connect_error', error => {
          this._onConnectError(error);
          reject(
            new Error(
              'Driver Socket error: Failed to connect to socket server',
            ),
          );
        });

        // Resolve after initial connect
        this.socket.once('connect', () => resolve(true));
        // Explicitly trigger connect (RN sometimes defers autoConnect)
        try { this.socket.connect(); } catch (e) {}
      } catch (error) {
        this._isConnecting = false;
        reject(
          new Error(
            'Error during Driver socket initialization: ' +
              (error?.message || String(error)),
          ),
        );
      }
    });
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  close() {
    try {
      if (this.socket) {
        this._detachListeners();
        this.socket.off('connect', this._onConnect); // detach lifecycle as well
        this.socket.off('disconnect', this._onDisconnect);
        this.socket.off('connect_error', this._onConnectError);
        this.socket.close();
        clearInterval(this.socketInterval);
        this.socket = null;
        this._isConnecting = false;
      }
    } catch (err) {
      console.log(err);
    }
  }

  removeListeners(listener) {
    if (this.socket) {
      this.socket.removeAllListeners(listener);
    }
  }
}

export default new RideMatchWSService();
