import { create } from "zustand";

import { IAuthPayload, IApiError } from "@/types";

import { AuthService } from "@/services/authService";

interface IAuthState {
  user: IAuthPayload | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: IAuthPayload) => Promise<void>;
  logout: () => void;
  registration: (payload: IAuthPayload) => Promise<void>;
  setError: (message: string | null) => void;
}

const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await AuthService.login(payload);

      localStorage.setItem("token", data.accessToken);
      set({ user: data.user });
    } catch (err) {
      const error = (err as { response?: { data?: IApiError } })?.response
        ?.data;

      set({ error: error?.message || "Login failed" });
    } finally {
      set({ isLoading: false });
    }
  },

  registration: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await AuthService.registration(payload);

      localStorage.setItem("token", data.accessToken);
      set({ user: data.user });
    } catch (err) {
      const error = (err as { response?: { data?: IApiError } })?.response
        ?.data;

      set({ error: error?.message || "Registration failed" });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    AuthService.logout();
    localStorage.removeItem("token");
    set({ user: null });
  },

  setError: (message) => set({ error: message }),
}));

export { useAuthStore };
