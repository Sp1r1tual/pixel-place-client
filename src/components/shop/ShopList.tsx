import { IShopItem } from "@/types";

import { ShopItem } from "./ShopItem";

import styles from "./styles/ShopList.module.css";

interface IShopListProps {
  items: IShopItem[];
  loading?: boolean;
}

const ShopList = ({ items, loading = false }: IShopListProps) => {
  if (loading) {
    return (
      <div className={styles.list}>
        {[0, 1, 2].map((i) => (
          <ShopItem key={i} loading />
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
