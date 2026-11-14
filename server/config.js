import 'dotenv/config';

export const port = Number(process.env.PORT || 3001);
export const apiVersion = 'v66.0';
export const isProduction = process.env.NODE_ENV === 'production';
export const loginUrl = (process.env.SF_LOGIN_URL || 'https://login.salesforce.com').replace(/\/$/, '');
export const callbackUrl = process.env.SF_CALLBACK_URL || `http://localhost:${port}/auth/callback`;

export function assertProductionConfig() {
  if (isProduction && (!process.env.SF_CLIENT_ID || !process.env.SESSION_SECRET)) {
    throw new Error('Set SF_CLIENT_ID and SESSION_SECRET before starting in production.');
  }
}
