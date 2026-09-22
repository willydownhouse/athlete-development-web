import { describe, expect, it } from "vitest";

import { ApiError } from "./api";
import { DEMO_ACCESS_DENIED_MESSAGE, isDemoAccessDenied } from "./demo-access";

describe("isDemoAccessDenied", () => {
  it("matches the demo allowlist 403", () => {
    expect(
      isDemoAccessDenied(new ApiError(DEMO_ACCESS_DENIED_MESSAGE, 403, DEMO_ACCESS_DENIED_MESSAGE)),
    ).toBe(true);
  });

  it("does not match other 403s", () => {
    expect(
      isDemoAccessDenied(
        new ApiError("Monthly usage limit reached", 403, "Monthly usage limit reached"),
      ),
    ).toBe(false);
    expect(
      isDemoAccessDenied(new ApiError("Parent access required", 403, "Parent access required")),
    ).toBe(false);
  });

  it("does not match other statuses or non-API errors", () => {
    expect(
      isDemoAccessDenied(new ApiError(DEMO_ACCESS_DENIED_MESSAGE, 401, DEMO_ACCESS_DENIED_MESSAGE)),
    ).toBe(false);
    expect(isDemoAccessDenied(new Error(DEMO_ACCESS_DENIED_MESSAGE))).toBe(false);
  });
});
