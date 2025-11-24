import { useState } from "react";

import { getAvatarUrl } from "@/utils/profile/getAvatarUrl";

const useAvatar = (
  avatar: string,
  defaultAvatar: string,
  resetKey?: string,
) => {
  const [errorState, setErrorState] = useState<{
    key: string;
    hasError: boolean;
  }>({
    key: resetKey || "",
    hasError: false,
  });

  const hasError = errorState.key === resetKey ? errorState.hasError : false;

  const avatarSrc = hasError
    ? defaultAvatar
    : avatar
      ? getAvatarUrl(avatar)
      : defaultAvatar;

  const handleError = () => {
    setErrorState({ key: resetKey || "", hasError: true });
  };

  return { avatarSrc, handleError };
};

export { useAvatar };
