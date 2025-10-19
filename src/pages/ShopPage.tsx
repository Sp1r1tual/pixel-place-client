import { useRef } from "react";

import { usePixelBackground } from "@/hooks/usePixelBackground";

import { Shop } from "@/components/shop/Shop";

import styles from "./styles/ShopPage.module.css";

const ShopPage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  usePixelBackground({ canvasRef });

  return (
    <div className={styles.shopPage}>
      <canvas ref={canvasRef} />

      <Shop />
    </div>
  );
};

export { ShopPage };
