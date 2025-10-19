import { $api } from "@/api";

type UpgradeType = "energyLimit" | "recoverySpeed" | "pixelReward";

class ShopService {
  static async getShop() {
    return $api.get("/shop");
  }

  static async buyUpgrade(upgradeType: UpgradeType) {
    return $api.post("/shop/upgrade", { statId: upgradeType });
  }
}

export { ShopService };
