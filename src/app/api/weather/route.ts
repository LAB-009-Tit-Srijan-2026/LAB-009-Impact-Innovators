import { NextRequest, NextResponse } from 'next/server';

const OWM_KEY = process.env.OPENWEATHER_API_KEY;
const BASE    = 'https://api.openweathermap.org/data/2.5';

// Map OWM icon codes → emoji
function owmIconToEmoji(icon: string): string {
  const map: Record<string, string> = {
    '01d': '☀️',  '01n': '🌙',
    '02d': '⛅',  '02n': '☁️',
    '03d': '☁️',  '03n': '☁️',
    '04d': '☁️',  '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️',  '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return map[icon] ?? '🌡️';
}

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  condition: string;
  description: string;
  humidity: number;
  wind: number;
  visibility: number;
  icon: string;
  emoji: string;
  sunrise: string;
  sunset: string;
  updatedAt: string;
}

/** GET /api/weather?city=Delhi
 *  Returns live weather for any city using OpenWeatherMap.
 */
export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') ?? 'Delhi';

  if (!OWM_KEY || OWM_KEY === 'your_openweather_key_here') {
    // Return mock data if key not set
    return NextResponse.json({
      success: true,
      mock: true,
      data: getMockWeather(city),
    });
  }

  try {
    const res = await fetch(
      `${BASE}/weather?q=${encodeURIComponent(city)},IN&appid=${OWM_KEY}&units=metric&lang=en`,
      { next: { revalidate: 600 } } // cache 10 min
    );

    if (!res.ok) {
      const err = await res.json();
      // Fallback to mock on API error
      return NextResponse.json({
        success: true,
        mock: true,
        data: getMockWeather(city),
        warning: err.message,
      });
    }

    const d = await res.json();
    const sunrise = new Date(d.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const sunset  = new Date(d.sys.sunset  * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const data: WeatherData = {
      city:        d.name,
      country:     d.sys.country,
      temp:        Math.round(d.main.temp),
      feels_like:  Math.round(d.main.feels_like),
      condition:   d.weather[0].main,
      description: d.weather[0].description,
      humidity:    d.main.humidity,
      wind:        Math.round(d.wind.speed * 3.6), // m/s → km/h
      visibility:  Math.round((d.visibility ?? 10000) / 1000),
      icon:        `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`,
      emoji:       owmIconToEmoji(d.weather[0].icon),
      sunrise,
      sunset,
      updatedAt:   new Date().toISOString(),
    };

    return NextResponse.json({ success: true, mock: false, data });
  } catch (e: any) {
    return NextResponse.json({
      success: true,
      mock: true,
      data: getMockWeather(city),
      warning: e.message,
    });
  }
}

// Realistic mock data per city (used when API key not set)
function getMockWeather(city: string): WeatherData {
  const mocks: Record<string, Partial<WeatherData>> = {
    'Delhi':     { temp: 38, condition: 'Clear',   emoji: '☀️', humidity: 32, wind: 14, description: 'clear sky' },
    'Mumbai':    { temp: 31, condition: 'Clouds',  emoji: '⛅', humidity: 78, wind: 22, description: 'scattered clouds' },
    'Bangalore': { temp: 24, condition: 'Clouds',  emoji: '⛅', humidity: 65, wind: 12, description: 'partly cloudy' },
    'Jaipur':    { temp: 40, condition: 'Clear',   emoji: '☀️', humidity: 28, wind: 18, description: 'sunny and hot' },
    'Manali':    { temp: 8,  condition: 'Snow',    emoji: '❄️', humidity: 82, wind: 20, description: 'light snow' },
    'Goa':       { temp: 29, condition: 'Rain',    emoji: '🌧️', humidity: 88, wind: 25, description: 'moderate rain' },
    'Kerala':    { temp: 27, condition: 'Rain',    emoji: '🌦️', humidity: 90, wind: 18, description: 'light rain' },
    'Ladakh':    { temp: 5,  condition: 'Clear',   emoji: '☀️', humidity: 30, wind: 28, description: 'clear and cold' },
    'Nainital':  { temp: 14, condition: 'Clouds',  emoji: '⛅', humidity: 72, wind: 12, description: 'overcast clouds' },
    'Chennai':   { temp: 33, condition: 'Clouds',  emoji: '⛅', humidity: 75, wind: 16, description: 'humid and cloudy' },
  };
  const m = mocks[city] ?? { temp: 30, condition: 'Clear', emoji: '☀️', humidity: 55, wind: 15, description: 'clear sky' };
  return {
    city,
    country: 'IN',
    temp:        m.temp ?? 30,
    feels_like:  (m.temp ?? 30) + 2,
    condition:   m.condition ?? 'Clear',
    description: m.description ?? 'clear sky',
    humidity:    m.humidity ?? 55,
    wind:        m.wind ?? 15,
    visibility:  10,
    icon:        '',
    emoji:       m.emoji ?? '☀️',
    sunrise:     '06:15 AM',
    sunset:      '07:30 PM',
    updatedAt:   new Date().toISOString(),
  };
}
