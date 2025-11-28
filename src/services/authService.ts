import { $apiAuth } from "@/api";

import { IAuthPayloadWithoutId } from "@/types";

class AuthService {
  static async login(payload: IAuthPayloadWithoutId) {
    return $apiAuth.post("/login", payload);
  }

  static async registration(payload: IAuthPayloadWithoutId) {
    return $apiAuth.post("/registration", payload);
  }

  static async logout() {
    return $apiAuth.post("/logout");
  }

  static async refresh() {
    return $apiAuth.get("/refresh");
  }

  static async requestPasswordReset(email: string) {
    return $apiAuth.post("/forgot-password", { email });
  }

  static async resetPassword(token: string, password: string) {
    return $apiAuth.post(`/reset-password/${token}`, { password });
  }
}

export { AuthService };
