import { useState } from "react";

import { PALETTE_COLORS } from "@/data/canvas";

import styles from "./styles/Palette.module.css";

interface PaletteProps {
  onSelectColor?: (color: string) => void;
}

const Palette = ({ onSelectColor }: PaletteProps) => {
  const [selectedColor, setSelectedColor] = useState<string>(
    PALETTE_COLORS[0] || "#000000",
  );

  const handleSelect = (color: string) => {
    setSelectedColor(color);
    if (onSelectColor) onSelectColor(color);
  };

  return (
    <div className={styles.palette}>
      {PALETTE_COLORS.map((color) => (
        <div
          key={color}
          className={`${styles.colorBox} ${
            color === selectedColor ? styles.selected : ""
          }`}
          style={{ backgroundColor: color }}
          onClick={() => handleSelect(color)}
        />
      ))}
    </div>
  );
};

export { Palette };
