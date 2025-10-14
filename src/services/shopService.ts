import { $api } from "@/api";

class ShopService {
  static async getShop() {
    return $api.get("/shop");
  }

  static async buyUpgrade(upgradeId: number) {
    return $api.patch("/shop/upgrade", { id: upgradeId });
  }
}

export { ShopService };
