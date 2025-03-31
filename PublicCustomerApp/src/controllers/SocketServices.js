import io from 'socket.io-client';
import Config from '../Config/APIConfig';
import useRideSelectionStore from '../store/useRideSelectionStore';
import useDriverLocationStore from '../store/useDriverLocationStore';

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
    this.useRideSelectionStore = useRideSelectionStore
    this.useDriverLocationStore = useDriverLocationStore
  }

  driverAllocated(data){
    if(data?.driver && data?.otp){
      this.useRideSelectionStore.getState().setAssignedDriver(data?.driver);
      this.useRideSelectionStore.getState().setOtp(data?.otp);
      this.simulateDriverLocation()
    }
   
    
  }

  onRideStatus(data){
    console.log(data)
    if(data?.tripStatus){
      this.useRideSelectionStore.getState().setRideStatus(data?.tripStatus);
    }
    if(data?.fareDetails){
      this.useRideSelectionStore.getState().setFinalFareDetails(data?.fareDetails);
    }
  }
 
  driverLocationUpdate(data){
    if(data){
      try {
        this.useDriverLocationStore.getState().setDriverLocation(data?.data?.location?.coordinates);
        this.useDriverLocationStore.getState().setDriverAngle(data?.data?.liveStats?.course);
        this.useDriverLocationStore.getState().setDriverMaxSpeed(data?.data?.liveStats?.speed) || 0;
      } catch (error) {
        console.error('Error updating driver location:', error);
      }
    }
  }

  driverTestSimulation(data){
    
    if(data){
      console.log('simulate sdata-->>', data)
      try {
        this.useDriverLocationStore.getState().setDriverLocation(data?.data?.location?.coordinates);
        this.useDriverLocationStore.getState().setDriverAngle(data?.data?.liveStats?.course);
        this.useDriverLocationStore.getState().setDriverMaxSpeed(data?.data?.liveStats?.speed) || 0;
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
