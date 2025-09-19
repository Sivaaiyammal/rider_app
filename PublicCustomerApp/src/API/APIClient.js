import axios from 'axios';
  import Config from "react-native-config";
import {DataStore} from '../controllers/DataStore';

const apiClient = axios.create({
  baseURL: Config.ROOT_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async config => {
    const access_token = await DataStore.loadData('access_token');
   
    if (access_token.data) {
      config.headers.Authorization = `Bearer ${access_token.data}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  async response => response,
  error => {
    let errorMessage = 'An unknown error occurred';
    let statusCode = null;
    if (error.response) {
      statusCode = error.response.status;
      const responseData = error.response.data;
      if (statusCode === 400) {
        errorMessage = responseData.message || 'Bad Request';
      } else if (statusCode === 401) {
        errorMessage = responseData.message || 'Unauthorized';
      } else if (statusCode === 404) {
        errorMessage = responseData.message || 'Resource not found';
      } else if (statusCode === 500) {
        errorMessage = responseData.message || 'Internal server error';
      } else {
        errorMessage = responseData.message || `Error ${statusCode}`;
      }
      console.error('HTTP error:', statusCode, responseData);
    } else if (error.request) {
      errorMessage = 'Network error: Network Request Failed';
      console.error('Network error:', error.request);
    } else {
      errorMessage = error.message;
      console.error('Error:', errorMessage);
    }

    return Promise.reject({message: errorMessage, status: statusCode});
  },
);

export default apiClient;
