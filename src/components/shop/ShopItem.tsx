import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import { useShopStore } from "@/store/useShopStore";

import { PrimaryBtn } from "../ui/PrimaryBtn";

import "react-loading-skeleton/dist/skeleton.css";
import styles from "./styles/ShopItem.module.css";

type IShopItemProps = {
  type?: "energyLimit" | "recoverySpeed" | "pixelReward";
  name?: string;
  price?: number;
  image_url?: string;
  level?: number;
  maxLevel?: number;
  loading?: boolean;
};

const ShopItem = ({
  type,
  name,
  price,
  image_url,
  level,
  maxLevel,
  loading = false,
}: IShopItemProps) => {
  const { buyUpgrade } = useShopStore();
  const { t } = useTranslation();

  const skeletonProps = {
    baseColor: "#404955",
    highlightColor: "#f8f8f8",
    borderRadius: 8,
  };

  const handleBuy = () => {
    if (!type) return;
    buyUpgrade(type);
  };

  return (
    <div className={styles.item}>
      {loading ? (
        <Skeleton
          width={240}
          height={240}
          {...skeletonProps}
          style={{ marginBottom: 12 }}
        />
      ) : (
        <img src={image_url} alt={name} className={styles.image} />
      )}

      {loading ? (
        <Skeleton
          width={120}
          height={24}
          {...skeletonProps}
          style={{ marginBottom: 8 }}
        />
      ) : (
        <h3 className={styles.name}>{t(name || "")}</h3>
      )}

      {loading ? (
        <Skeleton
          width={80}
          height={20}
          {...skeletonProps}
          style={{ marginBottom: 4 }}
        />
      ) : (
        <p className={styles.level}>
          {t("shop.level")} {level} / {maxLevel}
        </p>
      )}

      {loading ? (
        <Skeleton
          width={80}
          height={20}
          {...skeletonProps}
          style={{ marginBottom: 12 }}
        />
      ) : (
        <p className={styles.price}>
          {t("shop.price")}: {price}px
        </p>
      )}

      {loading ? (
        <Skeleton
          width={140}
          height={40}
          {...skeletonProps}
          style={{ borderRadius: 10 }}
        />
      ) : (
        <PrimaryBtn
          text={t("shop.buy-upgrade")}
          isLoading={false}
          onClick={handleBuy}
          disabled={level === maxLevel}
        />
      )}
    </div>
  );
};

export { ShopItem };
