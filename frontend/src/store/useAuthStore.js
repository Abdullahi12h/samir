import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    login: async (username, password) => {
        try {
            const { data } = await api.post('/auth/login', { username, password });
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    },
    register: async (userData, autoLogin = true) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            if (autoLogin) {
                localStorage.setItem('user', JSON.stringify(data));
                set({ user: data });
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    },
    logout: () => {
        localStorage.removeItem('user');
        set({ user: null });
    },
}));

export default useAuthStore;
