import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: (data) => api.post('/login', data),
    register: (data) => api.post('/register', data),
    logout: () => api.post('/logout'),
    me: () => api.get('/user'),
};

// Dashboard API calls
export const dashboardAPI = {
    getDashboard: () => api.get('/dashboard'),
};

export default api;