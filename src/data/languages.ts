export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ua", name: "Українська" },
] as const;

export type Language = (typeof LANGUAGES)[number];
