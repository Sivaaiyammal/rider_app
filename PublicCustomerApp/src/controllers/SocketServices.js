import io from 'socket.io-client';
import Config from '../Config/APIConfig';
import { useStackScreenStore } from '../store/useStackScreenStore';
import useCurrentRideInfoStore from '../features/rideStatus/store/useCurrentRideInfoStore';
import useRideMatchStore from '../features/rideStatus/store/useRideMatchStore';
import useAssignedDriverInfoStore from '../features/rideStatus/store/useAssignedDriverInfoStore';
import useWayPointReorderStore from '../features/booking/store/useWayPointReorderStore';
import { TripStatus } from '../features/rideStatus/types/TripStatus';

const SOCKET_URL = Config.ROOT_API_URL;




class WSService {
  constructor() {
    this.socket = null;
    this.socketDriverAssignedData = {}
    this.initSocket = this.initSocket.bind(this)
    this.driverAllocated = this.driverAllocated.bind(this)
    this.driverLocationUpdate = this.driverLocationUpdate.bind(this)
    this.onRideStatus = this.onRideStatus.bind(this)
    this.driverTestSimulation = this.driverTestSimulation.bind(this)
    this.passangerLocationChange = this.passangerLocationChange.bind(this)
    this.useWayPointReorderStore = useWayPointReorderStore
    // this.driverFareUpdate = this.driverFareUpdate.bind(this)
    this.useStackScreenStore = useStackScreenStore
    this.useCurrentRideInfoStore = useCurrentRideInfoStore
    this.useAssignedDriverInfoStore = useAssignedDriverInfoStore
    this.useRideMatchStore = useRideMatchStore  
  }

  driverAllocated(data){

    console.log("driverAllocated",JSON.stringify(data))
    if(data?.driver && data?.otp){
      this.useCurrentRideInfoStore.getState().setTripStatus(data?.tripStatus);
      this.useAssignedDriverInfoStore.getState().setAllocatedDriverInfo(data?.driver);
      this.useCurrentRideInfoStore.getState().setOtp(data?.otp);
      this.useCurrentRideInfoStore.getState().setEstimatedFare(data?.tripData?.estimatedFare);
      this.useStackScreenStore.getState().setStackScreen('RideStatus',{});
    }
  }
  onRideStatus(data){
    console.log("onRideStatus",JSON.stringify(data))
    if(data?.tripStatus){
      console.log('data?.tripStatus',data?.tripStatus)
      if(data?.tripStatus === 'CANCELLED'){
        try {
          console.log('CANCELLED');
          console.log(data?.tripStatus);
          if(data?.isOnGoingTrip && data?.fareDetails){
            this.useStackScreenStore.getState().setStackScreen('RideStatus',{});
            this.useCurrentRideInfoStore.getState().setFareDetails(data?.tripFare);
            this.useCurrentRideInfoStore.getState().setFinalDistance(data?.tripFare?.distance);
            this.useCurrentRideInfoStore.getState().setFinalDuration(data?.tripFare?.duration);
            this.useCurrentRideInfoStore.getState().setOngoingingTripCancelled(true);
          }else{
            this.useStackScreenStore.getState().setStackScreen('RideStatus',{});
            this.useCurrentRideInfoStore.getState().setOtp(null);
            this.useAssignedDriverInfoStore.getState().setDriverInfo(null);
            this.useCurrentRideInfoStore.getState().setTripStatus(null);
            this.useCurrentRideInfoStore.getState().setOngoingingTripCancelled(false);
            this.useRideMatchStore.getState().resetRideMatchStatus();
            this.useStackScreenStore.getState().goBack();
            
          }
          
        } catch (error) {
          console.error('Error handling ride cancellation:', error);
        }

        
      }

      if(data?.tripStatus === 'DROPPED'){
        
        this.useCurrentRideInfoStore.getState().setFareDetails(data?.fareData);
        this.useCurrentRideInfoStore.getState().setFinalDuration(data?.duration);
        this.useCurrentRideInfoStore.getState().setFinalDistance(data?.distance);
        
        
      }

      this.useCurrentRideInfoStore.getState().setTripStatus(data?.tripStatus);
      if(data?.tripData?.stops){
        console.log("data?.tripData?.Sto",this.useCurrentRideInfoStore.getState().stops)
      }
      if(data?.tripData?.estimatedFare){
        this.useCurrentRideInfoStore.getState().setEstimatedFare(data?.tripData?.estimatedFare);
      }
      
    }
   
  }

  passangerLocationChange(data){
    if(data?.stops){
      this.useCurrentRideInfoStore.getState().setpassangerLocationChange(data)
      this.useWayPointReorderStore.getState().setWaitingForDriverApproval("APPROVED")
    }
  }
 
  
  driverLocationUpdate(data){
    console.log("driverLocationUpdate",JSON.stringify(data))
    if(data){
      try {
        this.useAssignedDriverInfoStore.getState().setDriverLatitude(data?.data?.location?.coordinates[1]);
        this.useAssignedDriverInfoStore.getState().setDriverLongitude(data?.data?.location?.coordinates[0]);
        this.useAssignedDriverInfoStore.getState().setDriverAngle(data?.data?.liveStats?.course);
        // this.useAssignedDriverInfoStore.getState().setDriverMaxSpeed(data?.data?.liveStats?.speed) || 0;
      } catch (error) {
        console.error('Error updating driver location:', error);
      }
    }
  }

  // driverFareUpdate(data){
  //   try {
  //     if(data?.currentFare){
  //       console.log('currentFare', data?.currentFare);
  //       this.useRideSelectionStore.getState().setCurrentFare(data?.currentFare);
  //     }
  //   } catch (error) {
  //     console.error('Error updating driver fare:', error);
  //   }
  // }

  driverTestSimulation(data){
    
    if(data){
      console.log('simulate sdata-->>', data)
      try {
        this.useAssignedDriverInfoStore.getState().setDriverLatitude(data?.data?.location?.coordinates[1]);
        this.useAssignedDriverInfoStore.getState().setDriverLongitude(data?.data?.location?.coordinates[0]);
        this.useAssignedDriverInfoStore.getState().setDriverAngle(data?.data?.liveStats?.course);
        this.useAssignedDriverInfoStore.getState().setDriverMaxSpeed(data?.data?.liveStats?.speed) || 0;
      } catch (error) {
        console.error('Error updating driver location:', error);
      }
    }
  }

  async initSocket(userId) {

    this.interval = setInterval(() => {
    }, 5000)
    
    return new Promise((resolve, reject) => {
      try {
        const urlParts = SOCKET_URL.split('/');
        const protocolAndHost = urlParts.slice(0, 3).join('/');
        const path = '/' + urlParts.slice(3).join('/');

        console.log("protocolAndHost-->>fdff", protocolAndHost)

        this.socket = io(`${protocolAndHost}/public-rides-customer`, {
          path: path !== '/' ? path + '/socket.io' : '/socket.io',
          query: {
            accessToken: userId,
          },
        });
        this.socket.on('connect', () => {
          console.log("socket connected", this.socket.id)
          resolve(true);
        });

        this.socket.on('driverAllocated', this.driverAllocated);

        this.socket.on('driverLocationUpdate', this.driverLocationUpdate);

        this.socket.on('driverTestSimulation', this.driverTestSimulation);

        this.socket.on('passangerTripStatus', this.onRideStatus);

        this.socket.on('passangerLocationChange', this.passangerLocationChange);

        // this.socket.on('passangerTripFareUpdate', this.driverFareUpdate);

        this.socket.on('connect_error', error => {
          console.error(
            'Socket error: Failed to connect to socket server',
            error,
          );
          reject(
            new Error(
              'Socket error: Failed to connect to socket server [Error: server error]',
              +error,
            ),
          );
        });
      } catch (error) {
        // console.error('Error during socket initialization', error);
        reject(
          new Error('Error during socket initialization: ' + error.message),
        );
      }
    });
  }

  getSocket() {
    if (!this.socket) {
      throw new Error('Socket not connected!');
    }
    return this.socket;
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
    if (this.socket) {
      console.log("Socket disconnected")
      this.socket.close();
      clearInterval(this.interval)
    }
  }

  removeListeners(listener) {
    if (this.socket) {
      this.socket.removeAllListeners(listener);
    }
  }
}

const wsService = new WSService();

export default wsService;
