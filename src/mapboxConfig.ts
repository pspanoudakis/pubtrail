import Mapbox from "@rnmapbox/maps";
import { GeoCoordinates } from "@/utils/geo";

export type NearbyPlace = {
    id: string;
    name: string;
    distance?: number;
    coordinates?: GeoCoordinates;
};

type MapboxSearchBoxFeature = {
    mapbox_id?: string;
    name?: string;
    distance?: number;
    place_name?: string;
    full_address?: string;
    place_formatted?: string;
    properties?: {
        mapbox_id?: string;
        name?: string;
        distance?: number;
        place_name?: string;
        full_address?: string;
        place_formatted?: string;
        coordinates?: GeoCoordinates
    };
};

type MapboxSearchBoxResponse = {
    suggestions?: MapboxSearchBoxFeature[];
    features?: MapboxSearchBoxFeature[];
    results?: MapboxSearchBoxFeature[];
};

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const MAPBOX_SEARCH_BOX_BASE_URL =
    "https://api.mapbox.com/search/searchbox/v1/category/food_and_drink";
const DEFAULT_NEARBY_PLACE_LIMIT = 5;

if (!MAPBOX_TOKEN) {
    throw new Error("Missing Mapbox token. Set EXPO_PUBLIC_MAPBOX_TOKEN in .env");
}

try {
    Mapbox.setAccessToken(MAPBOX_TOKEN);
} catch (error) {
    console.error(
        "Error setting Mapbox access token:",
        error instanceof Error ? error.message : error
    );
}

function toNearbyPlace(suggestion: MapboxSearchBoxFeature, index: number): NearbyPlace {
    const properties = suggestion.properties ?? {};
    const name =
        properties.name ??
        suggestion.name ??
        properties.place_formatted ??
        suggestion.place_formatted ??
        properties.place_name ??
        suggestion.place_name ??
        properties.full_address ??
        suggestion.full_address ??
        "Nearby place";

    return {
        id: properties.mapbox_id ?? suggestion.mapbox_id ?? `${name}-${index}`,
        name,
        distance:
            typeof properties.distance === "number"
                ? properties.distance
                : typeof suggestion.distance === "number"
                    ? suggestion.distance
                    : undefined,
        coordinates: (
            (typeof properties.coordinates?.latitude === "number") &&
            (typeof properties.coordinates?.longitude === "number")
        ) ? {
            latitude: properties.coordinates.latitude,
            longitude: properties.coordinates.longitude,
        } : undefined
        
    };
}

export async function fetchNearbyFoodAndDrinkPlaces(
    location: GeoCoordinates,
    limit = DEFAULT_NEARBY_PLACE_LIMIT
): Promise<NearbyPlace[]> {
    const url = new URL(MAPBOX_SEARCH_BOX_BASE_URL);
    url.searchParams.set("proximity", `${location.longitude},${location.latitude}`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("language", "en");
    url.searchParams.set("access_token", MAPBOX_TOKEN);

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Mapbox nearby places request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as MapboxSearchBoxResponse;
    const suggestions = data.features ?? data.suggestions ?? data.results ?? [];

    return suggestions.slice(0, limit).map(toNearbyPlace);
}

export default Mapbox;