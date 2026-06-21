# Video Call Template
Run: uvicorn app:app --reload

## Deploy front-end to Vercel

- This project serves a static frontend in the `static/` folder. A `vercel.json` is included to route the site root to `static/index.html`.
- Note: Vercel serverless functions do not support persistent WebSocket connections. The FastAPI `app` (WebSocket signaling) cannot run with WebSocket support on Vercel.

Recommended deployment approach:
1. Deploy the static frontend to Vercel (this repo will serve the `static/` folder automatically).
	- Install Vercel CLI: `npm i -g vercel`
	- From the repo root run:

```bash
vercel --prod
```

2. Host the FastAPI WebSocket server on a provider that supports WebSockets (for example: Fly, Render, Railway, or a VPS).
3. Update the frontend `static/script.js` to point WebSocket connections to your external signaling server URL (e.g. `wss://your-backend.example.com/ws/<room>`).

If you'd like, I can:
- Add a small serverless fallback (HTTP polling) for Vercel (not suitable for real-time video), or
- Prepare deployment configuration for a WebSocket-capable host and update the frontend to use an environment variable for the signaling URL.

## Deploy backend to Render (recommended for WebSockets)

This repo includes a `render.yaml` to deploy the FastAPI WebSocket backend to Render's free plan.

Quick deploy steps:

1. Create a Render account and connect your Git repo.
2. In Render, create a new service from `render.yaml` or create a new Python Web Service and use these settings:
	- Build Command: `pip install -r requirements.txt`
	- Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
	- Instance Type: `Free` (or as desired)
3. Deploy. Your app will be available at `https://<your-service>.onrender.com`.

Frontend configuration:
- Use the `Signaling server` input on the main page to point the frontend to your deployed signaling server, e.g. `wss://<your-service>.onrender.com`.

If you want, I can add a `Dockerfile` for Render or generate a `fly.toml` for Fly.io instead. Tell me which one you'd prefer.

