import { create } from "zustand";
import i18n from "@/i18n";

import {
  IUserPublic,
  IAuthPayloadWithoutId,
  IApiError,
  ILoginResponse,
} from "@/types";

import { AuthService } from "@/services/authService";

interface IAuthState {
  user: IUserPublic | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: IUserPublic | null) => void;
  login: (payload: IAuthPayloadWithoutId) => Promise<boolean>;
  logout: () => void;
  registration: (payload: IAuthPayloadWithoutId) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  setError: (message: string | null) => void;
}

const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user: IUserPublic | null) => set({ user }),

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await AuthService.login(payload);
      const { accessToken, user } = data as ILoginResponse;

      localStorage.setItem("token", accessToken);
      set({ user });

      return true;
    } catch (err) {
      const error = (err as { response?: { data?: IApiError } })?.response
        ?.data;
      set({ error: error?.message || i18n.t("auth.errors.login-failed") });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  registration: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await AuthService.registration(payload);
      const { accessToken, user } = data as ILoginResponse;

      localStorage.setItem("token", accessToken);
      set({ user });

      return true;
    } catch (err) {
      const error = (err as { response?: { data?: IApiError } })?.response
        ?.data;
      set({
        error: error?.message || i18n.t("auth.errors.registration-failed"),
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    AuthService.logout();
    localStorage.removeItem("token");
    set({ user: null });
  },

  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.requestPasswordReset(email);
      return true;
    } catch (err) {
      const error = (err as { response?: { data?: IApiError } })?.response
        ?.data;
      set({
        error: error?.message || i18n.t("auth.errors.password-reset-failed"),
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.resetPassword(token, newPassword);
      return true;
    } catch (err) {
      const error = (err as { response?: { data?: IApiError } })?.response
        ?.data;
      set({
        error: error?.message || i18n.t("auth.errors.reset-password-failed"),
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (message) => set({ error: message }),
}));

export { useAuthStore };
