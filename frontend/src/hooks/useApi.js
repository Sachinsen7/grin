import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosConfig';


export const useApi = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!url) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get(url, options);
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(options)]);

    return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for POST requests
 */
export const useApiPost = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const post = useCallback(async (url, data, config = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post(url, data, config);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { post, loading, error };
};
