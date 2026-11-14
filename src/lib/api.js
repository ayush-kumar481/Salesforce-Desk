export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const body = response.status === 204
    ? {}
    : await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || body.message || 'The request could not be completed.');
  }

  return body;
}
