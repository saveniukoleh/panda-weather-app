import { describe, expect, it } from 'vitest';
import { AppRequestError, errorFromHttpStatus, isAbortError } from './errors';

describe('errorFromHttpStatus', () => {
  it('uses a known worker error code and ignores the upstream message', () => {
    const error = errorFromHttpStatus(401, {
      error: { code: 'unauthorized', message: 'Invalid API key sk-live-example' },
    });

    expect(error).toBeInstanceOf(AppRequestError);
    expect(error.code).toBe('unauthorized');
    expect(error.message).not.toContain('sk-live-example');
    expect(error.message).not.toContain('Invalid API key');
  });

  it('falls back to the HTTP status when the error code is not recognized', () => {
    expect(errorFromHttpStatus(404, { error: { code: 'drop_table' } }).code).toBe('not_found');
    expect(errorFromHttpStatus(400, null).code).toBe('invalid_request');
    expect(errorFromHttpStatus(403, null).code).toBe('invalid_request');
    expect(errorFromHttpStatus(405, null).code).toBe('invalid_request');
    expect(errorFromHttpStatus(429, null).code).toBe('rate_limit');
    expect(errorFromHttpStatus(500, { message: 'secret upstream detail' }).code).toBe('unknown');
    expect(errorFromHttpStatus(500, { message: 'secret upstream detail' }).message).not.toContain(
      'secret upstream detail',
    );
  });
});

describe('isAbortError', () => {
  it('recognizes an aborted request and does not treat application errors as aborts', () => {
    const aborted = new Error('The operation was aborted');
    aborted.name = 'AbortError';

    expect(isAbortError(aborted)).toBe(true);
    expect(isAbortError(new AppRequestError('network'))).toBe(false);
    expect(isAbortError(new Error('offline'))).toBe(false);
  });
});
