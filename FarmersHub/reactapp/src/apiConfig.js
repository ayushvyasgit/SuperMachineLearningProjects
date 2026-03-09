import axios from 'axios';

// ✅ Support dynamic base URL via environment variable for Docker deployments
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = `${BASE_URL}/api`;

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

// ==================== Storage Helpers ====================

// Token stored in sessionStorage (too large for cookies)
const getToken = () => {
  try {
    return sessionStorage.getItem('token');
  } catch (e) {
    return null;
  }
};

const setToken = (value) => {
  try {
    sessionStorage.setItem('token', value);
  } catch (e) {
    console.error('❌ Failed to set token in sessionStorage:', e);
  }
};

const clearToken = () => {
  try {
    sessionStorage.removeItem('token');
  } catch (e) {}
};

// Other user info stored in cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
};

const setCookie = (name, value, days = 1) => {
  const maxAge = days * 24 * 60 * 60;
  const encodedValue = encodeURIComponent(value);
  document.cookie = `${name}=${encodedValue}; path=/; max-age=${maxAge}; SameSite=Strict`;
};

const clearCookie = (name) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

// ==================== Axios Instance ====================

// ✅ Simple, direct axios.create — no unnecessary typeof check
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ✅ Request interceptor — reads token from sessionStorage (where it's actually saved)
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor — handles 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';

      if (
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('invalid')
      ) {
        clearToken();
        clearCookie('userId');
        clearCookie('userName');
        clearCookie('userRole');

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==================== USER APIs ====================
export const userAPI = {
  signup: (userData) => api.post('/users/signup', userData),

  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);

    if (response.data) {
      const { token, userId, userName, role } = response.data;

      if (token) setToken(token);
      if (userId) setCookie('userId', userId, 1);
      if (userName) setCookie('userName', userName, 1);
      if (role) setCookie('userRole', role, 1);
    }

    return response;
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearToken();
      clearCookie('userId');
      clearCookie('userName');
      clearCookie('userRole');
    }
  },

  getCurrentUser: () => ({
    userId: getCookie('userId'),
    userName: getCookie('userName'),
    userRole: getCookie('userRole'),
    token: getToken(),
  }),
};

// ==================== FEED APIs ====================
export const feedAPI = {
  getAllFeeds: () => api.get('/feed/getAllFeeds'),
  getSupplierFeeds: () => api.get('/feed/supplier/my-feeds'),
  getFeedById: (id) => api.get(`/feed/getFeedById/${id}`),
  addFeed: (feedData) => api.post('/feed/addFeed', feedData),
  updateFeed: (id, feedData) => api.put(`/feed/updateFeed/${id}`, feedData),
  deleteFeed: (id) => api.delete(`/feed/deleteFeed/${id}`),
};

// ==================== MEDICINE APIs ====================
export const medicineAPI = {
  getAllMedicines: () => api.get('/medicine/getAllMedicines'),
  getSupplierMedicines: () => api.get('/medicine/supplier/my-medicines'),
  getMedicineById: (id) => api.get(`/medicine/getMedicineById/${id}`),
  addMedicine: (medicineData) => api.post('/medicine/addMedicine', medicineData),
  updateMedicine: (id, medicineData) => api.put(`/medicine/updateMedicine/${id}`, medicineData),
  deleteMedicine: (id) => api.delete(`/medicine/deleteMedicine/${id}`),
};

// ==================== LIVESTOCK APIs ====================
export const livestockAPI = {
  getAllLivestock: () => api.get('/livestock/getAllLivestock'),
  getLivestockByOwnerId: () => api.get('/livestock/owner/all'),
  getLivestockById: (id) => api.get(`/livestock/getLivestockById/${id}`),
  addLivestock: (livestockData) => api.post('/livestock/addLivestock', livestockData),
  updateLivestock: (id, livestockData) => api.put(`/livestock/updateLivestock/${id}`, livestockData),
  deleteLivestock: (id) => api.delete(`/livestock/deleteLivestock/${id}`),
};

// ==================== REQUEST APIs ====================
export const requestAPI = {
  getAllRequestsBySupplier: () => api.get('/request/supplier/all'),
  getRequestsByOwnerId: () => api.get('/request/owner/all'),
  addRequest: (requestData) => api.post('/request/addRequest', requestData),
  updateRequestStatus: (id, status) => api.put(`/request/updateRequestStatus/${id}`, { status }),
  deleteRequest: (id) => api.delete(`/request/deleteRequest/${id}`),
};

// ==================== FEEDBACK APIs ====================
export const feedbackAPI = {
  getAllFeedbacksBySupplier: () => api.get('/feedback/supplier/all'),
  getFeedbacksByOwnerId: () => api.get('/feedback/owner/all'),
  // ✅ Fixed typo: '/addFeed back' → '/addFeedback'
  addFeedback: (feedbackData) => api.post('/feedback/addFeedback', feedbackData),
  deleteFeedback: (id) => api.delete(`/feedback/deleteFeedback/${id}`),
};

export default api;