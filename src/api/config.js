export const BASE_URL = 'https://blackhawks.biznes-armiya.uz/api';

export const API_ENDPOINTS = {
  DRIVER: {
    BASE: '/driver',
    CREATE: '/driver/create',
    UPDATE: (id) => `/driver/${id}`,
    DELETE: (id) => `/driver/${id}`,
    GET_ONE: (id) => `/driver/${id}`,
  }
}; 