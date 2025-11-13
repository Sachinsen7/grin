import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const url = process.env.REACT_APP_BACKEND_URL;

/**
 * Custom hook to fetch suppliers with caching
 * @param {Object} options - Query options (enabled, staleTime, etc.)
 * @returns {Object} - { data, isLoading, error, isError }
 */
export const useSuppliers = (options = {}) => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await axios.get(`${url}/api/suppliers`);
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      throw new Error('Invalid suppliers response');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Custom hook to fetch GSN data with caching
 * @param {Object} options - Query options
 * @returns {Object} - { data, isLoading, error, isError }
 */
export const useGsnData = (token, options = {}) => {
  return useQuery({
    queryKey: ['gsn-data', token],
    queryFn: async () => {
      const response = await axios.get(`${url}/gsn/getdata`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = response.data;
      if (Array.isArray(data)) {
        return data.filter(u => !u.isHidden);
      }
      throw new Error('Invalid GSN data response');
    },
    enabled: !!token, // Only fetch if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/**
 * Custom hook to fetch GRN data with caching
 * @param {Object} options - Query options
 * @returns {Object} - { data, isLoading, error, isError }
 */
export const useGrnData = (token, options = {}) => {
  return useQuery({
    queryKey: ['grn-data', token],
    queryFn: async () => {
      const response = await axios.get(`${url}/getdata`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = response.data;
      if (Array.isArray(data)) {
        return data.filter(u => !u.isHidden);
      }
      throw new Error('Invalid GRN data response');
    },
    enabled: !!token, // Only fetch if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/**
 * Custom hook to fetch supplier details with caching
 * @param {string} partyName - The supplier party name
 * @param {Object} options - Query options
 * @returns {Object} - { data, isLoading, error, isError }
 */
export const useSupplierDetails = (partyName, options = {}) => {
  return useQuery({
    queryKey: ['supplier-details', partyName],
    queryFn: async () => {
      const response = await axios.get(`${url}/api/supplier-details?partyName=${encodeURIComponent(partyName)}`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data; // Fallback if no nested structure
    },
    enabled: !!partyName, // Only fetch if partyName exists
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Custom hook to fetch combined GSN and GRN data
 * @param {string} token - Auth token
 * @param {boolean} enabled - Whether to fetch
 * @param {Object} options - Query options
 * @returns {Object} - { data, isLoading, error }
 */
export const useCombinedData = (token, enabled = true, options = {}) => {
  return useQuery({
    queryKey: ['combined-data', token],
    queryFn: async () => {
      const [gsnRes, grnRes] = await Promise.all([
        axios.get(`${url}/gsn/getdata`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        axios.get(`${url}/getdata`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const gsnData = Array.isArray(gsnRes.data) ? gsnRes.data.filter(u => !u.isHidden) : [];
      const grnData = Array.isArray(grnRes.data) ? grnRes.data.filter(u => !u.isHidden) : [];

      return { gsnData, grnData };
    },
    enabled: !!token && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};
