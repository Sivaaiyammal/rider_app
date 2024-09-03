

import APIConfig from '../Config/ApiConfig'
import { DataStore } from './DataStore';
let Default_Post_Headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}


class APIRequest {
    constructor(baseURL) {
        this.baseURL = baseURL || APIConfig.ROOT_API_URL;
    }

    async request(
        endpoint,
        method = 'GET',
        body = null,
        headers = {},
        queryParams = {},
        abortController = null
    ) {
        // Convert queryParams object to string
        let queryString = ""

        if (queryParams)
            queryString = Object.keys(queryParams)
                .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
                .join('&');

        const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;

        if (method == 'POST') {
            headers = { ...headers, ...Default_Post_Headers }
        }

        const options = {
            method,
            headers: {
                ...headers,
            },
            signal: abortController ? abortController.signal : null,
        };

        if (body && (method !== 'GET' && method !== 'HEAD')) {
            options.body = JSON.stringify(body);
        }
        let accessToken = await DataStore.loadData('ACCESS_TOKEN')
        accessToken = accessToken?.data

        // Attach Access token for authorization
        if (!options.headers.Authorization && accessToken) options.headers.Authorization = accessToken

        try {
            const response = await fetch(url, options);
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
}

export default APIRequest

export const static_data = '7904491410'