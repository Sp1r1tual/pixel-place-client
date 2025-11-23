import { create } from "zustand";
import i18n from "@/i18n";

import { useCanvasStore } from "@/store/useCanvasStore";

import { IShopItem, IShopResponse } from "@/types";

import { ShopService } from "@/services/shopService";

import { playTapSound } from "@/utils/sfx/playTapSound";

import cashoutMp3 from "@/assets/sounds/metal-coin-rattle.mp3";

interface IShopState {
  items: IShopItem[];
  currency: number;
  loading: boolean;
  error: string | null;
  upgradingItemType: string | null;
  fetchShop: (force?: boolean, silent?: boolean) => Promise<void>;
  buyUpgrade: (
    itemType: "energy_limit" | "recovery_speed" | "pixel_reward",
  ) => Promise<void>;
}

const useShopStore = create<IShopState>((set, get) => ({
  items: [],
  currency: 0,
  loading: false,
  error: null,
  upgradingItemType: null,

  fetchShop: async (force = false, silent = false) => {
    const { items } = get();
    if (!force && items.length > 0) return;

    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      const response = await ShopService.getShop();
      const data: IShopResponse = response.data;

      set({
        items: data.items,
        currency: data.currency,
        loading: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : i18n.t("shop.cannot-fetch");
      set({ error: message, loading: false });
    }
  },

  buyUpgrade: async (itemType) => {
    set({ upgradingItemType: itemType, error: null });

    try {
      const response = await ShopService.buyUpgrade(itemType);
      const { data } = response;

      const { effectValue } = data;
      const canvasStore = useCanvasStore.getState();

      if (itemType === "energy_limit") {
        canvasStore.setMaxEnergy(canvasStore.maxEnergy + 1);
        canvasStore.setEnergy(canvasStore.energy + 1);
      }
      if (itemType === "recovery_speed") {
        canvasStore.setRecoverySpeed(data.recoverySpeed ?? effectValue);
      }
      if (itemType === "pixel_reward") {
        canvasStore.setPixelReward(effectValue);
      }

      set((state) => ({
        currency:
          data.currency ??
          state.currency -
            (state.items.find((i) => i.type === itemType)?.price || 0),
        items: state.items.map((i) =>
          i.type === itemType && i.level! < i.maxLevel!
            ? { ...i, level: i.level! + 1 }
            : i,
        ),
        upgradingItemType: null,
      }));

      playTapSound(cashoutMp3);

      const { fetchShop } = get();
      fetchShop(true, true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : i18n.t("shop.cannot-fetch");
      set({ error: message, upgradingItemType: null });
    }
  },
}));

export { useShopStore };
