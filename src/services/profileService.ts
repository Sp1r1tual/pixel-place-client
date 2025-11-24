import { $api } from "@/api";

import { IProfileData, IUpdateProfilePayload } from "@/types";

class ProfileService {
  static getProfile() {
    return $api.get<IProfileData>("/profile");
  }

  static getPublicProfile(userId: string) {
    return $api.get<IProfileData>(`/profile/${userId}`);
  }

  static changeProfileInfo(data: IUpdateProfilePayload) {
    const formData = new FormData();

    if (data.username !== undefined) formData.append("username", data.username);
    if (data.bio !== undefined) formData.append("bio", data.bio);
    if (data.avatar) formData.append("avatar", data.avatar);

    return $api.patch<IProfileData>("/profile", formData);
  }
}

export { ProfileService };
