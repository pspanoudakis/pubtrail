import { sortStopsChronologically, type Visitable } from "@/utils/sortStops";

describe("sortStopsChronologically", () => {
    it("orders an earlier stop before a later one", () => {
        expect(sortStopsChronologically({ visitedOn: 100 }, { visitedOn: 200 })).toBeLessThan(0);
        expect(sortStopsChronologically({ visitedOn: 200 }, { visitedOn: 100 })).toBeGreaterThan(0);
    });

    it("treats equal timestamps as equal", () => {
        expect(sortStopsChronologically({ visitedOn: 42 }, { visitedOn: 42 })).toBe(0);
    });

    it("sorts an array ascending by visitedOn when passed to Array.prototype.sort", () => {
        const stops: Array<Visitable & { id: string }> = [
            { id: "c", visitedOn: 300 },
            { id: "a", visitedOn: 100 },
            { id: "b", visitedOn: 200 },
        ];

        stops.sort(sortStopsChronologically);

        expect(stops.map((s) => s.id)).toEqual(["a", "b", "c"]);
    });

    it("keeps the relative order of stops sharing a timestamp (comparator returns 0)", () => {
        const stops = [
            { id: "first", visitedOn: 10 },
            { id: "second", visitedOn: 10 },
            { id: "third", visitedOn: 5 },
        ];

        stops.sort(sortStopsChronologically);

        expect(stops.map((s) => s.id)).toEqual(["third", "first", "second"]);
    });
});
