import { $apiMain } from "@/api";

class SystemService {
  static wakeUp() {
    return $apiMain.get("/system/ping", {
      headers: {
        "X-Request-Reason": "wake-up",
      },
    });
  }
}

export { SystemService };
