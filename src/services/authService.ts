import { $api } from "@/api";

import { IAuthPayloadWithoutId } from "@/types";

class AuthService {
  static login({ email, password }: IAuthPayloadWithoutId) {
    return $api.post("/login", { email, password });
  }

  static logout() {
    return $api.post("/logout");
  }

  static registration({ email, password }: IAuthPayloadWithoutId) {
    return $api.post("/registration", { email, password });
  }

  static requestPasswordReset(email: string) {
    return $api.post("/forgot-password", { email });
  }

  static resetPassword(token: string, newPassword: string) {
    return $api.post(`/reset-password/${token}`, { password: newPassword });
  }
}

export { AuthService };
