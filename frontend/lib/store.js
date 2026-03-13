import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await api.login(email, password);
          localStorage.setItem('cinepick_token', data.access_token);
          set({ user: data.user, token: data.access_token, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      signup: async (email, password, username) => {
        set({ isLoading: true });
        try {
          await api.signup(email, password, username);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        try { await api.logout(); } catch {}
        localStorage.removeItem('cinepick_token');
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token
    }),
    {
      name: 'cinepick-auth',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
);

// Watchlist Store
export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWatchlist: async () => {
        set({ isLoading: true });
        try {
          const data = await api.getWatchlist();
          set({ items: data.watchlist, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addToWatchlist: async (movieId) => {
        try {
          const data = await api.addToWatchlist(movieId);
          set(state => ({ items: [data.item, ...state.items] }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      removeFromWatchlist: async (movieId) => {
        try {
          await api.removeFromWatchlist(movieId);
          set(state => ({ items: state.items.filter(i => i.movie_id !== movieId) }));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      isInWatchlist: (movieId) => {
        return get().items.some(i => i.movie_id === movieId);
      }
    }),
    {
      name: 'cinepick-watchlist',
      partialize: (state) => ({ items: state.items })
    }
  )
);
