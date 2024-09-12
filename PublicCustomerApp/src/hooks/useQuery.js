import React, { useState } from 'react';
import APIRequest from '../controllers/APIRequest';
import { useMutation, useQueryClient } from 'react-query';
import { DataStore } from '../controllers/DataStore';

const usePostQuery = ({ onSuccess, onError }) => {
    const queryClient = useQueryClient();


    const postQuery = async ({ queryKey, url, payload }) => {

        const access_token = await DataStore.loadData('access_token');

        const apiRequest = new APIRequest();
        const res = await apiRequest.request(url, 'POST', payload, access_token.data);

        queryClient.invalidateQueries(queryKey);

        return res;

    }

    return useMutation(postQuery, {
        onSuccess: (data) => onSuccess(data),
        onError: (error) => onError(error)
    });

}

const useGetQuery = () => {
    const queryClient = useQueryClient();

    const getQuery = async ({ queryKey, url, payload = null, token = nul }) => {
        const apiRequest = new APIRequest();
        try {
            const res = await apiRequest.request(url, 'GET', payload, token);

            queryClient.invalidateQueries(queryKey);

            return res;
        } catch (err) {
            return err;
        }
    }

    return useMutation(getQuery);
}

export { usePostQuery, useGetQuery };