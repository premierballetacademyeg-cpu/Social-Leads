import { describe, expect, it } from "vitest";
import { BOT_COPY, escalationMessage, identifyBranch, INITIAL_FAQ_SEEDS, WHATSAPP } from "./constants";

describe("opening and escalation policies", () => {
  it("discloses the automated assistant before asking for a language choice", () => { const message = BOT_COPY.opening.en.toLowerCase(); expect(message).toContain("automated assistant"); expect(message.indexOf("automated assistant")).toBeLessThan(message.indexOf("choose your language")); });
  it("includes the exact branch link, 24-hour expectation, and Friday note on every fallback", () => { const message = escalationMessage("en", "Maadi fees"); expect(message).toContain(WHATSAPP.maadi.link); expect(message).toContain("within 24 hours"); expect(message).toContain("Friday is off"); });
});

describe("branches", () => {
  it("routes Sheikh Zayed questions to the Sheikh Zayed WhatsApp in both languages", () => {
    expect(identifyBranch("What are the fees at Sheikh Zayed?")).toBe("sheikhZayed");
    expect(identifyBranch("ما هي الرسوم في الشيخ زايد؟")).toBe("sheikhZayed");
    expect(escalationMessage("en", "Sheikh Zayed schedule")).toContain(WHATSAPP.sheikhZayed.link);
    expect(escalationMessage("ar", "الشيخ زايد")).toContain(WHATSAPP.sheikhZayed.link);
  });
  it("lists all three branches when no branch is named", () => {
    const message = escalationMessage("en", "hello");
    for (const branch of Object.values(WHATSAPP)) expect(message).toContain(branch.link);
  });
});

describe("official FAQ set", () => {
  const live = INITIAL_FAQ_SEEDS.filter(seed => (seed.status ?? "approved") === "approved");
  it("has 8 live website FAQs, each complete in English and Arabic", () => {
    expect(live).toHaveLength(8);
    for (const seed of live) {
      expect(seed.source).toBe("website");
      for (const field of [seed.questionEn, seed.questionAr, seed.answerEn, seed.answerAr]) expect(field.trim().length).toBeGreaterThan(10);
      expect(seed.keywordsEn.length).toBeGreaterThan(0);
      expect(seed.keywordsAr.length).toBeGreaterThan(0);
      expect(/[\u0600-\u06FF]/.test(seed.answerAr)).toBe(true);
    }
  });
  it("keeps the Summer Intensive entries archived so the bot never answers them", () => {
    const psi = INITIAL_FAQ_SEEDS.filter(seed => seed.source === "psi");
    expect(psi).toHaveLength(2);
    expect(psi.every(seed => seed.status === "archived")).toBe(true);
  });
  it("uses unique slugs", () => {
    expect(new Set(INITIAL_FAQ_SEEDS.map(seed => seed.slug)).size).toBe(INITIAL_FAQ_SEEDS.length);
  });
});
