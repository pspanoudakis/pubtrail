import type { WeatherData } from "@/weatherService";

const initialState = {
    data: null as WeatherData | null,
    tip: null as { emoji: string; message: string } | null,
};

export type WeatherState = typeof initialState;

type WeatherAction =
    | { type: "WEATHER_SET"; payload: { data: WeatherData; tip: { emoji: string; message: string } } }
    | { type: "WEATHER_CLEAR" };

const weatherReducer = (state = initialState, action: WeatherAction): WeatherState => {
    switch (action.type) {
        case "WEATHER_SET":
            return { ...state, data: action.payload.data, tip: action.payload.tip };
        case "WEATHER_CLEAR":
            return { ...state, data: null, tip: null };
        default:
            return state;
    }
};

export default weatherReducer;
