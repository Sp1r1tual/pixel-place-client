import { create } from "zustand";
import { toast } from "react-toastify";
import i18n from "@/i18n";

import { ProfileService } from "@/services/profileService";
import { IProfileData, IUpdateProfilePayload } from "@/types/profile";
import { getAvatarUrl } from "@/utils/profile/getAvatarUrl";

interface IProfileState {
  isProfileOpen: boolean;
  currentProfile: IProfileData | null;
  isLoadingCurrent: boolean;
  viewedProfile: IProfileData | null;
  isLoadingViewed: boolean;
  pixelProfile: IProfileData | null;
  isLoadingPixel: boolean;
  error: string | null;
  openProfile: () => void;
  closeProfile: () => void;
  toggleProfile: () => void;
  fetchCurrentProfile: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;
  fetchPixelUserProfile: (userId: string) => Promise<void>;
  updateProfile: (data: IUpdateProfilePayload) => Promise<void>;
  setViewedProfile: (profile: IProfileData) => void;
  clearViewedProfile: () => void;
  clearPixelProfile: () => void;
}

const useProfileStore = create<IProfileState>((set, get) => ({
  isProfileOpen: false,
  currentProfile: null,
  isLoadingCurrent: false,
  viewedProfile: null,
  isLoadingViewed: false,
  pixelProfile: null,
  isLoadingPixel: false,
  error: null,
  openProfile: () => set({ isProfileOpen: true }),
  closeProfile: () => set({ isProfileOpen: false, viewedProfile: null }),
  toggleProfile: () =>
    set((state) => ({ isProfileOpen: !state.isProfileOpen })),

  fetchCurrentProfile: async () => {
    set({ isLoadingCurrent: true, error: null });

    try {
      const { data } = await ProfileService.getProfile();
      set({
        currentProfile: {
          ...data,
          avatarSrc: getAvatarUrl(data.avatarSrc),
        },
        isLoadingCurrent: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || i18n.t("profile.failed-to-load-profile");
      set({
        isLoadingCurrent: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  },

  fetchUserProfile: async (userId: string) => {
    set({ isLoadingViewed: true, error: null });

    try {
      const { data } = await ProfileService.getPublicProfile(userId);
      set({
        viewedProfile: {
          ...data,
          avatarSrc: getAvatarUrl(data.avatarSrc),
        },
        isLoadingViewed: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || i18n.t("profile.failed-to-load-profile");
      set({
        isLoadingViewed: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  },

  fetchPixelUserProfile: async (userId: string) => {
    set({ isLoadingPixel: true, error: null });

    try {
      const { data } = await ProfileService.getPublicProfile(userId);
      set({
        pixelProfile: {
          ...data,
          avatarSrc: getAvatarUrl(data.avatarSrc),
        },
        isLoadingPixel: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || i18n.t("profile.failed-to-load-profile");
      set({
        isLoadingPixel: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  },

  updateProfile: async (data: IUpdateProfilePayload) => {
    const { currentProfile } = get();
    if (!currentProfile) {
      toast.error(i18n.t("profile.profile-not-loaded"));
      return;
    }

    set({ isLoadingCurrent: true, error: null });

    try {
      const { data: updated } = await ProfileService.changeProfileInfo(data);
      set({
        currentProfile: {
          ...updated,
          avatarSrc: getAvatarUrl(updated.avatarSrc),
        },
        isLoadingCurrent: false,
        error: null,
      });
      toast.success(i18n.t("profile.updated-successfully"));
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || i18n.t("errors.failed-to-update-profile");
      set({
        isLoadingCurrent: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  },

  setViewedProfile: (profile: IProfileData) =>
    set({
      viewedProfile: {
        ...profile,
        avatarSrc: getAvatarUrl(profile.avatarSrc),
      },
    }),
  clearViewedProfile: () => set({ viewedProfile: null }),
  clearPixelProfile: () => set({ pixelProfile: null }),
}));

export { useProfileStore };
