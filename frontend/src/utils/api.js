import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use(
    (config) => {
        const userinfo = localStorage.getItem('user');
        if (userinfo) {
            const user = JSON.parse(userinfo);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized! Logging out...');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
