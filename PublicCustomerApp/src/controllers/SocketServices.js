import io from 'socket.io-client';

const SOCKET_URL = '';

class WSService {
  constructor() {
    this.socket = null;
    this.sockeData = [];
    this.socketLiveData = {}

    this.onLocationDeviceUpdate = this.onLocationDeviceUpdate.bind(this)
    this.initSocket = this.initSocket.bind(this)
  }

  async initSocket(userId) {

    this.interval = setInterval(() => {
    }, 5000)
    
    return new Promise((resolve, reject) => {
      try {
        const urlParts = SOCKET_URL.split('/');
        const protocolAndHost = urlParts.slice(0, 3).join('/');
        const path = '/' + urlParts.slice(3).join('/');

        this.socket = io(`${protocolAndHost}/web-app-clients`, {
          path: path !== '/' ? path + '/socket.io' : '/socket.io',
          query: {
            accessToken: userId,
          },
        });
        this.socket.on('connect', () => {
          console.log("socket connected", this.socket.id)
          resolve(true);
        });

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
