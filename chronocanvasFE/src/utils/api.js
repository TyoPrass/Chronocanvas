import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:3000/api', // Local Development
  baseURL: 'https://chronocanvas-ykf9.vercel.app/api', // Production Vercel
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token secara otomatis ke setiap request (jika ada)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
