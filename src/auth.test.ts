import { describe, expect, it } from "vitest";

import {
  AUTH_PROVIDER_ACCOUNT_ID_CLAIM,
  AUTH_PROVIDER_CLAIM,
  IMAGE_URL_CLAIM,
} from "@/lib/auth-claims";

describe("auth claim constants", () => {
  it("uses stable provider identity claim names", () => {
    expect(AUTH_PROVIDER_CLAIM).toBe("authProvider");
    expect(AUTH_PROVIDER_ACCOUNT_ID_CLAIM).toBe("authProviderAccountId");
    expect(IMAGE_URL_CLAIM).toBe("imageUrl");
  });
});
