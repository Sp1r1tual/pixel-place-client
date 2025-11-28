import { $apiMain } from "@/api";

type UpgradeType = "energy_limit" | "recovery_speed" | "pixel_reward";

class ShopService {
  static async getShop() {
    return $apiMain.get("/shop");
  }

  static async buyUpgrade(upgradeType: UpgradeType) {
    return $apiMain.post("/shop/upgrade", { statId: upgradeType });
  }
}

export { ShopService };
