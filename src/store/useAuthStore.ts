import { create } from "zustand";
import i18n from "@/i18n";

import { IAuthPayload, IAuthPayloadWithoutId, IApiError } from "@/types";

import { AuthService } from "@/services/authService";

interface IAuthState {
  user: IAuthPayload | null;
  isLoading: boolean;
  error: string | null;
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

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await AuthService.login(payload);

      localStorage.setItem("token", data.accessToken);
      set({ user: data.user });

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

      localStorage.setItem("token", data.accessToken);
      set({ user: data.user });

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

  requestPasswordReset: async (email: string) => {
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

  resetPassword: async (token: string, newPassword: string) => {
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
