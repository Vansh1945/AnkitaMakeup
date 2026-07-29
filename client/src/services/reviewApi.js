import api from './api';

/**
 * Fetch approved customer reviews from backend API
 * GET /reviews or GET /testimonials/approved or GET /testimonials
 */
export const getApprovedReviews = async (params = {}) => {
  try {
    let response;
    try {
      response = await api.get('/reviews', { params });
    } catch (e) {
      try {
        response = await api.get('/testimonials/approved', { params });
      } catch (e2) {
        response = await api.get('/testimonials', { params });
      }
    }

    // Normalize response formats
    let dataList = [];
    if (Array.isArray(response)) {
      dataList = response;
    } else if (response && Array.isArray(response.data)) {
      dataList = response.data;
    } else if (response && Array.isArray(response.reviews)) {
      dataList = response.reviews;
    }

    // Filter ONLY approved reviews (Pending and Rejected reviews are NEVER returned to public website)
    return dataList.filter((rev) => {
      if (!rev) return false;
      const statusStr = (rev.status || '').toLowerCase();
      if (statusStr === 'approved') return true;
      if (statusStr === 'pending' || statusStr === 'rejected') return false;
      return rev.approved === true;
    });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    throw error;
  }
};

/**
 * Fetch review statistics from backend API
 * GET /reviews/stats or GET /testimonials/stats
 */
export const getReviewStats = async () => {
  try {
    const response = await api.get('/reviews/stats').catch(() => null);
    if (response && response.data) return response.data;
    if (response && response.stats) return response.stats;
    return response;
  } catch (error) {
    return null;
  }
};

/**
 * Submit a new customer review (Status defaults to Pending)
 * POST /testimonials or POST /reviews
 */
export const submitReview = async (reviewPayload) => {
  try {
    let response;
    try {
      response = await api.post('/testimonials', reviewPayload);
    } catch (e) {
      response = await api.post('/reviews', reviewPayload);
    }
    return response;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};
