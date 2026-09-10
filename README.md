# RideCompare SG

Singapore ride price comparison for Grab, Gojek and TADA.

## Current product

- One origin + destination input
- Mobile-first comparison UI
- Provider result cards with fare, pickup ETA, vehicle type and dynamic-pricing flag
- Lowest-price highlighting
- One-tap provider handoff
- Last trip remembered locally on the device
- API keys kept server-side

Live site (GitHub Pages): https://fredwang0216.github.io/ridecompare-sg/

## Live quote architecture

The browser calls `GET /api/quotes?from=...&to=...`.
The serverless function in `api/quotes.js` forwards the request to an authorized fare-data provider using server-side environment variables:

```text
RIDECOMPARE_PROVIDER_API_URL
RIDECOMPARE_PROVIDER_API_KEY
```

The UI expects normalized JSON such as:

```json
{
  "grab":  {"fare":14.20,"eta":4,"vehicle":"GrabCar"},
  "gojek": {"fare":12.80,"eta":5,"vehicle":"GoCar"},
  "tada":  {"fare":11.90,"eta":3,"vehicle":"Car"}
}
```

## Deployment

GitHub Pages can serve the frontend but cannot execute `api/quotes.js`. For live quotes, deploy this same repository to a serverless host such as Vercel and configure the two environment variables there. The frontend already defaults to `/api/quotes`, so no client-side API key is required.

Provider onboarding is deliberately separated from the UI. Official partner feeds should be preferred where available; a third-party live fare feed can be used only after its coverage, terms and accuracy are verified.
