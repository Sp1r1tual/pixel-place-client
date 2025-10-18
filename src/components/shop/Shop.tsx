import { useTranslation } from "react-i18next";

import { IShopItem } from "@/types";

import { ShopList } from "./ShopList";
import { Balance } from "./Balance";

import shopEnergyPng from "@/assets/pixel-energy.png";
import shopClockPng from "@/assets/pixel-clock.png";
import shopCoinPng from "@/assets/pixel-coin.png";

import styles from "./styles/Shop.module.css";

const items: IShopItem[] = [
  { id: 1, name: "Energy limit", price: 100, image: shopEnergyPng },
  { id: 2, name: "Energy recovery rate", price: 200, image: shopClockPng },
  { id: 3, name: "Pixel Reward", price: 300, image: shopCoinPng },
];

const Shop = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.shopContainer}>
      <div className={styles.header}>
        <h1>{t("shop.header")}</h1>

        <div className={styles.balanceWrapper}>
          <Balance amount={100500} />
        </div>
      </div>

      <ShopList items={items} />
    </div>
  );
};

export { Shop };
