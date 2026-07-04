const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export type WeatherData = {
    temp: number;
    description: string;
    windSpeed: number;
    rainMm: number;
    weatherId: number;
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
        temp: Math.round(data.main.temp),
        description: data.weather?.[0]?.description ?? "",
        windSpeed: data.wind?.speed ?? 0,
        rainMm: data.rain?.["1h"] ?? data.rain?.["3h"] ?? 0,
        weatherId: data.weather?.[0]?.id ?? 800,
    };
}

export function getPubCrawlTip(weather: WeatherData): { emoji: string; message: string } {
    if (weather.rainMm > 0 || (weather.weatherId >= 200 && weather.weatherId < 600)) {
        return { emoji: "☔", message: "Splash alert! Bring an umbrella unless you want a free shower between pubs." };
    }

    if (weather.windSpeed > 8) {
        return { emoji: "💨", message: "It's windy out there! Bring a jacket or the wind might crawl faster than you." };
    }

    if (weather.temp < 5) {
        return { emoji: "🥶", message: "Brrr! Layer up — it's freezing. A warm beer won't be enough tonight." };
    }

    if (weather.temp > 25) {
        return { emoji: "☀️", message: "Dress lightly, it's warm! Perfect weather for a terrace crawl." };
    }

    return { emoji: "🍻", message: "Weather's looking fine! Nothing stopping you from a great pub crawl tonight." };
}
