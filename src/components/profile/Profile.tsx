import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAvatar } from "@/hooks/useAvatar";
import { useProfileStore } from "@/store/useProfileStore";

import { CloseBtn } from "../ui/CloseBtn";
import { Spinner } from "../ui/Spinner";
import { PrimaryBtn } from "../ui/PrimaryBtn";
import { EditProfile } from "./EditProfile";

import defaultAvatarSvg from "@/assets/avatar-svgrepo-com.svg";

import styles from "./styles/Profile.module.css";

interface IProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const Profile = ({ isOpen, onClose }: IProfileProps) => {
  const { t } = useTranslation();

  const {
    currentProfile,
    viewedProfile,
    isLoadingCurrent,
    isLoadingViewed,
    error,
    fetchCurrentProfile,
    clearViewedProfile,
  } = useProfileStore();

  const profile = viewedProfile || currentProfile;
  const isLoading =
    isLoadingViewed || (viewedProfile === null && isLoadingCurrent);
  const isOwnProfile = !viewedProfile && currentProfile;

  const { avatarSrc, handleError } = useAvatar(
    profile?.avatarSrc || "",
    defaultAvatarSvg,
    profile?.userId,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (
      isOpen &&
      !currentProfile &&
      !isLoadingCurrent &&
      !viewedProfile &&
      !error &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      fetchCurrentProfile();
    }

    if (!isOpen) {
      hasFetchedRef.current = false;
    }
  }, [
    isOpen,
    isLoadingCurrent,
    currentProfile,
    fetchCurrentProfile,
    viewedProfile,
    error,
  ]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setIsTransitioning(false);

    onClose();
    clearViewedProfile();
  };

  const handleEditClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsEditing(true);
      setIsTransitioning(false);
    }, 200);
  };

  const handleEditClose = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsEditing(false);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <div
      className={`${styles.backdrop} ${isOpen ? styles.show : ""}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`${styles.modal} ${isOpen ? styles.show : ""} ${isEditing ? styles.editing : ""}`}
      >
        <div className={styles.closeBtnWrapper}>
          <CloseBtn onClick={handleClose} />
        </div>
        <h2>{t("profile.title")}</h2>

        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <Spinner size="large" />
          </div>
        ) : profile ? (
          <>
            {isEditing ? (
              <div
                className={`${styles.contentWrapper} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
              >
                <EditProfile onClose={handleEditClose} />
              </div>
            ) : (
              <div
                className={`${styles.contentWrapper} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
              >
                <img
                  src={avatarSrc}
                  alt={profile.username || "User avatar"}
                  className={styles.avatar}
                  key={profile.userId}
                  onError={handleError}
                />

                <span className={styles.username}>
                  {profile.username || t("profile.no-username")}
                </span>

                <span className={styles.id}>Id: {profile.userId}</span>

                <div className={styles.info}>
                  <div className={styles.infoItem}>
                    <span>{t("profile.level")} </span>
                    <span>{profile.level}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <span>{t("profile.repaints")} </span>
                    <span>{profile.repaints}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <span>{t("profile.joined")} </span>
                    <span>{profile.joined}</span>
                  </div>
                </div>

                <div className={styles.stats}>
                  <div className={styles.bioWrapper}>
                    {profile.bio || t("profile.no-bio")}
                  </div>
                </div>

                {isOwnProfile && (
                  <div className={styles.editBtnWrapper}>
                    <PrimaryBtn
                      text={t("profile.edit-profile")}
                      isLoading={false}
                      onClick={handleEditClick}
                      type="button"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div>{t("profile.not-found")}</div>
        )}
      </div>
    </div>
  );
};

export { Profile };
