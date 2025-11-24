import { useState, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { useAvatar } from "@/hooks/useAvatar";
import { useProfileStore } from "@/store/useProfileStore";
import { IUpdateProfilePayload } from "@/types/profile";
import { PrimaryBtn } from "../ui/PrimaryBtn";

import defaultAvatarSvg from "@/assets/avatar-svgrepo-com.svg";

import styles from "./styles/EditProfile.module.css";

interface IEditProfileFormProps {
  onClose: () => void;
}

const EditProfile = ({ onClose }: IEditProfileFormProps) => {
  const { t } = useTranslation();
  const { currentProfile, updateProfile, isLoadingCurrent } = useProfileStore();

  const { avatarSrc: currentAvatarSrc } = useAvatar(
    currentProfile?.avatarSrc || "",
    defaultAvatarSvg,
  );

  const [username, setUsername] = useState(currentProfile?.username || "");
  const [bio, setBio] = useState(currentProfile?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(currentAvatarSrc);

  const [usernameError, setUsernameError] = useState("");
  const [bioError, setBioError] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    if (value.length > 21) {
      setUsernameError(t("profile.username-too-long"));
    } else {
      setUsernameError("");
    }
  };

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBio(value);

    if (value.length > 500) {
      setBioError(t("profile.bio-too-long"));
    } else {
      setBioError("");
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError(t("profile.invalid-image-format"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(t("profile.image-too-large"));
      return;
    }

    setAvatarError("");
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarError = () => {
    setAvatarPreview(defaultAvatarSvg);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (usernameError || bioError || avatarError) {
      return;
    }

    const payload: IUpdateProfilePayload = {};

    if (username !== currentProfile?.username) {
      payload.username = username;
    }
    if (bio !== currentProfile?.bio) {
      payload.bio = bio;
    }
    if (avatarFile) {
      payload.avatar = avatarFile;
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    await updateProfile(payload);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.avatarSection}>
        <img
          src={avatarPreview}
          alt={username || "User avatar"}
          className={styles.avatar}
          loading="lazy"
          onError={handleAvatarError}
        />

        <button
          type="button"
          className={styles.changeAvatarBtn}
          onClick={() => document.getElementById("avatarInput")?.click()}
        >
          {t("profile.change-avatar")}
        </button>

        <input
          type="file"
          id="avatarInput"
          accept="image/*"
          onChange={handleAvatarChange}
          className={styles.avatarInput}
          aria-label={t("profile.change-avatar")}
        />
        {avatarError && <p className={styles.error}>{avatarError}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="username" className={styles.label}>
          {t("profile.username")}
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          className={`${styles.input} ${usernameError ? styles.inputError : ""}`}
          placeholder={t("profile.username-placeholder")}
          maxLength={21}
          disabled={isLoadingCurrent}
        />
        {usernameError && <p className={styles.error}>{usernameError}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="bio" className={styles.label}>
          {t("profile.bio")}
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={handleBioChange}
          className={`${styles.textarea} ${bioError ? styles.inputError : ""}`}
          placeholder={t("profile.bio-placeholder")}
          rows={4}
          maxLength={500}
          disabled={isLoadingCurrent}
        />
        {bioError && <p className={styles.error}>{bioError}</p>}
        <small className={styles.hint}>
          {bio.length}/500 {t("profile.characters")}
        </small>
      </div>

      <div className={styles.actions}>
        <PrimaryBtn
          text={t("profile.save")}
          isLoading={isLoadingCurrent}
          disabled={!!usernameError || !!bioError || !!avatarError}
        />

        <PrimaryBtn
          text={t("profile.cancel")}
          isLoading={false}
          onClick={handleCancel}
          type="button"
          disabled={isLoadingCurrent}
        />
      </div>
    </form>
  );
};

export { EditProfile };
