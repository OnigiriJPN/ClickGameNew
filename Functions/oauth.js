// netlify/functions/oauth.js
import fetch from 'node-fetch';

export async function handler(event, context) {
  try {
    const { code } = JSON.parse(event.body);

    if (!code) {
      return { statusCode: 400, body: 'Code is required' };
    }

    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    // GitHub にアクセストークンをリクエスト
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id, client_secret, code }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return { statusCode: 400, body: JSON.stringify(tokenData) };
    }

    return { statusCode: 200, body: JSON.stringify({ access_token: tokenData.access_token }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
