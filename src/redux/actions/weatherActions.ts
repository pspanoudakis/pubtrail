import type { AppDispatch } from "@/redux/store/store";
import { fetchWeather, getPubCrawlTip } from "@/weatherService";

export function setWeatherFromService(latitude: number, longitude: number) {
    return async function setWeatherFromServiceThunkACB(dispatch: AppDispatch) {
        try {
            const data = await fetchWeather(latitude, longitude);
            dispatch({ type: "WEATHER_SET", payload: { data, tip: getPubCrawlTip(data) } });
        } catch {
            dispatch({ type: "WEATHER_CLEAR" });
        }
    };
}

