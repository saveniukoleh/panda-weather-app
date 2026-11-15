export type AppErrorCode =
  | 'network'
  | 'unauthorized'
  | 'not_found'
  | 'rate_limit'
  | 'invalid_request'
  | 'invalid_response'
  | 'unknown';

export interface AppError {
  code: AppErrorCode;
  message: string;
}

export type LocaleCode = 'en' | 'uk';

export type WeatherLanguage = LocaleCode;

export interface GeocodingQuery {
  q: string;
  limit?: number;
}

export interface WeatherQuery {
  lat: number;
  lon: number;
  lang?: WeatherLanguage;
}
