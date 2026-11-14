// Keep geocoding limits aligned with src/services/api/validate.ts.
export const PRODUCTION_ORIGIN = 'https://saveniukoleh.github.io';
export const GEOCODING_QUERY_MAX_LENGTH = 100;
export const GEOCODING_LIMIT_MAX = 5;

const MAX_UPSTREAM_BODY_CHARS = 1_000_000;
const UPSTREAM_TIMEOUT_MS = 10_000;
const MIN_API_KEY_LENGTH = 8;

const UPSTREAM_URLS = {
  geocoding: 'https://api.openweathermap.org/geo/1.0/direct',
  weather: 'https://api.openweathermap.org/data/2.5/weather',
  forecast: 'https://api.openweathermap.org/data/2.5/forecast',
} as const;

export type WeatherLang = 'en' | 'uk';

export type PublicErrorCode =
  | 'network'
  | 'unauthorized'
  | 'not_found'
  | 'rate_limit'
  | 'invalid_request'
  | 'invalid_response'
  | 'unknown';

export interface WorkerEnv {
  OPENWEATHER_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
}

export interface GeocodingRequest {
  route: 'geocoding';
  q: string;
  limit: number;
}

export interface WeatherRequest {
  route: 'weather' | 'forecast';
  lat: string;
  lon: string;
  lang?: WeatherLang;
}

export type ProxyRequest = GeocodingRequest | WeatherRequest;

export interface ProxyRejection {
  status: number;
  code: PublicErrorCode;
}

export type ParseResult =
  { ok: true; request: ProxyRequest } | { ok: false; error: ProxyRejection };

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const MESSAGES: Record<PublicErrorCode, string> = {
  network: 'The weather service could not be reached.',
  unauthorized: 'The weather service rejected the request.',
  not_found: 'The requested data was not found.',
  rate_limit: 'The weather service is rate limited. Try again later.',
  invalid_request: 'The request is not allowed.',
  invalid_response: 'The weather service returned an unexpected response.',
  unknown: 'The weather service is unavailable.',
};

export function isAllowedOrigin(
  origin: string | null,
  allowedOrigins: string | undefined,
): boolean {
  if (!origin) return false;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (url.origin !== origin) return false;
  if (configuredOrigins(allowedOrigins).has(origin)) return true;
  return url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
}

export function parseProxyRequest(method: string, url: URL): ParseResult {
  if (method !== 'GET') return reject(405, 'invalid_request');

  const path = normalizePath(url.pathname);
  if (!path) return reject(404, 'not_found');
  if (hasDuplicateKeys(url)) return reject(400, 'invalid_request');

  if (path === '/geocoding') {
    if (!hasOnlyKeys(url, ['q', 'limit'])) return reject(400, 'invalid_request');
    const q = parseCityQuery(url.searchParams.get('q'));
    const limit = parseLimit(url.searchParams.get('limit'));
    if (q === null || limit === null) return reject(400, 'invalid_request');
    return { ok: true, request: { route: 'geocoding', q, limit } };
  }

  if (!hasOnlyKeys(url, ['lat', 'lon', 'lang', 'units'])) return reject(400, 'invalid_request');
  if (!isMetricUnits(url.searchParams.get('units'))) return reject(400, 'invalid_request');

  const lat = parseCoordinate(url.searchParams.get('lat'), -90, 90);
  const lon = parseCoordinate(url.searchParams.get('lon'), -180, 180);
  const lang = parseLang(url.searchParams.get('lang'));
  if (lat === null || lon === null || !lang.ok) return reject(400, 'invalid_request');

  const request: WeatherRequest = {
    route: path === '/weather' ? 'weather' : 'forecast',
    lat,
    lon,
  };
  if (lang.lang) request.lang = lang.lang;
  return { ok: true, request };
}

export function buildUpstreamUrl(request: ProxyRequest, apiKey: string): string {
  const url = new URL(UPSTREAM_URLS[request.route]);
  if (request.route === 'geocoding') {
    url.searchParams.set('q', request.q);
    url.searchParams.set('limit', String(request.limit));
  } else {
    url.searchParams.set('lat', request.lat);
    url.searchParams.set('lon', request.lon);
    url.searchParams.set('units', 'metric');
    if (request.lang) url.searchParams.set('lang', request.lang);
  }
  url.searchParams.set('appid', apiKey);
  return url.toString();
}

export function interpretUpstream(httpStatus: number, payload: unknown): ProxyRejection | null {
  if (httpStatus >= 300 && httpStatus < 400) return { status: 502, code: 'unknown' };

  const status = payloadStatus(httpStatus, payload);
  if (status >= 200 && status < 300) return null;
  return { status: publicHttpStatus(status), code: codeForStatus(status) };
}

export function containsSecret(value: unknown, secret: string): boolean {
  if (secret.length < MIN_API_KEY_LENGTH) return false;
  if (typeof value === 'string') return value.includes(secret);
  if (Array.isArray(value)) return value.some((item) => containsSecret(item, secret));
  if (value !== null && typeof value === 'object') {
    return Object.values(value).some((item) => containsSecret(item, secret));
  }
  return false;
}

export async function handleRequest(
  request: Request,
  env: WorkerEnv,
  fetchImpl: FetchLike = fetch,
): Promise<Response> {
  const requestOrigin = request.headers.get('Origin');
  const origin = isAllowedOrigin(requestOrigin, env.ALLOWED_ORIGINS) ? requestOrigin : null;
  if (!origin) return jsonError(403, 'invalid_request', null);

  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return jsonError(400, 'invalid_request', origin);
  }

  if (request.method === 'OPTIONS') {
    if (!normalizePath(url.pathname)) return jsonError(404, 'not_found', origin);
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }

  const parsed = parseProxyRequest(request.method, url);
  if (!parsed.ok) return jsonError(parsed.error.status, parsed.error.code, origin);

  const apiKey = env.OPENWEATHER_API_KEY?.trim() ?? '';
  if (apiKey.length < MIN_API_KEY_LENGTH) {
    console.error('OPENWEATHER_API_KEY is not configured');
    return jsonError(500, 'unknown', origin);
  }

  let upstream: Response;
  try {
    upstream = await fetchImpl(buildUpstreamUrl(parsed.request, apiKey), {
      method: 'GET',
      redirect: 'manual',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return jsonError(502, 'network', origin);
  }

  if (upstream.status >= 300 && upstream.status < 400) return jsonError(502, 'unknown', origin);

  let text: string;
  try {
    text = await upstream.text();
  } catch {
    return jsonError(502, 'network', origin);
  }

  if (text.length > MAX_UPSTREAM_BODY_CHARS || text.includes(apiKey)) {
    return jsonError(502, 'invalid_response', origin);
  }

  let payload: unknown = null;
  if (text.trim() !== '') {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      if (upstream.status >= 200 && upstream.status < 300) {
        return jsonError(502, 'invalid_response', origin);
      }
      return jsonError(publicHttpStatus(upstream.status), codeForStatus(upstream.status), origin);
    }
  }

  if (containsSecret(payload, apiKey)) return jsonError(502, 'invalid_response', origin);

  const failure = interpretUpstream(upstream.status, payload);
  if (failure) return jsonError(failure.status, failure.code, origin);

  const headers = responseHeaders(origin);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(payload), { status: 200, headers });
}

function configuredOrigins(allowedOrigins: string | undefined): Set<string> {
  const origins = new Set<string>([PRODUCTION_ORIGIN]);
  if (!allowedOrigins) return origins;

  for (const part of allowedOrigins.split(',')) {
    const candidate = part.trim();
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.origin === candidate && (url.protocol === 'http:' || url.protocol === 'https:')) {
        origins.add(candidate);
      }
    } catch {
      // Ignore a malformed extra origin rather than failing every request.
    }
  }
  return origins;
}

function normalizePath(pathname: string): '/geocoding' | '/weather' | '/forecast' | null {
  const path = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (path === '/geocoding' || path === '/weather' || path === '/forecast') return path;
  return null;
}

function hasDuplicateKeys(url: URL): boolean {
  const seen = new Set<string>();
  for (const key of url.searchParams.keys()) {
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function hasOnlyKeys(url: URL, allowed: readonly string[]): boolean {
  for (const key of url.searchParams.keys()) {
    if (!allowed.includes(key)) return false;
  }
  return true;
}

function parseCityQuery(raw: string | null): string | null {
  if (raw === null) return null;
  const query = raw.trim();
  if (query.length < 1 || query.length > GEOCODING_QUERY_MAX_LENGTH) return null;
  if (hasControlCharacter(query)) return null;
  return query;
}

function parseLimit(raw: string | null): number | null {
  if (raw === null) return GEOCODING_LIMIT_MAX;
  if (!/^[1-5]$/.test(raw)) return null;
  return Number(raw);
}

function parseCoordinate(raw: string | null, min: number, max: number): string | null {
  if (raw === null) return null;
  const value = raw.trim();
  if (value.length < 1 || value.length > 32 || !/^-?(?:\d+)(?:\.\d+)?$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return value;
}

function parseLang(raw: string | null): { ok: true; lang?: WeatherLang } | { ok: false } {
  if (raw === null) return { ok: true };
  if (raw === 'en' || raw === 'uk') return { ok: true, lang: raw };
  return { ok: false };
}

function isMetricUnits(raw: string | null): boolean {
  return raw === null || raw === 'metric';
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

function payloadStatus(httpStatus: number, payload: unknown): number {
  if (httpStatus !== 200 || Array.isArray(payload) || !isRecord(payload) || !('cod' in payload)) {
    return httpStatus;
  }

  const cod = payload.cod;
  if (typeof cod === 'number' && Number.isFinite(cod)) return cod;
  if (typeof cod === 'string' && /^[0-9]+$/.test(cod)) return Number(cod);
  return httpStatus;
}

function publicHttpStatus(status: number): number {
  if (status === 400 || status === 401 || status === 404 || status === 429) return status;
  if (status >= 400 && status < 500) return 400;
  return 502;
}

function codeForStatus(status: number): PublicErrorCode {
  switch (status) {
    case 400:
      return 'invalid_request';
    case 401:
      return 'unauthorized';
    case 404:
      return 'not_found';
    case 429:
      return 'rate_limit';
    default:
      return status >= 400 && status < 500 ? 'invalid_request' : 'unknown';
  }
}

function reject(status: number, code: PublicErrorCode): ParseResult {
  return { ok: false, error: { status, code } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function responseHeaders(origin: string): Headers {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Accept, Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  return headers;
}

function jsonError(status: number, code: PublicErrorCode, origin: string | null): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (origin) {
    const cors = responseHeaders(origin);
    cors.forEach((value, key) => headers.set(key, value));
  }
  return new Response(JSON.stringify({ error: { code, message: MESSAGES[code] } }), {
    status,
    headers,
  });
}
