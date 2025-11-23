export interface IShopItem {
  id: string;
  name: string;
  type: "energy_limit" | "recovery_speed" | "pixel_reward";
  price: number;
  level: number;
  maxLevel: number;
  image_url: string;
}

export interface IShopResponse {
  items: IShopItem[];
  currency: number;
}
