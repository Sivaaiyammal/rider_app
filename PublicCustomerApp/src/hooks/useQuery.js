import React, { useState } from 'react';
import APIRequest from '../controllers/APIRequest';
import { useMutation, useQueryClient } from 'react-query';

const usePostQuery = ({ onSuccess, onError }) => {
    const queryClient = useQueryClient();

    const postQuery = async ({ queryKey, url, payload }) => {

        const apiRequest = new APIRequest();
        const res = await apiRequest.request(url, 'POST', payload);

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

    const getQuery = async ({ queryKey, url }) => {
        const apiRequest = new APIRequest();
        try {
            const res = await apiRequest.request(url, 'GET');

            queryClient.invalidateQueries(queryKey);

            return res;
        } catch (err) {
            return err;
        }
    }

    return useMutation(getQuery);
}

export { usePostQuery, useGetQuery };