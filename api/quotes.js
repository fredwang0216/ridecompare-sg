// Vercel serverless function for RideCompare SG.
// Provider credentials stay server-side in Vercel environment variables.
// The adapter supports both GET query APIs and POST JSON APIs, and either
// Authorization: Bearer <key> or a custom header such as X-API-Key.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from, to } = req.query || {};
  if (!from || !to) {
    return res.status(400).json({ error: 'from and to are required' });
  }

  const upstream = process.env.RIDECOMPARE_PROVIDER_API_URL;
  const apiKey = process.env.RIDECOMPARE_PROVIDER_API_KEY;

  if (!upstream || !apiKey) {
    return res.status(503).json({
      error: 'fare_provider_not_configured',
      message: 'Live fare provider credentials are not configured on the server yet.'
    });
  }

  const method = (process.env.RIDECOMPARE_PROVIDER_METHOD || 'GET').toUpperCase();
  const authHeader = process.env.RIDECOMPARE_PROVIDER_AUTH_HEADER || 'Authorization';
  const authScheme = process.env.RIDECOMPARE_PROVIDER_AUTH_SCHEME ?? 'Bearer';
  const authValue = authScheme ? `${authScheme} ${apiKey}` : apiKey;

  try {
    const url = new URL(upstream);
    const headers = {
      [authHeader]: authValue,
      Accept: 'application/json'
    };

    const payload = {
      from,
      to,
      origin: from,
      destination: to
    };

    const request = { method, headers };

    if (method === 'GET') {
      url.searchParams.set('from', from);
      url.searchParams.set('to', to);
    } else {
      headers['Content-Type'] = 'application/json';
      request.body = JSON.stringify(payload);
    }

    const response = await fetch(url, request);
    const text = await response.text();

    if (!response.ok) {
      return res.status(502).json({
        error: 'fare_provider_error',
        provider_status: response.status
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'invalid_provider_json' });
    }

    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ error: 'fare_provider_unreachable' });
  }
}
