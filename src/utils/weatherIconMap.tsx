// utils/weatherIconMap.ts
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloudy,
  WiDayShowers,
  WiNightAltShowers,
  WiDayRain,
  WiNightAltRain,
  WiDayRainWind,
  WiNightAltRainWind,
  WiDaySprinkle,
  WiNightAltSprinkle,
  WiDayThunderstorm,
  WiNightAltThunderstorm,
  WiThunderstorm,
  WiDayLightning,
  WiNightAltLightning,
  WiDaySnow,
  WiNightAltSnow,
  WiSnow,
  WiSnowWind,
  WiSleet,
  WiFog,
  WiSmoke,
  WiDust,
  WiDayHaze,
  WiWindy,
  WiStrongWind,
  WiDayWindy,
  WiNightAltWindy,
} from 'weather-icons-react';

export interface WeatherIconProps {
  size: number;
  color: string;
}

/**
 * Maps OpenWeatherMap condition IDs to weather icon components
 * Full list: https://openweathermap.org/weather-conditions
 */
export function getWeatherIcon(
  weatherId: number,
  isDay: boolean,
  props: WeatherIconProps
) {
  const iconProps = { size: props.size, color: props.color };

  // Thunderstorm group (200-232)
  if (weatherId >= 200 && weatherId < 300) {
    if (weatherId === 210 || weatherId === 211 || weatherId === 212 || weatherId === 221) {
      // Lightning/Heavy thunderstorm
      return isDay ? <WiDayLightning {...iconProps} /> : <WiNightAltLightning {...iconProps} />;
    }
    // Regular thunderstorm
    return isDay ? <WiDayThunderstorm {...iconProps} /> : <WiNightAltThunderstorm {...iconProps} />;
  }

  // Drizzle group (300-321)
  if (weatherId >= 300 && weatherId < 400) {
    return isDay ? <WiDaySprinkle {...iconProps} /> : <WiNightAltSprinkle {...iconProps} />;
  }

  // Rain group (500-531)
  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId === 500 || weatherId === 520) {
      // Light rain / Light shower
      return isDay ? <WiDayShowers {...iconProps} /> : <WiNightAltShowers {...iconProps} />;
    } else if (weatherId === 502 || weatherId === 503 || weatherId === 504 || weatherId === 522) {
      // Heavy rain
      return isDay ? <WiDayRainWind {...iconProps} /> : <WiNightAltRainWind {...iconProps} />;
    } else if (weatherId === 511) {
      // Freezing rain
      return <WiSleet {...iconProps} />;
    }
    // Moderate rain (default)
    return isDay ? <WiDayRain {...iconProps} /> : <WiNightAltRain {...iconProps} />;
  }

  // Snow group (600-622)
  if (weatherId >= 600 && weatherId < 700) {
    if (weatherId === 611 || weatherId === 612 || weatherId === 613 || weatherId === 615 || weatherId === 616) {
      // Sleet / Rain and snow
      return <WiSleet {...iconProps} />;
    } else if (weatherId === 602 || weatherId === 622) {
      // Heavy snow / Heavy shower snow
      return <WiSnowWind {...iconProps} />;
    } else if (weatherId === 600 || weatherId === 620) {
      // Light snow
      return isDay ? <WiDaySnow {...iconProps} /> : <WiNightAltSnow {...iconProps} />;
    }
    // Moderate snow (default)
    return <WiSnow {...iconProps} />;
  }

  // Atmosphere group (700-781)
  if (weatherId >= 700 && weatherId < 800) {
    if (weatherId === 701) {
      // Mist
      return <WiFog {...iconProps} />;
    } else if (weatherId === 711) {
      // Smoke
      return <WiSmoke {...iconProps} />;
    } else if (weatherId === 721) {
      // Haze
      return isDay ? <WiDayHaze {...iconProps} /> : <WiFog {...iconProps} />;
    } else if (weatherId === 731 || weatherId === 751 || weatherId === 761) {
      // Dust / Sand
      return <WiDust {...iconProps} />;
    } else if (weatherId === 741) {
      // Fog
      return <WiFog {...iconProps} />;
    } else if (weatherId === 771) {
      // Squall
      return <WiStrongWind {...iconProps} />;
    } else if (weatherId === 781) {
      // Tornado
      return <WiStrongWind {...iconProps} />;
    }
    // Default atmosphere
    return <WiFog {...iconProps} />;
  }

  // Clear (800)
  if (weatherId === 800) {
    return isDay ? <WiDaySunny {...iconProps} /> : <WiNightClear {...iconProps} />;
  }

  // Clouds group (801-804)
  if (weatherId > 800 && weatherId < 900) {
    if (weatherId === 801) {
      // Few clouds (11-25%)
      return isDay ? <WiDayCloudy {...iconProps} /> : <WiNightAltCloudy {...iconProps} />;
    } else if (weatherId === 802) {
      // Scattered clouds (25-50%)
      return isDay ? <WiDayCloudy {...iconProps} /> : <WiNightAltCloudy {...iconProps} />;
    } else if (weatherId === 803 || weatherId === 804) {
      // Broken / Overcast clouds (50%+)
      return <WiCloudy {...iconProps} />;
    }
  }

  // Fallback (shouldn't happen with proper mapping)
  return isDay ? <WiDaySunny {...iconProps} /> : <WiNightClear {...iconProps} />;
}

/**
 * Helper to determine if it's daytime based on icon code from API
 */
export function isDayTime(iconCode: string): boolean {
  return iconCode.endsWith('d');
}