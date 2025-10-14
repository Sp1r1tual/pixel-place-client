import { IShopItem } from "@/types";

import { ShopItem } from "./ShopItem";

import styles from "./styles/ShopList.module.css";

interface IShopListProps {
  items: IShopItem[];
}

const ShopList = ({ items }: IShopListProps) => {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <ShopItem
          key={item.id}
          name={item.name}
          price={item.price}
          image={item.image}
        />
      ))}
    </div>
  );
};

export { ShopList };
