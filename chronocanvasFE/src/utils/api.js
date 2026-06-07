import axios from 'axios';

const api = axios.create({
  // Otomatis memilih URL berdasarkan environment (lokal vs production/Vercel)
  baseURL: import.meta.env.PROD ? 'https://chronocanvas-ykf9.vercel.app/api' : 'http://localhost:3000/api', 
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
