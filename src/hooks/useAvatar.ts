import { useState } from "react";
import { getAvatarUrl } from "@/utils/profile/getAvatarUrl";

const useAvatar = (avatar: string, defaultAvatarSvg: string, key?: string) => {
  const avatarKey = `${avatar}-${key}`;

  const [errorKey, setErrorKey] = useState<string>("");

  const hasError = errorKey === avatarKey;

  const avatarSrc = hasError
    ? defaultAvatarSvg
    : avatar
      ? getAvatarUrl(avatar)
      : defaultAvatarSvg;

  const handleError = () => setErrorKey(avatarKey);

  return { avatarSrc, handleError };
};

export { useAvatar };
