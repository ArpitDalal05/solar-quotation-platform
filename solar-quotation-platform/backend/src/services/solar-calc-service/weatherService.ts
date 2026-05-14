/**
 * Weather Service – fetches weather data from OpenWeatherMap API.
 * Returns temperature, cloud cover, sunrise/sunset, and coordinates.
 */

const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = process.env.OPENWEATHER_API_KEY || "f1323b08c245003f44581986b788db28";

export interface WeatherData {
  temperature: number;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  coordinates: { lat: number; lon: number };
  city: string;
  country: string;
}

export interface WeatherFetchOptions {
  city?: string;
  lat?: number;
  lon?: number;
}

/**
 * Fetches weather data by city name or coordinates.
 * @param options - { city: "Pune" } or { lat: 18.52, lon: 73.86 }
 */
export async function fetchWeatherData(
  options: WeatherFetchOptions
): Promise<WeatherData> {
  let url: string;

  if (options.city) {
    url = `${OPENWEATHER_BASE}?q=${encodeURIComponent(options.city)}&appid=${API_KEY}&units=metric`;
  } else if (options.lat != null && options.lon != null) {
    url = `${OPENWEATHER_BASE}?lat=${options.lat}&lon=${options.lon}&appid=${API_KEY}&units=metric`;
  } else {
    throw new Error("Provide either city or lat/lon coordinates");
  }

  const res = await fetch(url);

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as
      | { message?: string; cod?: string | number }
      | null;
    const msg =
      err?.cod === "404"
        ? "City or location not found"
        : err?.message
          ? err.message
          : `OpenWeatherMap API error: ${res.status}`;
    throw new Error(msg);
  }

  const data = (await res.json()) as {
    main?: { temp?: number };
    clouds?: { all?: number };
    sys?: { sunrise?: number; sunset?: number; country?: string };
    coord?: { lat?: number; lon?: number };
    name?: string;
  };

  const temp = data.main?.temp ?? 0;
  const cloudCover = data.clouds?.all ?? 0;
  const sunrise = data.sys?.sunrise
    ? new Date(data.sys.sunrise * 1000).toISOString()
    : "";
  const sunset = data.sys?.sunset
    ? new Date(data.sys.sunset * 1000).toISOString()
    : "";
  const lat = data.coord?.lat ?? 0;
  const lon = data.coord?.lon ?? 0;

  return {
    temperature: Math.round(temp * 10) / 10,
    cloudCover,
    sunrise,
    sunset,
    coordinates: { lat, lon },
    city: data.name ?? "",
    country: data.sys?.country ?? "",
  };
}
