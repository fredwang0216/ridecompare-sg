# Live quote integration

## Current state

The GitHub Pages frontend is working, but GitHub Pages is static and cannot run `/api/quotes.js` as a serverless function.

The repository now contains a Vercel-compatible serverless endpoint at `api/quotes.js`. It keeps provider credentials server-side and expects an authorized upstream fare provider to return the normalized quote schema.

## Normalized response

```json
{
  "grab": { "fare": 14.20, "eta": 4, "vehicle": "GrabCar" },
  "gojek": { "fare": 12.80, "eta": 5, "vehicle": "GoCar" },
  "tada": { "fare": 11.90, "eta": 3, "vehicle": "Car" }
}
```

## Provider reality

- Grab has partner integrations and a partner portal, but the consumer fare feed is not an unauthenticated public API. An authorized partner arrangement is the preferred production route.
- Gojek publishes fare rules and dynamic pricing information, but no public consumer fare-quote API was found.
- TADA's public API documentation currently covers authenticated POS, Catalog and Merchant APIs; no public consumer ride-quote API was found.
- A third-party vendor, Actowiz Solutions, publicly advertises an on-demand Singapore fare feed covering Grab, Gojek and TADA. Their claims should be validated with a trial against the actual apps before production use.

## Security

Never put provider API keys in `index.html` or other client-side files. Use Vercel/Cloudflare/server-side environment variables.
