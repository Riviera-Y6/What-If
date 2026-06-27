export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }});
    }
    if (request.method === 'POST') {
      const body = await request.json();
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
      });
      const d = await r.json();
      return new Response(JSON.stringify(d), {
        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
      });
    }
    return new Response('What-If Proxy', {status: 200});
  }
};