import Config from 'react-native-config';
import APIRequest from '../../common/APIRequest';
import { DataStore } from '../../common/controllers/DataStore';

class PublicrideDriverApi {
  constructor() {
    this.initToken();
  }

  async initToken() {
    try {
      const userData = await DataStore.loadData('userdetails');
      if (userData && userData.status && userData.data) {
        const parsedData = userData.data;
        if (parsedData && parsedData?.token) {
          this.token = parsedData?.token;
        }
      }
    } catch (error) {
      console.error('Error initializing token:', error);
    }
  }

  async updateDriverDetails(formData,token=this.token) {
    try {
       const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/updateDriverInfo`, 'POST', formData, token);
      return response;
    } catch (error) {
      console.error('Error updating driver   details:', error);
      throw error;
    }
    }
  async updateDriverProof(formData, token=this.token) {
    try {
      const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/updateDriverProof`, 'POST', formData, token);
      return response;
    } catch (error) {
      console.error('Error updating driver proof documents:', error);
      throw error;
    }
  }
  async updateVehicleDetails(payload,token=this.token) {
    try {
       const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/updateVehicleInformation`, 'POST', payload, token);
      return response;
    } catch (error) {
      console.error('Error updating vehicle details:', error);
    }
  }

  async updateBankDetails(formData,token=this.token) {
    try {
       const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/uploadBankDetails`, 'POST', formData, token);
      return response;
    } catch (error) {
      console.error('Error updating bank details:', error);
      throw error;
    }
  }

  async uploadDriverDocuments(formData,token=this.token) {
    try {
      const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/uploadDocs`, 'POST', formData, token);
      return response;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }
  
  async getDriverDetails(token=this.token) {
    try {
       const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/getDriverDetails`, 'GET', null, token);
      return response;
    } catch (error) {
      console.error('Error getting driver details:', error);
      throw error;
    }
  }
  
  async getTripDetails(tripId,token=this.token) {
    try {
       const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/getTrip?tripId=${tripId}`, 'GET', null, token);
      return response;
    } catch (error) {
      console.error('Error getting trip details:', error);
      throw error;
    }
  }

  async acceptTrip(payload, token=this.token) {
    try {
      const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/acceptRide`, 'POST', payload, token);
      return response;
    } catch (error) {
      console.error('Error accepting trip:', error);
      throw error;
    }
  }
}

export default new PublicrideDriverApi();
