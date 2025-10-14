import { IShopItem } from "@/types";

import { PrimaryBtn } from "../ui/PrimaryBtn";

import styles from "./styles/ShopItem.module.css";

type IShopItemProps = Omit<IShopItem, "id">;

const ShopItem = ({ name, price, image }: IShopItemProps) => {
  return (
    <div className={styles.item}>
      <img src={image} alt={name} className={styles.image} />
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.price}>Price: {price}px</p>

      <PrimaryBtn
        text="Buy upgrade"
        isLoading={false}
        onClick={() => console.log("buy")}
      />
    </div>
  );
};

export { ShopItem };
