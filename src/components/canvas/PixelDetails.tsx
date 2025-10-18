import { useTranslation } from "react-i18next";

import { IPixel } from "@/types/canvas";

import { CloseBtn } from "../ui/CloseBtn";

import styles from "./styles/PixelDetails.module.css";

interface PixelDetailsProps {
  pixel: IPixel;
  onClose: () => void;
}

const PixelDetails = ({ pixel, onClose }: PixelDetailsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.details}>
      <div className={styles["details-header"]}>
        <p>
          {t("canvas.pixel-details.coordinates")}: x:{pixel.x}, y:{pixel.y}
        </p>

        <CloseBtn onClick={onClose} />
      </div>

      <p>
        {t("canvas.pixel-details.color")}: {pixel.color}
      </p>
      <p>
        {t("canvas.pixel-details.user-id")}: {pixel.userId}
      </p>
    </div>
  );
};

export { PixelDetails };
