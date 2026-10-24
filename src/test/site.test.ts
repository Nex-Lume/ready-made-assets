import { describe, expect, it } from "vitest";
import { openStatus } from "@/lib/site";

// Adelaide is UTC+10:30 in late October (daylight time).
describe("open status in Adelaide time", () => {
  it("is open on a Saturday at 19:00 local", () => {
    expect(openStatus(new Date("2026-10-24T08:30:00Z")).open).toBe(true);
  });
  it("is closed before 11:30 and says it opens 11:30", () => {
    expect(openStatus(new Date("2026-10-23T22:00:00Z")).label).toBe("Closed · opens 11:30"); // Sat 08:30
  });
  it("is closed all Monday", () => {
    expect(openStatus(new Date("2026-10-26T03:00:00Z")).open).toBe(false); // Mon 13:30
  });
  it("closes at 23:00 on Saturday", () => {
    expect(openStatus(new Date("2026-10-24T12:45:00Z")).open).toBe(false); // Sat 23:15
  });
});
