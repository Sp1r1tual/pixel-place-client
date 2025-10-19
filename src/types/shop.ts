export interface IShopItem {
  id: string;
  name: string;
  type: "energyLimit" | "recoverySpeed" | "pixelReward";
  price: number;
  level: number;
  maxLevel: number;
  image_url: string;
}

export interface IShopResponse {
  items: IShopItem[];
  currency: number;
}
