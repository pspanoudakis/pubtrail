import { buildRetroTimestamp } from "@/utils/retroTimestamp";

// buildRetroTimestamp reads the *local* components of the Date it is given
// (getMonth / getDate / getHours ...). Building the fixtures with the
// local-time Date constructor (new Date(year, monthIndex, ...)) keeps these
// tests independent of the machine timezone.

describe("buildRetroTimestamp", () => {
    it("formats a date the way an early-90s camcorder would (two spaces before the time)", () => {
        expect(buildRetroTimestamp(new Date(2026, 3, 26, 20, 32))).toBe("APR 26 2026  08:32 PM");
    });

    it("zero-pads the day, hour and minute", () => {
        expect(buildRetroTimestamp(new Date(2026, 5, 3, 9, 7))).toBe("JUN 03 2026  09:07 AM");
    });

    it("shows midnight as 12:xx AM", () => {
        expect(buildRetroTimestamp(new Date(2026, 0, 1, 0, 5))).toBe("JAN 01 2026  12:05 AM");
    });

    it("shows noon as 12:00 PM", () => {
        expect(buildRetroTimestamp(new Date(2026, 11, 31, 12, 0))).toBe("DEC 31 2026  12:00 PM");
    });

    it("converts a 24h evening hour to 12h with a PM suffix", () => {
        expect(buildRetroTimestamp(new Date(2026, 6, 15, 23, 45))).toBe("JUL 15 2026  11:45 PM");
    });

    it("uses all twelve month abbreviations", () => {
        const months = [
            "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
        ];
        months.forEach((abbr, monthIndex) => {
            expect(buildRetroTimestamp(new Date(2026, monthIndex, 10, 8, 0))).toContain(`${abbr} 10 2026`);
        });
    });

    it("defaults to the current time and still matches the fixed layout", () => {
        expect(buildRetroTimestamp()).toMatch(/^[A-Z]{3} \d{2} \d{4}  \d{2}:\d{2} (AM|PM)$/);
    });
});
