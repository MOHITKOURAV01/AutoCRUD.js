import { useState, useCallback } from 'react';
import api from '../utils/api';

/**
 * useApi - Custom hook to manage API requests with full telemetry.
 * Captures latency, status codes, and headers for professional consoles.
 * 
 * @returns {Object} { loading, error, data, status, headers, duration, request, setData }
 */
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [duration, setDuration] = useState(null);

  /**
   * Execute an API request.
   * 
   * @param {string} method - HTTP method (get, post, put, delete).
   * @param {string} url - The endpoint path.
   * @param {Object} [body=null] - Optional JSON payload.
   */
  const request = useCallback(async (method, url, body = null) => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const response = await api({
        method: method.toLowerCase(),
        url,
        data: body
      });

      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime);

      // Update telemetry states
      setData(response.data);
      setStatus(response.status);
      setHeaders(response.headers);
      setDuration(timeTaken);

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        duration: timeTaken
      };
    } catch (err) {
      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime);
      
      const apiError = err.response?.data?.message || err.message || 'Unknown API Error';
      const errorStatus = err.response?.status || 500;
      const errorHeaders = err.response?.headers || {};

      setError(apiError);
      setStatus(errorStatus);
      setHeaders(errorHeaders);
      setDuration(timeTaken);
      
      throw {
        message: apiError,
        status: errorStatus,
        headers: errorHeaders,
        duration: timeTaken
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, status, headers, duration, request, setData };
};

export default useApi;
