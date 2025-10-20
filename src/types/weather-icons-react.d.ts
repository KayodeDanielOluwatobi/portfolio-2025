// types/weather-icons-react.d.ts
declare module 'weather-icons-react' {
  import { FC } from 'react';

  export interface WeatherIconProps {
    size?: number;
    color?: string;
    className?: string;
  }

  export const WiDaySunny: FC<WeatherIconProps>;
  export const WiNightClear: FC<WeatherIconProps>;
  export const WiDayCloudy: FC<WeatherIconProps>;
  export const WiNightAltCloudy: FC<WeatherIconProps>;
  export const WiCloudy: FC<WeatherIconProps>;
  export const WiDayShowers: FC<WeatherIconProps>;
  export const WiNightAltShowers: FC<WeatherIconProps>;
  export const WiDayRain: FC<WeatherIconProps>;
  export const WiNightAltRain: FC<WeatherIconProps>;
  export const WiDayRainWind: FC<WeatherIconProps>;
  export const WiNightAltRainWind: FC<WeatherIconProps>;
  export const WiDaySprinkle: FC<WeatherIconProps>;
  export const WiNightAltSprinkle: FC<WeatherIconProps>;
  export const WiDayThunderstorm: FC<WeatherIconProps>;
  export const WiNightAltThunderstorm: FC<WeatherIconProps>;
  export const WiThunderstorm: FC<WeatherIconProps>;
  export const WiDayLightning: FC<WeatherIconProps>;
  export const WiNightAltLightning: FC<WeatherIconProps>;
  export const WiDaySnow: FC<WeatherIconProps>;
  export const WiNightAltSnow: FC<WeatherIconProps>;
  export const WiSnow: FC<WeatherIconProps>;
  export const WiSnowWind: FC<WeatherIconProps>;
  export const WiSleet: FC<WeatherIconProps>;
  export const WiFog: FC<WeatherIconProps>;
  export const WiSmoke: FC<WeatherIconProps>;
  export const WiDust: FC<WeatherIconProps>;
  export const WiDayHaze: FC<WeatherIconProps>;
  export const WiWindy: FC<WeatherIconProps>;
  export const WiStrongWind: FC<WeatherIconProps>;
  export const WiDayWindy: FC<WeatherIconProps>;
  export const WiNightAltWindy: FC<WeatherIconProps>;
}