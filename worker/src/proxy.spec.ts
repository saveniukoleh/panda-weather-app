import { describe, expect, it } from 'vitest';
import {
  buildUpstreamUrl,
  handleRequest,
  interpretUpstream,
  isAllowedOrigin,
  parseProxyRequest,
  type FetchLike,
} from './proxy';

const LOCAL_ORIGIN = 'http://localhost:5173';

function proxyUrl(path: string): URL {
  return new URL(path, 'https://proxy.example');
}

describe('isAllowedOrigin', () => {
  it('allows GitHub Pages and local http origins, and rejects other sites', () => {
    expect(isAllowedOrigin('https://saveniukoleh.github.io', undefined)).toBe(true);
    expect(isAllowedOrigin('http://localhost:5173', undefined)).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:4173', undefined)).toBe(true);
    expect(isAllowedOrigin('https://preview.example', 'https://preview.example')).toBe(true);
    expect(isAllowedOrigin('https://evil.example', undefined)).toBe(false);
    expect(isAllowedOrigin('https://saveniukoleh.github.io.evil.example', undefined)).toBe(false);
    expect(isAllowedOrigin('http://localhost.evil.example', undefined)).toBe(false);
    expect(isAllowedOrigin('https://localhost:5173', undefined)).toBe(false);
    expect(isAllowedOrigin(null, undefined)).toBe(false);
  });
});

describe('parseProxyRequest', () => {
  it('accepts the three allowlisted routes and fills default geocoding limit', () => {
    expect(parseProxyRequest('GET', proxyUrl('/geocoding?q=Kyiv'))).toEqual({
      ok: true,
      request: { route: 'geocoding', q: 'Kyiv', limit: 5 },
    });
    expect(
      parseProxyRequest('GET', proxyUrl('/weather/?lat=50.45&lon=30.52&units=metric')),
    ).toEqual({
      ok: true,
      request: { route: 'weather', lat: '50.45', lon: '30.52' },
    });
    expect(parseProxyRequest('GET', proxyUrl('/forecast?lat=50&lon=30&lang=uk'))).toEqual({
      ok: true,
      request: { route: 'forecast', lat: '50', lon: '30', lang: 'uk' },
    });
  });

  it('rejects unsupported methods, paths, parameters, and coordinates', () => {
    expect(parseProxyRequest('POST', proxyUrl('/geocoding?q=Kyiv')).ok).toBe(false);
    expect(parseProxyRequest('GET', proxyUrl('/data/2.5/weather?lat=1&lon=2')).ok).toBe(false);
    expect(parseProxyRequest('GET', proxyUrl('/geocoding?q=Kyiv&appid=secret')).ok).toBe(false);
    expect(parseProxyRequest('GET', proxyUrl('/weather?lat=91&lon=0')).ok).toBe(false);
    expect(parseProxyRequest('GET', proxyUrl('/forecast?lat=1&lon=2&units=imperial')).ok).toBe(
      false,
    );
    expect(parseProxyRequest('GET', proxyUrl('/forecast?lat=1&lon=2&lang=fr')).ok).toBe(false);
    expect(parseProxyRequest('GET', proxyUrl('/geocoding?q=Kyiv&q=Lviv')).ok).toBe(false);
  });
});

describe('buildUpstreamUrl', () => {
  it('calls OpenWeatherMap directly and adds the server key and metric units', () => {
    const parsed = parseProxyRequest('GET', proxyUrl('/forecast?lat=50.45&lon=30.52&lang=en'));
    if (!parsed.ok) throw new Error('expected a valid forecast request');

    const upstream = new URL(buildUpstreamUrl(parsed.request, 'test-key'));
    expect(upstream.origin).toBe('https://api.openweathermap.org');
    expect(upstream.pathname).toBe('/data/2.5/forecast');
    expect(upstream.searchParams.get('appid')).toBe('test-key');
    expect(upstream.searchParams.get('units')).toBe('metric');
    expect(upstream.searchParams.get('lang')).toBe('en');
    expect(upstream.searchParams.get('lat')).toBe('50.45');
    expect(upstream.searchParams.get('lon')).toBe('30.52');
  });
});

describe('interpretUpstream', () => {
  it('maps an embedded provider error and does not keep its message', () => {
    expect(interpretUpstream(200, { cod: '401', message: 'Invalid API key' })).toEqual({
      status: 401,
      code: 'unauthorized',
    });
    expect(interpretUpstream(429, { message: 'rate details' })).toEqual({
      status: 429,
      code: 'rate_limit',
    });
    expect(interpretUpstream(200, [])).toBeNull();
    expect(interpretUpstream(302, {})).toEqual({ status: 502, code: 'unknown' });
  });
});

describe('handleRequest', () => {
  it('does not proxy a disallowed origin or a missing key', async () => {
    const fetchImpl: FetchLike = () => Promise.reject(new Error('fetch should not be called'));

    const denied = await handleRequest(
      new Request('https://proxy.example/geocoding?q=Kyiv'),
      { OPENWEATHER_API_KEY: 'test-key' },
      fetchImpl,
    );
    expect(denied.status).toBe(403);
    expect(denied.headers.get('Access-Control-Allow-Origin')).toBeNull();

    const unconfigured = await handleRequest(
      new Request('https://proxy.example/geocoding?q=Kyiv', {
        headers: { Origin: LOCAL_ORIGIN },
      }),
      {},
      fetchImpl,
    );
    expect(unconfigured.status).toBe(500);
    expect(await unconfigured.text()).not.toContain('OPENWEATHER_API_KEY');
  });

  it('returns upstream JSON without the API key or provider error text', async () => {
    const seen: string[] = [];
    const fetchImpl: FetchLike = (input) => {
      seen.push(input);
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    };

    const response = await handleRequest(
      new Request('https://proxy.example/geocoding?q=Kyiv', {
        headers: { Origin: LOCAL_ORIGIN },
      }),
      { OPENWEATHER_API_KEY: 'test-key' },
      fetchImpl,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(LOCAL_ORIGIN);
    expect(await response.text()).toBe('[]');
    expect(seen[0]).toContain('https://api.openweathermap.org/geo/1.0/direct');
    expect(seen[0]).toContain('appid=test-key');
  });

  it('replaces provider errors and drops any payload that echoes the key', async () => {
    const unauthorized: FetchLike = () =>
      Promise.resolve(
        new Response(JSON.stringify({ cod: 401, message: 'Invalid API key. See provider docs.' }), {
          status: 401,
        }),
      );
    const unauthorizedResponse = await handleRequest(
      new Request('https://proxy.example/weather?lat=50&lon=30', {
        headers: { Origin: LOCAL_ORIGIN },
      }),
      { OPENWEATHER_API_KEY: 'test-key' },
      unauthorized,
    );
    const unauthorizedBody = await unauthorizedResponse.text();
    expect(unauthorizedResponse.status).toBe(401);
    expect(unauthorizedBody).toContain('unauthorized');
    expect(unauthorizedBody).not.toContain('provider docs');
    expect(unauthorizedBody).not.toContain('test-key');

    const echoed: FetchLike = () =>
      Promise.resolve(new Response(JSON.stringify({ echo: 'test-key' }), { status: 200 }));
    const echoedResponse = await handleRequest(
      new Request('https://proxy.example/weather?lat=50&lon=30', {
        headers: { Origin: LOCAL_ORIGIN },
      }),
      { OPENWEATHER_API_KEY: 'test-key' },
      echoed,
    );
    expect(echoedResponse.status).toBe(502);
    expect(await echoedResponse.text()).not.toContain('test-key');
  });
});
