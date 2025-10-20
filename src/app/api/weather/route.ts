// app/api/weather/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const country = searchParams.get('country');

  if (!city || !country) {
    return NextResponse.json(
      { error: 'City and country parameters are required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch current weather
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 600 } } // Cache for 10 minutes
    );

    if (!currentWeatherResponse.ok) {
      throw new Error('Failed to fetch current weather data');
    }

    const currentData = await currentWeatherResponse.json();

    // Fetch forecast for high/low temps (using One Call API)
    const lat = currentData.coord.lat;
    const lon = currentData.coord.lon;

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 600 } } // Cache for 10 minutes
    );

    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    const forecastData = await forecastResponse.json();

    // Calculate today's high and low from forecast
    const today = new Date().toISOString().split('T')[0];
    const todayForecasts = forecastData.list.filter((item: any) => {
      return item.dt_txt.startsWith(today);
    });

    let high = currentData.main.temp_max;
    let low = currentData.main.temp_min;

    if (todayForecasts.length > 0) {
      const temps = todayForecasts.map((item: any) => item.main.temp);
      high = Math.round(Math.max(...temps));
      low = Math.round(Math.min(...temps));
    } else {
      high = Math.round(high);
      low = Math.round(low);
    }

    // Return simplified data
    return NextResponse.json({
      temperature: Math.round(currentData.main.temp),
      feelsLike: Math.round(currentData.main.feels_like),
      weatherId: currentData.weather[0].id,
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      city: currentData.name,
      country: currentData.sys.country,
      timezone: currentData.timezone, // Offset in seconds
      high: high,
      low: low,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}