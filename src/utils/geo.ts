export type GeoCoordinates = {
    latitude: number;
    longitude: number;
};

export function coordinatesToArray(c: GeoCoordinates): [number, number] {
    return [c.longitude, c.latitude];
}

// Default generic center (Stockholm)
export const DEFAULT_LOCATION: GeoCoordinates = {
    longitude: 18.0686,
    latitude: 59.3293
};

const EARTH_RADIUS_METERS = 6371000;

function toRadians(value: number): number {
    return (value * Math.PI) / 180;
}

export function getBoundingBox(center: GeoCoordinates, radiusMeters: number) {
    const latitudeRadius = (radiusMeters / EARTH_RADIUS_METERS) * (180 / Math.PI);
    const longitudeRadius =
        (radiusMeters / (EARTH_RADIUS_METERS * Math.max(Math.cos(toRadians(center.latitude)), 0.000001))) *
        (180 / Math.PI);

    return {
        minLat: center.latitude - latitudeRadius,
        maxLat: center.latitude + latitudeRadius,
        minLng: center.longitude - longitudeRadius,
        maxLng: center.longitude + longitudeRadius,
    };
}

export function getDistanceMeters(from: GeoCoordinates, to: GeoCoordinates): number {
    const deltaLat = toRadians(to.latitude - from.latitude);
    const deltaLng = toRadians(to.longitude - from.longitude);
    const startLat = toRadians(from.latitude);
    const endLat = toRadians(to.latitude);

    const haversine =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
}
