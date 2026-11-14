import crypto from 'node:crypto';
import { Router } from 'express';
import { callbackUrl, loginUrl } from '../config.js';
import { cleanError } from '../salesforce.js';

const router = Router();

function redirectToApp(req, res, params = {}) {
  const configuredUrl = process.env.APP_URL;
  const defaultUrl = process.env.NODE_ENV === 'production'
    ? `${req.protocol}://${req.get('host')}`
    : 'http://localhost:5173';
  const destination = new URL('/', configuredUrl || defaultUrl);

  for (const [key, value] of Object.entries(params)) {
    destination.searchParams.set(key, value);
  }

  res.redirect(destination.toString());
}

router.get('/login', (req, res) => {
  if (!process.env.SF_CLIENT_ID) {
    return res.status(503).send('Set SF_CLIENT_ID in the server environment first.');
  }

  const state = crypto.randomBytes(24).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  req.session.oauthState = state;
  req.session.codeVerifier = codeVerifier;

  const authorizeUrl = new URL(`${loginUrl}/services/oauth2/authorize`);
  authorizeUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SF_CLIENT_ID,
    redirect_uri: callbackUrl,
    scope: 'api refresh_token openid',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString();

  res.redirect(authorizeUrl.toString());
});

router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error) throw new Error(String(error));
    const codeVerifier = req.session.codeVerifier;
    if (!code || !state || state !== req.session.oauthState || !codeVerifier) {
      throw new Error('OAuth state validation failed. Please try again.');
    }

    delete req.session.oauthState;
    delete req.session.codeVerifier;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      client_id: process.env.SF_CLIENT_ID || '',
      redirect_uri: callbackUrl,
      code_verifier: codeVerifier,
    });
    if (process.env.SF_CLIENT_SECRET) body.set('client_secret', process.env.SF_CLIENT_SECRET);

    const response = await fetch(`${loginUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || data.error || 'Token exchange failed.');

    req.session.salesforce = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      instanceUrl: data.instance_url,
      id: data.id,
      expiresAt: Date.now() + (Number(data.expires_in) || 7200) * 1000,
    };
    redirectToApp(req, res);
  } catch (error) {
    redirectToApp(req, res, { authError: cleanError(error) });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.clearCookie('sfdesk.sid').json({ ok: true }));
});

export default router;
