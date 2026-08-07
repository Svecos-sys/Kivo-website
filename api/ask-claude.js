// api/ask-claude.js
// Vercel serverless function — proxies all Claude API calls from the browser
// Keeps the ANTHROPIC_API_KEY server-side, never exposed to the browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', 'https://getkivo.co.uk');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { model, max_tokens, messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing required field: messages' });
  }

  const body = {
    model: model || 'claude-sonnet-4-20250514',
    max_tokens: max_tokens || 1000,
    messages,
  };

  // Include system prompt if provided (used by the chat feature)
  if (system) body.system = system;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Function error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
