import { $api } from "@/api";

import { IAuthPayload } from "@/types";

class AuthService {
  static login({ email, password }: IAuthPayload) {
    return $api.post("/login", { email, password });
  }

  static logout() {
    return $api.post("/logout");
  }

  static registration({ email, password }: IAuthPayload) {
    return $api.post("/registration", { email, password });
  }
}

export { AuthService };
