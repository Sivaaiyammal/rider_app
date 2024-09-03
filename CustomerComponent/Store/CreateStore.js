import React, {Component, createContext} from 'react';
import wsService from '../../Controllers/socketServices';
import { DataStore } from '../../Controllers/DataStore';
import APIRequest from '../../Controllers/APIRequest';
import ApiConfig from '../../Config/ApiConfig.js';

export const GlobalContext = React.createContext();

class GlobalStateProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: {},
      isSocketInitialized: false,
      profileData: null,
      language: 'en',
    };
    this.socket = wsService;
  }

  changeLanguage = language => {
    this.setState({language: language});
  };

  init = async () => {
    console.log('Customer init called');
    try {
      let data = await DataStore.loadData('USER_DATA')
      console.log('USER_DATA', data);
      await this.socket.initSocket({ user_id: data.data.user_id, app_id: 'customer' });
      console.log('Socket connected successfully');
      this.setState({isSocketInitialized: true});
      // await this.getUserDetails(data.data || {});
    } catch (error) {
        console.error('Socket failed to connect:', error);
    }
  };

  getSocket = () => {
    return {isSocketInitialized: this.state.isSocketInitialized, socket: this.socket};
  };


  async getUserDetails(data) {
    let userDetails = data

    let api = new APIRequest(ApiConfig.ROOT_API_URL_NOT);
    let url = '/api/customer/get-profile-detials';

    const phoneNumber = userDetails.user_id;

    let payload = {
      phone: phoneNumber,
    };

    try {
      let data = await api.request(url, 'POST', payload)
      data = data.data

      console.log(data, 'data')

      this.setState({ profileData: data })
    } catch (err) {
      console.log(err)
      NotificationManager.error("Cannot Fetch profile details", 4000, 'bottom')
      this.setState({ profileData: {} })
    }
  }

  setUser = user => {
    this.setState({userDetails: user});
    setTimeout(() => {
      this.init();
    }, 1000);
  };

  render = () => {
    const value = {
      ...this.state,
      setUser: this.setUser,
      getSocket: this.getSocket,
      // init: this.init,
      changeLanguage:this.changeLanguage,
    };

    return (
      <GlobalContext.Provider value={value}>
        {this.props.children}
      </GlobalContext.Provider>
    );
  };
}

export default GlobalStateProvider;
