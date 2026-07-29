import api from './api';

/**
 * Fetch gallery items from the backend API
 * GET /gallery or GET /api/v1/gallery
 */
export const getGalleryItems = async () => {
  try {
    const response = await api.get('/gallery');

    // Normalize response formats
    let dataList = [];
    if (Array.isArray(response)) {
      dataList = response;
    } else if (response && Array.isArray(response.data)) {
      dataList = response.data;
    } else if (response && Array.isArray(response.items)) {
      dataList = response.items;
    }

    return dataList;
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    throw error;
  }
};
