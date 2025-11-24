import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { IPixel } from "@/types/canvas";

import { useProfileStore } from "@/store/useProfileStore";

import { CloseBtn } from "../ui/CloseBtn";
import { Spinner } from "../ui/Spinner";

import defaultAvatarSvg from "@/assets/avatar-svgrepo-com.svg";

import styles from "./styles/PixelDetails.module.css";

interface IPixelDetailsProps {
  pixel: IPixel;
  onClose: () => void;
}

const PixelDetails = ({ pixel, onClose }: IPixelDetailsProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const {
    pixelProfile,
    isLoadingPixel,
    fetchPixelUserProfile,
    clearPixelProfile,
    openProfile,
    setViewedProfile,
  } = useProfileStore();

  useEffect(() => {
    if (pixel.userId) {
      fetchPixelUserProfile(pixel.userId);
    }

    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      clearPixelProfile();
    };
  }, [pixel.userId, fetchPixelUserProfile, clearPixelProfile]);

  const handleUserClick = () => {
    if (pixel.userId && pixelProfile) {
      setViewedProfile(pixelProfile);
      openProfile();
    }
  };

  return (
    <div className={`${styles.details} ${isVisible ? styles.visible : ""}`}>
      <div className={styles["details-header"]}>
        <p>
          {t("canvas.pixel-details.coordinates")}: x:{pixel.x}, y:{pixel.y}
        </p>

        <CloseBtn onClick={onClose} />
      </div>

      <p>
        {t("canvas.pixel-details.color")} {pixel.color}
      </p>

      {pixel.placedAt && (
        <p className={styles.placedDate}>
          {t("canvas.pixel-details.placed")} {pixel.placedAt}
        </p>
      )}

      <div className={styles.userInfo}>
        {isLoadingPixel ? (
          <Spinner size="small" />
        ) : pixelProfile ? (
          <>
            <div className={styles.userHeader} onClick={handleUserClick}>
              <img
                src={pixelProfile.avatarSrc || defaultAvatarSvg}
                alt={pixelProfile.username || "User avatar"}
                className={styles.avatar}
              />

              <div className={styles.userDetails}>
                <p className={styles.username}>
                  {pixelProfile.username || t("profile.no-username")}
                </p>
                <p className={styles.level}>
                  {t("profile.level")} {pixelProfile.level}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export { PixelDetails };
