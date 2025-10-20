export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ua", name: "Українська" },
  { code: "jp", name: "日本語" },
] as const;

export type Language = (typeof LANGUAGES)[number];
