import axios from 'axios';
import Config from "react-native-config";
import {DataStore} from '../controllers/DataStore';

const REQUEST_TIMEOUT_MS = 5000;
const MAX_RETRY_ATTEMPTS = 1;

const apiClient = axios.create({
  baseURL: Config.ROOT_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async config => {
    const requestConfig = {
      ...config,
      headers: {
        ...(config.headers || {}),
      },
    };

    if (typeof requestConfig.__retryCount !== 'number') {
      requestConfig.__retryCount = 0;
    }

    const access_token = await DataStore.loadData('access_token');

    if (access_token.data) {
      requestConfig.headers.Authorization = `Bearer ${access_token.data}`;
    }

    const controller = new AbortController();
    requestConfig.signal = controller.signal;
    requestConfig.__timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    return requestConfig;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  async response => {
    if (response.config?.__timeoutId) {
      clearTimeout(response.config.__timeoutId);
      delete response.config.__timeoutId;
    }
    return response;
  },
  error => {
    if (error.config?.__timeoutId) {
      clearTimeout(error.config.__timeoutId);
      delete error.config.__timeoutId;
    }

    const isTimeoutError =
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      error.message === 'canceled';

    if (
      isTimeoutError &&
      error.config &&
      error.config.__retryCount < MAX_RETRY_ATTEMPTS
    ) {
      const nextAttempt = error.config.__retryCount + 1;
      console.warn(
        `Request timeout retry ${nextAttempt}/${MAX_RETRY_ATTEMPTS} for ${error.config.url}`,
      );
      error.config.__retryCount += 1;
      delete error.config.signal;
      return apiClient.request(error.config);
    }

    let errorMessage = 'An unknown error occurred';
    let statusCode = null;
    if (isTimeoutError) {
      errorMessage = `Request timed out. Please retry.`;
      console.error('HTTP timeout error:', error.config?.url);
    } else if (error.response) {
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
