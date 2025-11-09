import { useCanvasStore } from "@/store/useCanvasStore";

import { PALETTE_COLORS } from "@/data/canvas";

import styles from "./styles/Palette.module.css";

interface PaletteProps {
  onSelectColor?: (color: string) => void;
}

const Palette = ({ onSelectColor }: PaletteProps) => {
  const selectedColor = useCanvasStore((state) => state.selectedColor);

  const handleSelect = (color: string) => {
    useCanvasStore.getState().setSelectedColor(color);
    if (onSelectColor) onSelectColor(color);
  };

  return (
    <div className={`${styles.palette} ui-element`}>
      {PALETTE_COLORS.map((color) => (
        <div
          key={color}
          className={`${styles.colorBox} ui-element ${
            color === selectedColor ? styles.selected : ""
          }`}
          style={{ backgroundColor: color }}
          onClick={() => handleSelect(color)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleSelect(color);
            }
          }}
        />
      ))}
    </div>
  );
};

export { Palette };
