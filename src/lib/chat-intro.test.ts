import { describe, expect, it } from "vitest";

import {
  chatEmptyIntro,
  chatEventLoggingExample,
  chatEventUpdateExample,
  chatExampleAthleteName,
  chatOnboardingIntro,
  chatOnboardingUpdateIntro,
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
    expect(chatExampleAthleteName("   ", "fi")).toBe("urheilijasi");
  });
});

describe("chatEventLoggingExample", () => {
  it("builds the ice practice example with the given name", () => {
    expect(chatEventLoggingExample("Leo Laine")).toBe("Leo had ice practice today at 2pm");
    expect(chatEventLoggingExample("Leo Laine", "fi")).toBe("Leo: jääharjoitus tänään klo 14");
  });
});

describe("chatEventUpdateExample", () => {
  it("suggests changing time or RPE on this event", () => {
    expect(chatEventUpdateExample()).toBe("Move this to 6pm, add RPE 7…");
  });
});

describe("chatOnboardingIntro", () => {
  it("names the athlete and explains the interview and confirmation", () => {
    expect(chatOnboardingIntro("Lisa")).toContain(
      "From this interview I can also create three kinds of goals: near-term, this season, and long-term. You can see them on the timeline and on the athlete's profile page. Goals matter, because I'll always compare your training to them in the future when I write weekly, monthly, and season reports.",
    );
    expect(chatOnboardingIntro("Lisa")).toContain(
      "You can also tell me things I might not think to ask, if you feel they could be useful later when I help you.",
    );
    expect(chatOnboardingIntro("Lisa")).toContain("Let's get to know Lisa.");
    expect(chatOnboardingIntro("Lisa")).toContain("what a normal week looks like");
    expect(chatOnboardingIntro("Lisa")).toContain("other hobbies");
    expect(chatOnboardingIntro("Lisa")).toContain(
      "From this interview I'll write a summary, and that becomes the starting point for the athlete's profile and development history. You can always see the summary on the athlete's profile page.",
    );
    expect(chatOnboardingIntro("Lisa")).toContain(
      "only save it after you confirm that it sounds right, or tell me what you want to change or add",
    );
    expect(chatOnboardingIntro("Lisa")).toContain(
      "Don't worry, it doesn't all have to be right the first time. You can always come back to this interview and change the details.",
    );
    expect(chatOnboardingIntro("Lisa", "fi")).toContain(
      "Tästä haastattelusta voin myös luoda lyhyen aikavälin, tämän kauden ja pitkän aikavälin tavoitteita. Näet ne aikajanalla ja urheilijan profiilisivulla. Tavoitteet ovat tärkeitä, koska tulen aina vertaamaan harjoitteluasi niihin tulevaisuudessa, kun laadin viikko-, kuukausi- ja kausiraportteja.",
    );
    expect(chatOnboardingIntro("Lisa", "fi")).toContain(
      "Voit myös kertoa asioita, joita en välttämättä hoksaa kysyä, jos koet että niistä voi tulevaisuudessa olla hyötyä kun autan sinua.",
    );
    expect(chatOnboardingIntro("Lisa", "fi")).toContain("Tutustutaan urheilijaan Lisa.");
    expect(chatOnboardingIntro("Lisa", "fi")).toContain("tavallisesta viikosta");
    expect(chatOnboardingIntro("Lisa", "fi")).toContain("muista harrastuksista");
    expect(chatOnboardingIntro("Lisa", "fi")).toContain(
      "Haastattelun pohjalta luon yhteenvedon, ja se on lähtökohta urheilijan profiilille ja kehityshistorialle. Yhteenvedon näet aina urheilijan profiilisivulla.",
    );
    expect(chatOnboardingIntro("Lisa", "fi")).toContain(
      "kun vahvistat niiden olevan oikein tai kerrot, mitä haluat muuttaa tai lisätä",
    );
    expect(chatOnboardingIntro("Lisa", "fi")).toContain(
      "Älä huoli, kaikkea ei tarvitse saada kerralla oikein. Voit aina palata tähän haastatteluun muokkaamaan tietoja.",
    );
  });

  it("stays generic when the name is blank", () => {
    expect(chatOnboardingIntro("  ")).toContain("this athlete");
    expect(chatOnboardingIntro("  ", "fi")).toContain("tähän urheilijaan");
  });
});

describe("chatOnboardingUpdateIntro", () => {
  it("says the picture is already saved and asks what to update", () => {
    expect(chatOnboardingUpdateIntro("Lisa")).toContain(
      "An onboarding interview has already been done for Lisa, but you can still change or add to its information in this conversation.",
    );
    expect(chatOnboardingUpdateIntro("Lisa")).toContain(
      "I'll only save the update after you confirm that it sounds right",
    );
    expect(chatOnboardingUpdateIntro("Lisa")).toContain("What would you like to update?");
    expect(chatOnboardingUpdateIntro("Lisa", "fi")).toContain(
      "Urheilijalle Lisa on jo tehty onboarding-haastattelu, mutta voit edelleen muuttaa tai täydentää sen tietoja tässä keskustelussa.",
    );
    expect(chatOnboardingUpdateIntro("Lisa", "fi")).toContain(
      "Tallennan päivityksen vasta, kun vahvistat sen olevan oikein",
    );
    expect(chatOnboardingUpdateIntro("Lisa", "fi")).toContain("Mitä haluat päivittää?");
  });

  it("stays generic when the name is blank", () => {
    expect(chatOnboardingUpdateIntro("  ")).toContain(
      "An onboarding interview has already been done for this athlete",
    );
    expect(chatOnboardingUpdateIntro("  ", "fi")).toContain(
      "Tälle urheilijalle on jo tehty onboarding-haastattelu",
    );
  });
});

describe("chatEmptyIntro", () => {
  it("introduces Toby as an assistant and invites a question", () => {
    expect(chatEmptyIntro()).toContain("I'm Toby, your AI training assistant. 🙂");
    expect(chatEmptyIntro()).toContain(
      "I can plan and log your training, for example. I can also guide you through how to use this app. Just ask me — I'm here to help!",
    );
    expect(chatEmptyIntro("fi")).toContain("olen Toby, harjoittelun tekoälyavustajasi. 🙂");
    expect(chatEmptyIntro("fi")).toContain(
      "Voin esimerkiksi suunnitella ja kirjata harjoitteluasi. Voin myös opastaa sinua tämän sovelluksen käytössä. Kysy vain, olen täällä auttamassa!",
    );
  });
});
