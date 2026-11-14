import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestGeocoding } from '../api/client';
import { AppRequestError } from '../api/errors';
import { geocodingService } from './geocodingService';

vi.mock('../api/client', () => ({
  requestGeocoding: vi.fn(),
}));

const request = vi.mocked(requestGeocoding);

describe('geocodingService', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('maps validated places to CityLocation values and passes the request through', async () => {
    request.mockResolvedValue([
      { name: 'Kyiv', country: 'UA', state: 'Kyiv City', lat: 50.45, lon: 30.52 },
      { name: 'Paris', country: 'FR', lat: 48.85, lon: 2.35 },
    ]);

    const results = await geocodingService.search({
      query: '  Kyiv ',
      limit: 3,
      signal: undefined,
    });

    expect(request).toHaveBeenCalledWith({ q: '  Kyiv ', limit: 3 }, undefined);
    expect(results).toEqual([
      { name: 'Kyiv', country: 'UA', state: 'Kyiv City', lat: 50.45, lon: 30.52 },
      { name: 'Paris', country: 'FR', lat: 48.85, lon: 2.35 },
    ]);
    expect(Object.hasOwn(results[1]!, 'state')).toBe(false);
  });

  it('returns an empty list when the provider has no matches', async () => {
    request.mockResolvedValue([]);

    await expect(geocodingService.search({ query: 'Nowhere' })).resolves.toEqual([]);
  });

  it('propagates API failures and cancellation without wrapping them', async () => {
    const signal = new AbortController().signal;
    request.mockRejectedValueOnce(new AppRequestError('rate_limit'));
    await expect(geocodingService.search({ query: 'Kyiv', signal })).rejects.toMatchObject({
      name: 'AppRequestError',
      code: 'rate_limit',
    });
    expect(request).toHaveBeenCalledWith({ q: 'Kyiv', limit: undefined }, signal);

    const aborted = new Error('The operation was aborted');
    aborted.name = 'AbortError';
    request.mockRejectedValueOnce(aborted);
    await expect(geocodingService.search({ query: 'Kyiv' })).rejects.toBe(aborted);
  });
});
