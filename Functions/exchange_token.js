import fetch from 'node-fetch';

export async function handler(event) {
    const { code } = JSON.parse(event.body);
    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {'Accept':'application/json','Content-Type':'application/json'},
        body: JSON.stringify({client_id, client_secret, code})
    });
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify({access_token: data.access_token}) };
}
