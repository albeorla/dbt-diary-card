#!/usr/bin/env node
/**
 * Quick Google OAuth client credential check.
 *
 * It calls Google's token endpoint with a fake code.
 * If your client_id/client_secret are correct, Google should return:
 *   error: invalid_grant
 * If they are wrong, Google will return:
 *   error: invalid_client
 *
 * Usage:
 *   node scripts/test-google-oauth-client.js
 * (reads AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, NEXTAUTH_URL from env)
 */

import fetch from 'node-fetch';

const client_id = process.env.AUTH_GOOGLE_ID;
const client_secret = process.env.AUTH_GOOGLE_SECRET;
const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const redirect_uri = `${base.replace(/\/$/, '')}/api/auth/callback/google`;

if (!client_id || !client_secret) {
  console.error('Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET in environment');
  process.exit(1);
}

console.log('Testing Google OAuth client credentials...');
console.log('- client_id:', client_id);
console.log('- redirect_uri:', redirect_uri);

const params = new URLSearchParams();
params.set('grant_type', 'authorization_code');
params.set('code', 'fake-code-for-validation');
params.set('client_id', client_id);
params.set('client_secret', client_secret);
params.set('redirect_uri', redirect_uri);

const res = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params.toString(),
});

const text = await res.text();
let payload;
try {
  payload = JSON.parse(text);
} catch {
  payload = { raw: text };
}

console.log('Status:', res.status);
console.log('Response:', payload);

if (payload && payload.error === 'invalid_client') {
  console.error(
    '\n❌ invalid_client: Your AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET pair is incorrect or mismatched.',
  );
  process.exit(2);
}
if (payload && payload.error === 'invalid_grant') {
  console.log(
    '\n✅ invalid_grant: Credentials look correct. (The code is fake, which is expected.)',
  );
  process.exit(0);
}

console.log(
  '\nℹ️ Received an unexpected response. If error mentions redirect_uri_mismatch, ensure the exact redirect URI is authorized in Google Console:',
  redirect_uri,
);
process.exit(0);
