import { create } from "zustand";

interface IUserInterfaceState {
  isHidden: boolean;
  toggleInterface: () => void;
  showInterface: () => void;
  hideInterface: () => void;
}

const useUserInterface = create<IUserInterfaceState>((set) => ({
  isHidden: false,

  toggleInterface: () =>
    set((state) => ({
      isHidden: !state.isHidden,
    })),

  showInterface: () => set({ isHidden: false }),
  hideInterface: () => set({ isHidden: true }),
}));

export { useUserInterface };
