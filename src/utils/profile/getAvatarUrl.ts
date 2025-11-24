import defaultAvatarSvg from "@/assets/avatar-svgrepo-com.svg";

const getAvatarUrl = (avatarSrc: string | undefined) => {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

  if (!avatarSrc || typeof avatarSrc !== "string" || !avatarSrc.trim()) {
    return defaultAvatarSvg;
  }

  const trimmedUrl = avatarSrc.trim();
  const isAbsoluteUrl =
    trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://");

  if (isAbsoluteUrl) return trimmedUrl;

  const normalizedPath = trimmedUrl.startsWith("/")
    ? trimmedUrl
    : `/${trimmedUrl}`;

  return `${baseUrl}${normalizedPath}`;
};

export { getAvatarUrl };
