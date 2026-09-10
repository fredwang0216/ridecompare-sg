// Vercel serverless function for RideCompare SG.
//
// IMPORTANT:
// - This file is intentionally provider-agnostic. Do NOT put provider API keys in index.html.
// - Set RIDECOMPARE_PROVIDER_API_URL and RIDECOMPARE_PROVIDER_API_KEY as server-side env vars
//   once an authorized fare provider/partner feed is selected.
// - Expected normalized response from the upstream provider:
//   { grab:{fare:14.2,eta:4,vehicle:"GrabCar"}, gojek:{...}, tada:{...} }

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
      message: 'No authorized live fare provider is configured yet.'
    });
  }

  try {
    const url = new URL(upstream);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      }
    });

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
  } catch (error) {
    return res.status(502).json({ error: 'fare_provider_unreachable' });
  }
}
