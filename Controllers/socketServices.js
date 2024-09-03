import React, {Component, createContext} from 'react';
import io from 'socket.io-client';
import { DataStore } from './DataStore';

const SOCKET_URL = 'https://apinot.vmmaps.com/ETSAPP';

const SOCKET_CUSTOMER_URL = 'https://apinot.vmmaps.com/NOTDailyrides';

export const SocketContext = createContext();

class WSService {

  constructor() {
    this.socket = null;
  }

  initSocket = async ({ user_id, app_id}) => {
    return new Promise((resolve, reject) => {
      try {
        let socketUrl = app_id == 'customer' ? SOCKET_CUSTOMER_URL : SOCKET_URL
        // console.log(socketUrl, '/nottest/socket.io',user_id,app_id)
        this.socket = io(socketUrl, {
          path: app_id == 'customer' ? '/notdailyrides/socket.io' : '/vmroutesLive/socket.io',
          auth: {
            user_id,
            app_id,
          },
        });
        console.log('Socket initialized');
        this.socket.on('connect', () => {
          console.log('Connected to socket server');
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.log('Failed to connect to socket server', error);
          reject(false);
        });
  
      } catch (error) {
        console.log('Failed to initialize socket', error);
        reject(error);
      }
    });
  }

  getSocket = () => {
    if (!this.socket) {
      throw new Error("Socket not connected!");
    }
    return this.socket;
  }

  getTokenSocket = () => {
    const token = DataStore.loadData('token') // get jwt token from local storage or cookie
    if (token) {
      return socketio.connect(SOCKET_URL, {
        query: { token }
      });
    }
    return socketio.connect(SOCKET_URL);
  };

  emit = (event, data) => {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on = (event, callback) => {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off = (event, callback) => {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  close = () => {
    if (this.socket) {
      this.socket.close();
    }
  }

  removeListeners = (listener) => {
    if (this.socket) {
      this.socket.removeAllListeners(listener);
    }
  }

  removeListeners = () => {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const wsService = new WSService();

export default wsService;
