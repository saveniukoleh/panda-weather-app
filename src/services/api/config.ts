import { AppRequestError } from './errors';

export interface ApiBaseUrlOptions {
  production?: boolean;
}

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL, {
    production: import.meta.env.PROD,
  });
}

export function resolveApiBaseUrl(
  raw: string | undefined,
  options: ApiBaseUrlOptions = {},
): string {
  const value = raw?.trim() ?? '';
  if (!value) throw new AppRequestError('unknown');

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppRequestError('unknown');
  }

  if (url.username !== '' || url.password !== '') throw new AppRequestError('unknown');
  if (url.search !== '' || url.hash !== '') throw new AppRequestError('unknown');
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new AppRequestError('unknown');
  if (options.production && url.protocol !== 'https:') throw new AppRequestError('unknown');
  if (isOpenWeatherHost(url.hostname)) throw new AppRequestError('unknown');

  const path = url.pathname.replace(/\/+$/, '');
  return `${url.origin}${path}`;
}

function isOpenWeatherHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return host === 'openweathermap.org' || host.endsWith('.openweathermap.org');
}
