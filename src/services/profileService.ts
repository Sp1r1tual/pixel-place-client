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
    return $api.patch<IProfileData>("/profile", data);
  }
}

export { ProfileService };
