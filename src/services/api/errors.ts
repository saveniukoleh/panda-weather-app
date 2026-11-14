import type { AppError, AppErrorCode } from '../../types/api';

const APP_ERROR_CODES: readonly AppErrorCode[] = [
  'network',
  'unauthorized',
  'not_found',
  'rate_limit',
  'invalid_request',
  'invalid_response',
  'unknown',
];

const MESSAGES: Record<AppErrorCode, string> = {
  network: 'The weather service could not be reached.',
  unauthorized: 'The weather service rejected the request.',
  not_found: 'The requested data was not found.',
  rate_limit: 'The weather service is rate limited. Try again later.',
  invalid_request: 'The request is not allowed.',
  invalid_response: 'The weather service returned an unexpected response.',
  unknown: 'The weather service is unavailable.',
};

export class AppRequestError extends Error implements AppError {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode) {
    super(MESSAGES[code]);
    this.name = 'AppRequestError';
    this.code = code;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function errorFromHttpStatus(status: number, body: unknown): AppRequestError {
  return new AppRequestError(errorCodeFromBody(body) ?? errorCodeFromStatus(status));
}

function errorCodeFromBody(body: unknown): AppErrorCode | null {
  if (!isRecord(body) || !isRecord(body.error)) return null;
  const code = body.error.code;
  if (typeof code === 'string' && isAppErrorCode(code)) return code;
  return null;
}

function errorCodeFromStatus(status: number): AppErrorCode {
  switch (status) {
    case 400:
    case 403:
    case 405:
      return 'invalid_request';
    case 401:
      return 'unauthorized';
    case 404:
      return 'not_found';
    case 429:
      return 'rate_limit';
    default:
      return 'unknown';
  }
}

function isAppErrorCode(value: string): value is AppErrorCode {
  return APP_ERROR_CODES.some((code) => code === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
