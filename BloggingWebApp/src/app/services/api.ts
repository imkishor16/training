const API_CONFIG = {
  BASE_URL: 'http://localhost:5147/api',
  VERSION: 'v1',
  SIGNALR_HUB: 'http://localhost:5147/postHub',
};

export const getApiUrl = (): string => {
  return API_CONFIG.BASE_URL;
};

export const getSignalRHubUrl = (): string => {
  return API_CONFIG.SIGNALR_HUB;
};

export const API_ENDPOINTS = {
  LOGIN: `${getApiUrl()}/v1/auth/login`,
  SIGNUP: `${getApiUrl()}/v1/Users`,
  LOGOUT: `${getApiUrl()}/v1/auth/logout`,
  PROFILE: `${getApiUrl()}/v1/profile`,
  DASHBOARD: `${getApiUrl()}/v1/dashboard`,

  // post
  GET_ALL_POSTS: `${getApiUrl()}/v1/posts`,
  GET_POST_BY_ID: (id: string) => `${getApiUrl()}/v1/posts/${id}`,
  GET_USER_POSTS: (userId: string) => `${getApiUrl()}/v1/posts/user/${userId}`,
  GET_USER_LIKED_POSTS: (userId: string) => `${getApiUrl()}/v1/posts/user/${userId}/liked`,
  GET_USER_COMMENTED_POSTS: (userId: string) => `${getApiUrl()}/v1/posts/user/${userId}/commented`,
  GET_POST_COMMENTS: (id: string) => `${getApiUrl()}/v1/posts/${id}/comments`,
  GET_POST_IMAGES: (id: string) => `${getApiUrl()}/v1/posts/${id}/images`,
  LIKE_POST: `${getApiUrl()}/v1/likes`,
  GET_POST_LIKES: (id: string) => `${getApiUrl()}/v1/posts/${id}/likes`,
  CREATE_POST: `${getApiUrl()}/v1/posts`,
  UPDATE_POST: (id: string) => `${getApiUrl()}/v1/posts/${id}`,
  DELETE_POST: (id: string) => `${getApiUrl()}/v1/posts/${id}`,

  //comments
  GET_COMMENTS_FILTER: `${getApiUrl()}/v1/comments/filter`,
  GET_COMMENT_BY_ID: (id: string) => `${getApiUrl()}/v1/comments/${id}`,
  GET_COMMENTS: `${getApiUrl()}/v1/comments`,
  ADD_COMMENT: `${getApiUrl()}/v1/comments`,
  UPDATE_COMMENT: (commentId: string) => `${getApiUrl()}/v1/comments/${commentId}`,
  DELETE_COMMENT: (commentId: string) => `${getApiUrl()}/v1/comments/${commentId}`,

  //user
  GET_ALL_USERS: `${getApiUrl()}/v1/Users/getAll`,
  GET_USER_BY_ID: (userId: string) => `${getApiUrl()}/v1/Users/get/${userId}`,
  CREATE_USER: `${getApiUrl()}/v1/Users`,
  UPDATE_USER: (userId: string) => `${getApiUrl()}/v1/Users/${userId}`,
  DELETE_USER: (id: string) => `${getApiUrl()}/v1/Users/delete/${id}`,
  GET_POST_BY_USER: (userId: string) => `${getApiUrl()}/v1/Users/getPostByUser/${userId}`,
  GET_ALL_USERS_FILTERED: `${getApiUrl()}/v1/Users/getAll/filtered`,
};

export default API_CONFIG; 