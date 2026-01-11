import axios from 'axios';

const api = axios.create({
    baseURL: (window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
    },
    timeout: 30000, // 30 seconds timeout
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const { state } = JSON.parse(authStorage);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (e) {
                console.error('Error parsing auth storage:', e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 errors - redirect to login
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('auth-storage');
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
