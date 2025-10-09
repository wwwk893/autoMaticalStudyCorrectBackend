const SENSITIVE_KEYS = ['name', 'studentId', 'phone', 'email', 'idCard'];

export function redactPayload<T extends Record<string, unknown>>(payload: T): T {
  if (!payload) {
    return payload;
  }
  const clone: Record<string, unknown> = Array.isArray(payload) ? [...(payload as unknown[])] : { ...payload };
  for (const key of Object.keys(clone)) {
    const value = clone[key];
    if (value && typeof value === 'object') {
      clone[key] = redactPayload(value as Record<string, unknown>);
    } else if (typeof value === 'string' && SENSITIVE_KEYS.includes(key)) {
      clone[key] = mask(value);
    }
  }
  return clone as T;
}

function mask(value: string) {
  if (value.length <= 2) {
    return '*'.repeat(value.length);
  }
  return `${value[0]}${'*'.repeat(Math.max(value.length - 2, 2))}${value[value.length - 1]}`;
}
