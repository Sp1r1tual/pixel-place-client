import { IShopItem } from "@/types";

import { ShopItem } from "./ShopItem";

import { v4 as uuidv4 } from "uuid";

import styles from "./styles/ShopList.module.css";

interface IShopListProps {
  items: IShopItem[];
  loading?: boolean;
}

const ShopList = ({ items, loading = false }: IShopListProps) => {
  if (loading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 3 }).map(() => (
          <ShopItem key={uuidv4()} loading />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <ShopItem
          key={item.id}
          type={item.type}
          name={item.name}
          price={item.price}
          image_url={item.image_url}
          level={item.level}
          maxLevel={item.maxLevel}
        />
      ))}
    </div>
  );
};

export { ShopList };
