import { describe, expect, it } from "vitest";

import {
  chatEmptyIntro,
  chatEventLoggingExample,
  chatEventUpdateExample,
  chatExampleAthleteName,
} from "./chat-intro";

describe("chatExampleAthleteName", () => {
  it("uses the first word of a full name", () => {
    expect(chatExampleAthleteName("Leo Laine")).toBe("Leo");
  });

  it("keeps a single given name", () => {
    expect(chatExampleAthleteName("Lisa")).toBe("Lisa");
  });

  it("falls back when the name is blank", () => {
    expect(chatExampleAthleteName("   ")).toBe("your athlete");
  });
});

describe("chatEventLoggingExample", () => {
  it("builds the ice practice example with the given name", () => {
    expect(chatEventLoggingExample("Leo Laine")).toBe("Leo had ice practice today at 2pm");
  });
});

describe("chatEventUpdateExample", () => {
  it("suggests changing time or RPE on this event", () => {
    expect(chatEventUpdateExample()).toBe("Move this to 6pm, add RPE 7…");
  });
});

describe("chatEmptyIntro", () => {
  it("puts the athlete example in the typed instructions", () => {
    expect(chatEmptyIntro("Leo Laine")).toContain("*Leo had ice practice today at 2pm*");
  });

  it("adds a smile after the Toby intro", () => {
    expect(chatEmptyIntro("Leo Laine")).toContain("I'm Toby, your event logging agent. 🙂");
  });
});
