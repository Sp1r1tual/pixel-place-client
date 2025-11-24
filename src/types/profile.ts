export interface IProfileData {
  avatarSrc?: string;
  username?: string;
  userId: string;
  level: number;
  bio?: string;
  repaints: number;
  joined: string;
}

export interface IUpdateProfilePayload {
  username?: string;
  bio?: string;
  avatarSrc?: string;
}
