import { useState, useEffect } from 'react';
import api from '../api/axios';
import useToastStore from '../store/toastStore';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Custom hook for fetching API data with loading and error states
 */
export const useApiData = (endpoint, options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const addToast = useToastStore((state) => state.addToast);
    const { showToastOnError = true, autoFetch = true } = options;

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(endpoint);
            setData(response.data);
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            if (showToastOnError) {
                addToast(errorMsg, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [endpoint, autoFetch]);

    return { data, loading, error, refetch: fetchData };
};



