import { useTranslation } from "react-i18next";

import { IShopItem } from "@/types";

import { PrimaryBtn } from "../ui/PrimaryBtn";

import styles from "./styles/ShopItem.module.css";

type IShopItemProps = Omit<IShopItem, "id">;

const ShopItem = ({ name, price, image }: IShopItemProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.item}>
      <img src={image} alt={name} className={styles.image} />
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.price}>
        {t("shop.price")}: {price}px
      </p>

      <PrimaryBtn
        text={t("shop.buy-upgrade")}
        isLoading={false}
        onClick={() => console.log("buy")}
      />
    </div>
  );
};

export { ShopItem };
