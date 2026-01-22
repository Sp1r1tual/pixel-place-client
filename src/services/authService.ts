import { $apiMain } from "@/api";

import { IAuthPayloadWithoutId } from "@/types";

class AuthService {
  static async login(payload: IAuthPayloadWithoutId) {
    return $apiMain.post("/login", payload);
  }

  static async registration(payload: IAuthPayloadWithoutId) {
    return $apiMain.post("/registration", payload);
  }

  static async logout() {
    return $apiMain.post("/logout");
  }

  static async refresh() {
    return $apiMain.get("/refresh");
  }

  static async requestPasswordReset(email: string) {
    return $apiMain.post("/forgot-password", { email });
  }

  static async resetPassword(token: string, password: string) {
    return $apiMain.post(`/reset-password/${token}`, { password });
  }
}

export { AuthService };
