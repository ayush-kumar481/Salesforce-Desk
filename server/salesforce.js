import { apiVersion, loginUrl } from './config.js';

export function cleanError(error) {
  return error?.message || 'Something went wrong while contacting Salesforce.';
}

async function refreshAccessToken(req) {
  const session = req.session.salesforce;
  if (!session?.accessToken) {
    throw new Error('Your Salesforce session has expired. Please log in again.');
  }

  if (session.expiresAt && Date.now() < session.expiresAt - 60_000) {
    return session.accessToken;
  }
  if (!session.refreshToken) return session.accessToken;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.SF_CLIENT_ID || '',
    refresh_token: session.refreshToken,
  });
  if (process.env.SF_CLIENT_SECRET) body.set('client_secret', process.env.SF_CLIENT_SECRET);

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const result = await response.json();

  if (!response.ok) {
    delete req.session.salesforce;
    throw new Error('Salesforce session expired. Please log in again.');
  }

  Object.assign(session, {
    accessToken: result.access_token,
    instanceUrl: result.instance_url,
    refreshToken: result.refresh_token || session.refreshToken,
    expiresAt: Date.now() + (Number(result.expires_in) || 7200) * 1000,
  });
  return session.accessToken;
}

export async function salesforceRequest(req, endpoint, options = {}) {
  const session = req.session.salesforce;
  const token = await refreshAccessToken(req);
  const response = await fetch(`${session.instanceUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(data)
      ? data.map((item) => item.message).join(' ')
      : data.message || data.error_description || 'Salesforce request failed.';
    if (response.status === 401) delete req.session.salesforce;
    throw new Error(message);
  }

  return data;
}

export function queryEndpoint(query) {
  return `/services/data/${apiVersion}/query?q=${encodeURIComponent(query)}`;
}

export function recordEndpoint(objectName, id) {
  return `/services/data/${apiVersion}/sobjects/${objectName}/${encodeURIComponent(id)}`;
}
