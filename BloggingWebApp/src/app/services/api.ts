const API_CONFIG = {
  BASE_URL: 'http://localhost:5147/api',
  VERSION: 'v1',
  ENDPOINTS: {
    LOGIN: '/v1/login',
    SIGNUP: '/v1/Users',
    LOGOUT: '/v1/logout',
    PROFILE: '/v1/profile',
    DASHBOARD: '/v1/dashboard',
    GET_ALL_POSTS: '/v1/posts',
    GET_POST_BY_ID: '/v1/posts'
  }
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const API_ENDPOINTS = {
  LOGIN: getApiUrl(API_CONFIG.ENDPOINTS.LOGIN),
  SIGNUP: getApiUrl(API_CONFIG.ENDPOINTS.SIGNUP),
  LOGOUT: getApiUrl(API_CONFIG.ENDPOINTS.LOGOUT),
  PROFILE: getApiUrl(API_CONFIG.ENDPOINTS.PROFILE),
  DASHBOARD: getApiUrl(API_CONFIG.ENDPOINTS.DASHBOARD),
  GET_ALL_POSTS: getApiUrl(API_CONFIG.ENDPOINTS.GET_ALL_POSTS),
  GET_POST_BY_ID: (id: string) => getApiUrl(`${API_CONFIG.ENDPOINTS.GET_POST_BY_ID}/${id}`)
};

export default API_CONFIG; 