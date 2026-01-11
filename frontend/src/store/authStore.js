import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            login: async (username, password) => {
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);

                const response = await api.post('/auth/login', formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                const { access_token } = response.data;
                set({ token: access_token, isAuthenticated: true });

                // Fetch user info
                const userResponse = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${access_token}` },
                });
                set({ user: userResponse.data });

                return response.data;
            },

            logout: () => {
                set({ token: null, user: null, isAuthenticated: false });
            },

            getToken: () => get().token,
        }),
        {
            name: 'auth-storage',
        }
    )
);

export default useAuthStore;
