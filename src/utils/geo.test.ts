import {
    coordinatesToArray,
    getBoundingBox,
    getDistanceMeters,
    DEFAULT_LOCATION,
    type GeoCoordinates,
} from "@/utils/geo";

const STOCKHOLM: GeoCoordinates = { latitude: 59.3293, longitude: 18.0686 };
const GOTHENBURG: GeoCoordinates = { latitude: 57.7089, longitude: 11.9746 };

describe("coordinatesToArray", () => {
    it("returns coordinates in GeoJSON [longitude, latitude] order", () => {
        expect(coordinatesToArray(STOCKHOLM)).toEqual([18.0686, 59.3293]);
    });
});

describe("getDistanceMeters", () => {
    it("is zero between a point and itself", () => {
        expect(getDistanceMeters(STOCKHOLM, STOCKHOLM)).toBe(0);
    });

    it("is symmetric", () => {
        const there = getDistanceMeters(STOCKHOLM, GOTHENBURG);
        const back = getDistanceMeters(GOTHENBURG, STOCKHOLM);
        expect(there).toBeCloseTo(back, 5);
    });

    it("matches the known length of one degree of latitude (~111.2 km)", () => {
        const oneDegreeNorth = getDistanceMeters(
            { latitude: 0, longitude: 0 },
            { latitude: 1, longitude: 0 },
        );
        // Great-circle distance for 1° on a sphere of radius 6_371_000 m.
        expect(oneDegreeNorth).toBeCloseTo(111_194.9, -2); // within ~50 m
    });

    it("gives a sane Stockholm - Gothenburg great-circle distance (~400 km)", () => {
        const km = getDistanceMeters(STOCKHOLM, GOTHENBURG) / 1000;
        expect(km).toBeGreaterThan(390);
        expect(km).toBeLessThan(410);
    });
});

describe("getBoundingBox", () => {
    it("brackets the center point", () => {
        const box = getBoundingBox(STOCKHOLM, 1000);
        expect(box.minLat).toBeLessThan(STOCKHOLM.latitude);
        expect(box.maxLat).toBeGreaterThan(STOCKHOLM.latitude);
        expect(box.minLng).toBeLessThan(STOCKHOLM.longitude);
        expect(box.maxLng).toBeGreaterThan(STOCKHOLM.longitude);
    });

    it("grows with the requested radius", () => {
        const small = getBoundingBox(STOCKHOLM, 500);
        const large = getBoundingBox(STOCKHOLM, 5000);
        expect(large.maxLat - large.minLat).toBeGreaterThan(small.maxLat - small.minLat);
        expect(large.maxLng - large.minLng).toBeGreaterThan(small.maxLng - small.minLng);
    });

    it("keeps the box edge within the reported distance of the center", () => {
        const radius = 2000;
        const box = getBoundingBox(STOCKHOLM, radius);
        const northEdge = getDistanceMeters(STOCKHOLM, {
            latitude: box.maxLat,
            longitude: STOCKHOLM.longitude,
        });
        expect(northEdge).toBeCloseTo(radius, -2);
    });
});

describe("DEFAULT_LOCATION", () => {
    it("points at central Stockholm", () => {
        expect(getDistanceMeters(DEFAULT_LOCATION, STOCKHOLM)).toBeLessThan(1000);
    });
});
