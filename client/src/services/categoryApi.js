import api from './api';

/**
 * Fetch all categories from backend database API
 * @param {boolean} all - If true, fetches all categories including inactive ones
 */
export const getCategories = async (all = false) => {
  try {
    const res = await api.get(`/categories${all ? '?all=true' : ''}`);
    // Backend returns { success: true, data: [...categories] }
    const body = res.data;
    if (body && Array.isArray(body.data)) return body.data;
    if (Array.isArray(body)) return body;
    return [];
  } catch (error) {
    console.error('Error fetching categories from database:', error);
    return [];
  }
};

/**
 * Create a new category (Admin protected)
 */
export const createCategory = async (categoryData) => {
  const res = await api.post('/categories', categoryData);
  return res.data || res;
};

/**
 * Update existing category (Admin protected)
 */
export const updateCategory = async (id, categoryData) => {
  const res = await api.put(`/categories/${id}`, categoryData);
  return res.data || res;
};

/**
 * Delete category (Admin protected)
 */
export const deleteCategory = async (id) => {
  const res = await api.delete(`/categories/${id}`);
  return res;
};
