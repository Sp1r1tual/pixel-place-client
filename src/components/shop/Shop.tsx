import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useShopStore } from "@/store/useShopStore";

import { ShopList } from "./ShopList";
import { Balance } from "./Balance";

import styles from "./styles/Shop.module.css";

const Shop = () => {
  const { t } = useTranslation();
  const { items, currency, loading, fetchShop } = useShopStore();

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  return (
    <div className={styles.shopContainer}>
      <div className={styles.header}>
        <h1>{t("shop.header")}</h1>
        <div className={styles.balanceWrapper}>
          <Balance amount={currency} />
        </div>
      </div>

      <ShopList items={items} loading={loading} />
    </div>
  );
};

export { Shop };
