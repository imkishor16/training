const API_CONFIG = {
  BASE_URL: 'http://localhost:5147/api',
  VERSION: 'v1',
};

export const getApiUrl = (): string => {
  return API_CONFIG.BASE_URL;
};

export const API_ENDPOINTS = {
  LOGIN: `${getApiUrl()}/v1/auth/login`,
  SIGNUP: `${getApiUrl()}/v1/Users`,
  LOGOUT: `${getApiUrl()}/v1/auth/logout`,
  REFRESH_TOKEN: `${getApiUrl()}/v1/auth/refresh`,
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

  //notifications
  GET_NOTIFICATIONS: (page: number, pageSize: number) => `${getApiUrl()}/v1/notification?page=${page}&pageSize=${pageSize}`,
  GET_NOTIFICATION_BY_ID: (id: number) => `${getApiUrl()}/v1/notification/${id}`,
  MARK_NOTIFICATION_READ: (id: number) => `${getApiUrl()}/v1/notification/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: `${getApiUrl()}/v1/notification/read-all`,
  DELETE_NOTIFICATION: (id: number) => `${getApiUrl()}/v1/notification/${id}`,
  GET_UNREAD_COUNT: `${getApiUrl()}/v1/notification/unread-count`,
  CREATE_NOTIFICATION: `${getApiUrl()}/v1/notification`,
};

export default API_CONFIG; 