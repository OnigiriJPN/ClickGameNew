// netlify/functions/saveData.js
import fetch from 'node-fetch';

export async function handler(event, context) {
  try {
    const { access_token, repo, path, content } = JSON.parse(event.body);

    if (!access_token || !repo || !path || !content) {
      return { statusCode: 400, body: 'Missing parameters' };
    }

    // GitHub にファイルを作成/更新
    const apiRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Save Clicker Game Data',
        content: Buffer.from(JSON.stringify(content)).toString('base64'),
      }),
    });

    const data = await apiRes.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
