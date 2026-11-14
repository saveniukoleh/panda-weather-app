import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './config';
import { AppRequestError } from './errors';

describe('resolveApiBaseUrl', () => {
  it('normalizes a worker origin and strips a trailing slash', () => {
    expect(resolveApiBaseUrl('http://127.0.0.1:8787/')).toBe('http://127.0.0.1:8787');
    expect(resolveApiBaseUrl(' https://panda.example.workers.dev/proxy/ ')).toBe(
      'https://panda.example.workers.dev/proxy',
    );
  });

  it('rejects a missing URL, OpenWeatherMap hosts, and unsafe URL parts', () => {
    expect(() => resolveApiBaseUrl(undefined)).toThrow(AppRequestError);
    expect(() => resolveApiBaseUrl('https://api.openweathermap.org/data/2.5/weather')).toThrow(
      AppRequestError,
    );
    expect(() => resolveApiBaseUrl('https://geo.openweathermap.org')).toThrow(AppRequestError);
    expect(() => resolveApiBaseUrl('https://user:pass@127.0.0.1:8787')).toThrow(AppRequestError);
    expect(() => resolveApiBaseUrl('http://127.0.0.1:8787?appid=secret')).toThrow(AppRequestError);
  });

  it('requires https for a production base URL', () => {
    expect(() => resolveApiBaseUrl('http://127.0.0.1:8787', { production: true })).toThrow(
      AppRequestError,
    );
    expect(resolveApiBaseUrl('https://panda.example.workers.dev', { production: true })).toBe(
      'https://panda.example.workers.dev',
    );
  });

  it('does not treat a lookalike hostname as OpenWeatherMap', () => {
    expect(resolveApiBaseUrl('https://openweathermap.org.evil.example')).toBe(
      'https://openweathermap.org.evil.example',
    );
  });
});
