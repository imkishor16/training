export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum MessageType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: number;
  details?: any;
}

export interface AppMessage {
  type: MessageType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 for no auto-dismiss
}

// Common error messages
export const ERROR_MESSAGES = {
  [ErrorType.NETWORK_ERROR]: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.'
  },
  [ErrorType.UNAUTHORIZED]: {
    title: 'Authentication Failed',
    message: 'Invalid email or password. Please check your credentials and try again.'
  },
  [ErrorType.FORBIDDEN]: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.'
  },
  [ErrorType.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested resource was not found.'
  },
  [ErrorType.VALIDATION_ERROR]: {
    title: 'Validation Error',
    message: 'Please check your input and try again.'
  },
  [ErrorType.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.'
  },
  [ErrorType.UNKNOWN_ERROR]: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.'
  }
};

// Success messages
export const SUCCESS_MESSAGES = {
  SIGNIN: {
    title: 'Welcome Back!',
    message: 'You have successfully signed in to your account.'
  },
  SIGNUP: {
    title: 'Account Created!',
    message: 'Your account has been created successfully. Welcome to our platform!'
  },
  LOGOUT: {
    title: 'Signed Out',
    message: 'You have been successfully signed out.'
  }
};

// Helper function to convert HTTP error to AppError
export function createAppError(error: any): AppError {
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          type: ErrorType.UNAUTHORIZED,
          message: ERROR_MESSAGES[ErrorType.UNAUTHORIZED].message,
          code: 401
        };
      case 403:
        return {
          type: ErrorType.FORBIDDEN,
          message: ERROR_MESSAGES[ErrorType.FORBIDDEN].message,
          code: 403
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: ERROR_MESSAGES[ErrorType.NOT_FOUND].message,
          code: 404
        };
      case 422:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: ERROR_MESSAGES[ErrorType.VALIDATION_ERROR].message,
          code: 422
        };
      case 500:
        return {
          type: ErrorType.SERVER_ERROR,
          message: ERROR_MESSAGES[ErrorType.SERVER_ERROR].message,
          code: 500
        };
      default:
        return {
          type: ErrorType.UNKNOWN_ERROR,
          message: ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR].message,
          code: error.status
        };
    }
  }
  
  // Network or other errors
  if (error.name === 'NetworkError' || !navigator.onLine) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: ERROR_MESSAGES[ErrorType.NETWORK_ERROR].message
    };
  }
  
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: error.message || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR].message
  };
} 