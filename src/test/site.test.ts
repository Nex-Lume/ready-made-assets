import { describe, expect, it } from "vitest";
import { DISHES, MENU, SITE, openStatus } from "@/lib/site";

// India is UTC+05:30 year-round.
describe("open status in India time", () => {
  it("is open on a Saturday at 19:00 local", () => {
    expect(openStatus(new Date("2026-10-24T13:30:00Z")).open).toBe(true);
  });
  it("is closed before 11:30 and says it opens 11:30", () => {
    expect(openStatus(new Date("2026-10-24T03:00:00Z")).label).toBe("Closed · opens 11:30"); // Sat 08:30
  });
  it("is closed all Monday", () => {
    expect(openStatus(new Date("2026-10-26T08:00:00Z")).open).toBe(false); // Mon 13:30
  });
  it("closes at 23:00 on Saturday", () => {
    expect(openStatus(new Date("2026-10-24T17:45:00Z")).open).toBe(false); // Sat 23:15
  });
});

describe("Indian restaurant details", () => {
  it("uses Indian rupees for every dish and menu price", () => {
    expect(SITE.currency).toBe("INR");
    for (const item of [...DISHES, ...MENU.flatMap((category) => category.items)]) {
      expect(item.price).toMatch(/^₹[1-9]\d*$/);
    }
  });
  it("uses an Indian address and timezone", () => {
    expect(SITE.address).toContain("India");
    expect(SITE.timezone).toBe("Asia/Kolkata");
    expect(SITE.phoneHref).toMatch(/^tel:\+91\d{10}$/);
  });
});
