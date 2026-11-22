import { describe, expect, it } from "vitest";

import { onboardingChatQuery } from "./onboarding-chat";

const athleteId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("onboarding chat query", () => {
  it("opens the general transcript when the parameter is missing", () => {
    expect(onboardingChatQuery(undefined)).toEqual({ kind: "general" });
    expect(onboardingChatQuery("")).toEqual({ kind: "general" });
    expect(onboardingChatQuery(["", athleteId])).toEqual({ kind: "general" });
  });

  it("opens that athlete's interview", () => {
    expect(onboardingChatQuery(athleteId)).toEqual({ kind: "interview", athleteId });
    expect(onboardingChatQuery([`  ${athleteId}  `])).toEqual({ kind: "interview", athleteId });
  });

  it("rejects a value that is not an athlete id", () => {
    expect(onboardingChatQuery("ath-1")).toEqual({ kind: "invalid" });
  });
});
