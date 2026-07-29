import api from './api';

/**
 * Fetch active services from the backend API
 * GET /services or GET /api/services
 */
export const getServices = async () => {
  try {
    const response = await api.get('/services');

    // Normalize response formats (Direct array or { data: [...] } or { services: [...] })
    let dataList = [];
    if (Array.isArray(response)) {
      dataList = response;
    } else if (response && Array.isArray(response.data)) {
      dataList = response.data;
    } else if (response && Array.isArray(response.services)) {
      dataList = response.services;
    }

    // Filter only active services
    return dataList.filter((service) => service && service.active !== false);
  } catch (error) {
    console.error('Error fetching services from backend:', error);
    throw error;
  }
};
