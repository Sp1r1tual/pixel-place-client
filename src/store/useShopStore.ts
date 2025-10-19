import { create } from "zustand";
import i18n from "@/i18n";

import { useCanvasStore } from "@/store/useCanvasStore";

import { IShopItem, IShopResponse } from "@/types";

import { ShopService } from "@/services/shopService";

interface IShopState {
  items: IShopItem[];
  currency: number;
  loading: boolean;
  error: string | null;
  fetchShop: (force?: boolean) => Promise<void>;
  buyUpgrade: (
    itemType: "energyLimit" | "recoverySpeed" | "pixelReward",
  ) => Promise<void>;
}

const useShopStore = create<IShopState>((set, get) => ({
  items: [],
  currency: 0,
  loading: false,
  error: null,

  fetchShop: async (force = false) => {
    const { items } = get();
    if (!force && items.length > 0) return;

    set({ loading: true, error: null });

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
    set({ loading: true, error: null });
    try {
      const response = await ShopService.buyUpgrade(itemType);
      const { effectValue } = response.data;

      if (itemType === "energyLimit") {
        const canvasStore = useCanvasStore.getState();
        canvasStore.setMaxEnergy(canvasStore.maxEnergy + 1);
        canvasStore.setEnergy(canvasStore.energy + 1);
      }

      if (itemType === "recoverySpeed") {
        const canvasStore = useCanvasStore.getState();
        canvasStore.setRecoverySpeed(effectValue);
      }

      await get().fetchShop(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : i18n.t("shop.cannot-fetch");
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },
}));

export { useShopStore };
