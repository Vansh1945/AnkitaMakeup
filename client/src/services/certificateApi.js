import api from './api';

/**
 * Fetch verified certificates from backend API
 * GET /certificates or GET /api/v1/certificates
 */
export const getCertificates = async () => {
  try {
    const response = await api.get('/certificates');

    // Normalize response formats
    let dataList = [];
    if (Array.isArray(response)) {
      dataList = response;
    } else if (response && Array.isArray(response.data)) {
      dataList = response.data;
    } else if (response && Array.isArray(response.certificates)) {
      dataList = response.certificates;
    }

    // Return only verified certificates
    return dataList.filter((cert) => cert && cert.isVerified !== false);
  } catch (error) {
    console.error('Error fetching certificates from backend:', error);
    throw error;
  }
};
