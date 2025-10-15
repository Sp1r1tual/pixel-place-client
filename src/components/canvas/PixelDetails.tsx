import { IPixel } from "@/types/canvas";

import { CloseBtn } from "../ui/CloseBtn";

import styles from "./styles/PixelDetails.module.css";

interface PixelDetailsProps {
  pixel: IPixel;
  onClose: () => void;
}

const PixelDetails = ({ pixel, onClose }: PixelDetailsProps) => {
  return (
    <div className={styles.details}>
      <div className={styles["details-header"]}>
        <p>
          Coordinates: x:{pixel.x}, y:{pixel.y}
        </p>

        <CloseBtn onClick={onClose} />
      </div>

      <p>Color: {pixel.color}</p>
      <p>User ID: {pixel.userId}</p>
    </div>
  );
};

export { PixelDetails };
