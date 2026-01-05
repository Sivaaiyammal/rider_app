import Config from 'react-native-config';
import { DataStore } from '../../controllers/DataStore';
import APIRequest from '../../common/APIRequest';

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

  async updateDriverDetails(payload,token=this.token) {
    try {
       const api = new APIRequest(Config.ROOT_API_URL)
      const response = await api.request(`/publicrides/driver/updateDriverDetails`, 'POST', payload, token);
      return response;
    } catch (error) {
      console.error('Error updating driver   details:', error);
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

  async cancelTrip(tripId,reason,token=this.token) {
    const reasonForCancel = reason? reason : ''
    const api = new APIRequest(Config.ROOT_API_URL)
    try {
      const response = await api.request(`/publicrides/driver/cancelTrip`, 'POST', {tripId:tripId, reason: reasonForCancel}, token);
      return response;
    } catch (error) {
      console.error('Error canceling trip:', error);  
      throw error;
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
