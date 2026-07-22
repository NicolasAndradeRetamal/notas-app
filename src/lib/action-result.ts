export const ACTION_ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'AI_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

export type ActionErrorCode = (typeof ACTION_ERROR_CODES)[number];

export type FieldErrors<TInput> = Partial<Record<keyof TInput | '_form', string[]>>;

export type ActionSuccess<TData> = {
  ok: true;
  data: TData;
};

export type ActionFailure<TInput = unknown> = {
  ok: false;
  code: ActionErrorCode;
  message: string;
  fieldErrors?: FieldErrors<TInput>;
};

export type ActionResult<TData, TInput = unknown> = ActionSuccess<TData> | ActionFailure<TInput>;

export const ACTION_ERROR_STATUS: Record<ActionErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  AI_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export function ok<TData>(data: TData): ActionSuccess<TData> {
  return { ok: true, data };
}

export function fail<TInput = unknown>(
  code: ActionErrorCode,
  message: string,
  fieldErrors?: FieldErrors<TInput>,
): ActionFailure<TInput> {
  return fieldErrors ? { ok: false, code, message, fieldErrors } : { ok: false, code, message };
}
